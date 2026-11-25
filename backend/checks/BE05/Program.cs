using System.Text.Json;
using FluentValidation.Results;
using MobiBoxLite.Application.Contracts;
using MobiBoxLite.Application.Interfaces;
using MobiBoxLite.Application.Mapping;
using MobiBoxLite.Application.Validation;
using MobiBoxLite.Domain.Entities;
using MobiBoxLite.Domain.Enums;

using var tokenSource = new CancellationTokenSource();
var ct = tokenSource.Token;
var operators = new TestOperators(ct);
var create = new CreateServiceValidator(operators);
var update = new UpdateServiceValidator(operators);
var status = new UpdateStatusValidator();
var list = new ServiceListQueryValidator();

var good = new CreateServiceRequest
{
Name = "  CloudPlay Games ", Provider = "  PixelForge Studio ", OperatorId = 1,
Category = "Health & fitness", Price = 0.99m, Cycle = "Weekly", TrialDays = 0,
Keyword = "PLAY", Shortcode = "0123", NotificationUrl = "https://example.org/notify",
SendWelcomeSms = false, Status = "Active"
};
var valid = await create.ValidateAsync(good, ct);
Check(valid.IsValid, valid.ToString());
var entity = good.ToEntity();
Check(entity.Name == "CloudPlay Games" && entity.Provider == "PixelForge Studio", "Trim at mapping");
Check(entity.Category == ServiceCategory.HealthAndFitness && entity.Shortcode == "0123", "Category + shortcode");
Check(entity.SubscriberCount == 0 && entity.DeletedAt is null, "New service defaults");
Console.WriteLine("PASS create and request mapping");

var invalidCases = new (CreateServiceRequest Request, string Field, string Message)[]
{
(good with { Name = "  " }, "name", "Enter a service name."),
(good with { Provider = "" }, "provider", "Enter the content provider."),
(good with { Category = "HealthAndFitness" }, "category",
"Invalid enum value. Expected 'Games' | 'Video' | 'Education' | 'Health & fitness' | 'News', received 'HealthAndFitness'"),
(good with { Description = new string('a', 121) }, "description", "Max 120 characters."),
(good with { OperatorId = 999 }, "operatorId", "Choose an existing operator."),
(good with { Price = null }, "price", "Enter a price."),
(good with { Price = 0m }, "price", "Price must be greater than 0."),
(good with { Price = 50.01m }, "price", "Price can’t be more than $50."),
(good with { TrialDays = 2 }, "trialDays", "Invalid input"),
(good with { Keyword = "play" }, "keyword", "Use 2–10 capital letters, e.g. PLAY."),
(good with { Shortcode = "12AB" }, "shortcode", "Use 3–6 digits, e.g. 1234."),
(good with { NotificationUrl = "invalid" }, "notificationUrl", "Enter a valid URL."),
(good with { NotificationUrl = "http://example.org" }, "notificationUrl", "Enter a URL that starts with https://"),
(good with { SendWelcomeSms = null }, "sendWelcomeSms", "Required")
};
foreach (var test in invalidCases)
{
HasError(await create.ValidateAsync(test.Request, ct), test.Field, test.Message);
var forUpdate = JsonSerializer.Deserialize<UpdateServiceRequest>(JsonSerializer.Serialize(test.Request))!;
HasError(await update.ValidateAsync(forUpdate, ct), test.Field, test.Message);
}
Check((await create.ValidateAsync(good with { Price = 50m, Description = new string('a', 120) }, ct)).IsValid,
"Inclusive price and description bounds");
Console.WriteLine("PASS shared create/edit rules, camelCase keys and operator lookup");

var validUpdate = JsonSerializer.Deserialize<UpdateServiceRequest>(JsonSerializer.Serialize(good))!
with { Name = "Renamed", Status = "Paused" };
var createdAt = entity.CreatedAt;
Check((await update.ValidateAsync(validUpdate, ct)).IsValid, "Valid update");
validUpdate.ApplyTo(entity);
Check(entity.Name == "Renamed" && entity.Status == ServiceStatus.Paused &&
entity.CreatedAt == createdAt && entity.SubscriberCount == 0, "Update mapping");
Check((await status.ValidateAsync(new UpdateStatusRequest("Active"), ct)).IsValid, "Active status");
HasError(await status.ValidateAsync(new UpdateStatusRequest("Draft"), ct), "status",
"Invalid enum value. Expected 'Active' | 'Paused', received 'Draft'");
Check((await list.ValidateAsync(new ServiceListQuery(), ct)).IsValid, "Default paging");
HasError(await list.ValidateAsync(new ServiceListQuery(Page: 0), ct), "page", "Page must be at least 1.");
HasError(await list.ValidateAsync(new ServiceListQuery(PageSize: 0), ct), "pageSize", "Page size must be at least 1.");
Console.WriteLine("PASS status, update mapping and paging");

// Simulate the navigation property that EF will populate when a repository loads the operator.
var carrier = new Operator { Id = 1, Name = "Cedar Mobile" };
typeof(Service).GetProperty(nameof(Service.Operator))!.SetValue(entity, carrier);
var detail = entity.ToDto();
var row = entity.ToListItemDto();
Check(detail.Category == "Health & fitness" && detail.OperatorId == 1 &&
detail.OperatorName == carrier.Name && detail.Shortcode == "0123", "Detail labels and carrier");
Check(row.Name == entity.Name && row.Status == "Paused" && row.Cycle == "Weekly", "List row");
var json = JsonSerializer.Serialize(detail, new JsonSerializerOptions(JsonSerializerDefaults.Web));
using var doc = JsonDocument.Parse(json);
Check(doc.RootElement.GetProperty("sendWelcomeSms").GetBoolean() == false &&
doc.RootElement.GetProperty("category").GetString() == "Health & fitness" &&
!doc.RootElement.TryGetProperty("deletedAt", out _), "Public JSON contract");
Console.WriteLine("PASS list and detail response mapping");
Console.WriteLine("BE-05 checks passed.");

static void HasError(ValidationResult result, string field, string message) =>
Check(result.Errors.Any(e => e.PropertyName == field && e.ErrorMessage == message),
$"Expected {field}: {message}. Actual: {result}");

static void Check(bool passed, string detail)
{
if (!passed) throw new InvalidOperationException(detail);
}

sealed class TestOperators(CancellationToken expectedToken) : IOperatorRepository
{
public Task<bool> ExistsAsync(int id, CancellationToken ct)
{
if (ct != expectedToken) throw new InvalidOperationException("Cancellation token was lost.");
ct.ThrowIfCancellationRequested();
return Task.FromResult(id == 1);
}

public Task<IReadOnlyList<Operator>> ListAsync(CancellationToken ct) =>
    Task.FromResult<IReadOnlyList<Operator>>([new Operator { Id = 1, Name = "Cedar Mobile" }]);

}
