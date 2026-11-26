using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MobiBoxLite.API.Configuration;
using MobiBoxLite.Application.Contracts;
using MobiBoxLite.Application.Interfaces;
using MobiBoxLite.Domain.Exceptions;
using MobiBoxLite.Infrastructure;
using MobiBoxLite.Infrastructure.Persistence;

if (args.Length != 1 || string.IsNullOrWhiteSpace(args[0]))
    throw new ArgumentException("Pass the API project's UserSecretsId.");

var config = new ConfigurationBuilder().AddUserSecrets(args[0]).Build();
var connection = config.GetConnectionString("MobiBox")
    ?? throw new InvalidOperationException("Set ConnectionStrings:MobiBox in the API's user secrets.");

var registrations = new ServiceCollection();
registrations.AddInfrastructure(connection);
registrations.AddServiceManagement();
await using var provider = registrations.BuildServiceProvider();
await using var scope = provider.CreateAsyncScope();
var manager = scope.ServiceProvider.GetRequiredService<IServiceManager>();
var db = scope.ServiceProvider.GetRequiredService<MobiBoxDbContext>();
using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(60));
var ct = timeout.Token;

var keyword = new string(Enumerable.Range(0, 8)
    .Select(_ => (char)Random.Shared.Next('A', 'Z' + 1)).ToArray());
var name = "BE08 " + keyword;
var create = Request<CreateServiceRequest>(1);
var edit = Request<UpdateServiceRequest>(1);

await using (var tx = await db.Database.BeginTransactionAsync(ct))
{
    var invalid = await Expect<ValidationException>(() => manager.CreateAsync(create with { Price = 0m }, ct));
    Check(invalid.Errors.Any(e => e.PropertyName == "price" && e.ErrorMessage == "Price must be greater than 0."),
        "price message");
    var unknownOp = await Expect<ValidationException>(() =>
        manager.CreateAsync(create with { OperatorId = int.MaxValue }, ct));
    Check(unknownOp.Errors.Any(e => e.PropertyName == "operatorId"), "operator validation");
    await Expect<ValidationException>(() => manager.ListAsync(new ServiceListQuery(Page: 0), ct));
    Check((await manager.ListAsync(new ServiceListQuery(Search: name), ct)).TotalCount == 0, "invalid writes rejected");
    await Expect<NotFoundException>(() => manager.GetByIdAsync(-1, ct));
    Console.WriteLine("PASS: validation errors and unknown service IDs.");

    var created = await manager.CreateAsync(create, ct);
    Check(created.Id > 0 && created.Name == name && created.OperatorName == "Cedar Mobile"
        && created.Shortcode == "0123" && created.Subscribers == 0, "saved create response");
    await Expect<ConflictException>(() => manager.CreateAsync(create, ct));
    var gulf = await manager.CreateAsync(create with { OperatorId = 2 }, ct);
    Check(gulf.OperatorName == "Gulf Connect", "command reused by another operator");
    var page = await manager.ListAsync(new ServiceListQuery(Search: name, PageSize: 1), ct);
    Check(page.TotalCount == 2 && page.Page == 1 && page.PageSize == 1 && page.Items.Count == 1
        && page.Items[0].Id == created.Id && page.Items[0].OperatorName == "Cedar Mobile", "paged DTOs");
    Console.WriteLine("PASS: create, scoped command uniqueness and paged list.");

    var renamed = await manager.UpdateAsync(created.Id, edit with { Name = name + " edited" }, ct);
    Check(renamed.Name == name + " edited" && renamed.Keyword == keyword, "own command kept on edit");
    await Expect<ConflictException>(() => manager.UpdateAsync(created.Id, edit with { OperatorId = 2 }, ct));
    Check((await manager.GetByIdAsync(created.Id, ct)).OperatorId == 1, "failed edit preserved row");
    var moved = await manager.UpdateAsync(created.Id, edit with { OperatorId = 3 }, ct);
    Check(moved.OperatorId == 3 && moved.OperatorName == "Nova Telecom"
        && moved.CreatedAt == created.CreatedAt, "changed operator and original creation time");
    await Expect<ValidationException>(() => manager.UpdateStatusAsync(created.Id, new UpdateStatusRequest("Other"), ct));
    var paused = await manager.UpdateStatusAsync(created.Id, new UpdateStatusRequest("Paused"), ct);
    var pausedAgain = await manager.UpdateStatusAsync(created.Id, new UpdateStatusRequest("Paused"), ct);
    Check(paused.Status == "Paused" && pausedAgain == paused
        && paused == (moved with { Status = "Paused" }), "status-only update and repeat");
    Console.WriteLine("PASS: edit exclusions, operator changes and repeatable status updates.");

    await manager.DeleteAsync(created.Id, ct);
    await Expect<NotFoundException>(() => manager.GetByIdAsync(created.Id, ct));
    await Expect<NotFoundException>(() => manager.UpdateAsync(created.Id, edit, ct));
    await Expect<NotFoundException>(() => manager.UpdateStatusAsync(created.Id, new UpdateStatusRequest("Active"), ct));
    await Expect<NotFoundException>(() => manager.DeleteAsync(created.Id, ct));
    await Expect<ConflictException>(() => manager.CreateAsync(create with { OperatorId = 3 }, ct));
    var afterDelete = await manager.ListAsync(new ServiceListQuery(Search: name), ct);
    Check(afterDelete.TotalCount == 1 && afterDelete.Items.Single().Id == gulf.Id, "deleted row hidden from list");
    Console.WriteLine("PASS: soft delete hides the service and preserves its reserved command.");

    await tx.RollbackAsync(ct);
}
db.ChangeTracker.Clear();
Check((await manager.ListAsync(new ServiceListQuery(Search: name), ct)).TotalCount == 0, "rollback");
Console.WriteLine("BE-08 checks passed.");

T Request<T>(int operatorId) where T : ServiceWriteRequest, new() => new T
{
    Name = "  " + name + "  ",
    Provider = "BE08 provider",
    Category = "Games",
    OperatorId = operatorId,
    Price = 1.25m,
    Cycle = "Weekly",
    TrialDays = 1,
    Keyword = keyword,
    Shortcode = "0123",
    NotificationUrl = "https://example.test/notify",
    SendWelcomeSms = true,
    Status = "Active"
};

static async Task<TException> Expect<TException>(Func<Task> action) where TException : Exception
{
    try
    {
        await action();
    }
    catch (TException ex)
    {
        return ex;
    }

    throw new InvalidOperationException("Expected " + typeof(TException).Name);
}

static void Check(bool ok, string description)
{
    if (!ok) throw new InvalidOperationException("Check failed: " + description);
}
