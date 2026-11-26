using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MobiBoxLite.Application.Contracts;
using MobiBoxLite.Application.Interfaces;
using MobiBoxLite.Domain.Entities;
using MobiBoxLite.Domain.Enums;
using MobiBoxLite.Domain.Exceptions;
using MobiBoxLite.Infrastructure;
using MobiBoxLite.Infrastructure.Persistence;

if (args.Length != 1 || string.IsNullOrWhiteSpace(args[0]))
    throw new ArgumentException("Pass the API project's UserSecretsId to this check.");

var config = new ConfigurationBuilder().AddUserSecrets(args[0]).Build();
var connection = config.GetConnectionString("MobiBox")
    ?? throw new InvalidOperationException("The API user secrets must contain ConnectionStrings:MobiBox.");

var collection = new ServiceCollection();
collection.AddInfrastructure(connection);
await using var provider = collection.BuildServiceProvider();
await using var scope = provider.CreateAsyncScope();
var services = scope.ServiceProvider.GetRequiredService<IServiceRepository>();
var operators = scope.ServiceProvider.GetRequiredService<IOperatorRepository>();
var unit = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
var db = scope.ServiceProvider.GetRequiredService<MobiBoxDbContext>();
using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(60));
var ct = timeout.Token;

var keyword = new string(Enumerable.Range(0, 8)
    .Select(_ => (char)Random.Shared.Next('A', 'Z' + 1)).ToArray());
const string shortcode = "0123";
int probeId;
await using (var tx = await db.Database.BeginTransactionAsync(ct))
{
    var catalog = await operators.ListAsync(ct);
    Require(catalog.Any(op => op.Id == 1 && op.Name == "Cedar Mobile"), "Cedar Mobile");
    Require(catalog.Any(op => op.Id == 2 && op.Name == "Gulf Connect"), "Gulf Connect");
    Require(catalog.Any(op => op.Id == 3 && op.Name == "Nova Telecom"), "Nova Telecom");
    Require(await operators.ExistsAsync(1, ct) && !await operators.ExistsAsync(-1, ct), "operator existence");

    var cloud = await services.GetByIdAsync(1, ct);
    Require(cloud?.Name == "CloudPlay Games" && cloud.Operator?.Name == "Cedar Mobile", "detail with operator");
    var first = await services.ListAsync(new ServiceListQuery(PageSize: 2), ct);
    var second = await services.ListAsync(new ServiceListQuery(Page: 2, PageSize: 2), ct);
    Require(first.Items.Count == 2 && second.Items.Count == 2 && first.TotalCount == second.TotalCount
        && first.Items[^1].Id < second.Items[0].Id, "stable, non-overlapping pages");
    var byProvider = await services.ListAsync(new ServiceListQuery("PixelForge", 1, "Active"), ct);
    Require(byProvider.Items.Any(s => s.Id == 1 && s.Operator?.Name == "Cedar Mobile"), "combined filters");
    var other = await services.ListAsync(new ServiceListQuery("CloudPlay", 2), ct);
    Require(other.Items.All(s => s.Id != 1), "operator filter excludes wrong operator");
    var wrongStatus = await services.ListAsync(new ServiceListQuery("CloudPlay", 1, "Paused"), ct);
    Require(wrongStatus.Items.All(s => s.Id != 1), "status filter excludes wrong status");
    var far = await services.ListAsync(new ServiceListQuery(Page: int.MaxValue), ct);
    Require(far.Items.Count == 0 && far.TotalCount == first.TotalCount, "out-of-range page");
    Require(!db.ChangeTracker.Entries().Any(), "read queries do not track entities");
    Console.WriteLine("PASS: operators, filtering, pagination and read-only detail.");

    var probe = Probe(1);
    await services.AddAsync(probe, ct);
    Require(!await services.CommandExistsAsync(1, keyword, shortcode, null, ct), "insert waits for save");
    await unit.SaveChangesAsync(ct);
    probeId = probe.Id;
    db.ChangeTracker.Clear();
    var tracked = await services.GetForUpdateAsync(probeId, ct)
        ?? throw new InvalidOperationException("Could not reload inserted service.");
    tracked.Name = "BE07 edited " + keyword;
    tracked.Status = ServiceStatus.Paused;
    await unit.SaveChangesAsync(ct);
    var edited = await services.GetByIdAsync(probeId, ct);
    Require(edited?.Status == ServiceStatus.Paused && edited.Name == tracked.Name, "tracked changes saved");
    var byName = await services.ListAsync(new ServiceListQuery(tracked.Name), ct);
    Require(byName.TotalCount == 1 && byName.Items.Single().Id == probeId, "name search");
    Require(!await services.CommandExistsAsync(1, keyword, shortcode, probeId, ct), "edit excludes its own ID");

    tracked.SoftDelete();
    await unit.SaveChangesAsync(ct);
    Require(await services.GetByIdAsync(probeId, ct) is null, "deleted detail hidden");
    Require(await services.GetForUpdateAsync(probeId, ct) is null, "deleted update target hidden");
    var visible = await services.ListAsync(new ServiceListQuery(tracked.Name), ct);
    Require(visible.TotalCount == 0 && visible.Items.Count == 0, "deleted list row hidden");
    Require(await services.CommandExistsAsync(1, keyword, shortcode, null, ct), "deleted key still reserved");
    Require(!await services.CommandExistsAsync(2, keyword, shortcode, null, ct), "operator-specific reservation");
    await services.AddAsync(Probe(2), ct);
    await unit.SaveChangesAsync(ct);
    Console.WriteLine("PASS: add, edit, status, soft delete and operator-specific reservation.");

    // Bypass the pre-check deliberately to exercise the database constraint.
    await services.AddAsync(Probe(1), ct);
    try
    {
        await unit.SaveChangesAsync(ct);
        throw new InvalidOperationException("A duplicate command was saved.");
    }
    catch (ConflictException)
    {
        Console.WriteLine("PASS: MySQL duplicate on the command index becomes ConflictException.");
    }

    await tx.RollbackAsync(ct);
}
db.ChangeTracker.Clear();
Require(!await services.CommandExistsAsync(1, keyword, shortcode, null, ct)
    && !await services.CommandExistsAsync(2, keyword, shortcode, null, ct), "temporary writes rolled back");
Console.WriteLine("BE-07 checks passed.");

Service Probe(int operatorId) => new()
{
    Name = "BE07 probe " + keyword,
    Provider = "BE07 test",
    Category = ServiceCategory.Games,
    OperatorId = operatorId,
    Price = 1.25m,
    Cycle = BillingCycle.Weekly,
    TrialDays = 1,
    Keyword = keyword,
    Shortcode = shortcode,
    NotificationUrl = "https://example.test/notify",
    SendWelcomeSms = false,
    Status = ServiceStatus.Active
};

static void Require(bool passed, string what)
{
    if (!passed)
        throw new InvalidOperationException("Check failed: " + what);
}
