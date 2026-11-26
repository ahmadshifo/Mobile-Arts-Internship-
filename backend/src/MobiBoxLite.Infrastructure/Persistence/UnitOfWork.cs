using Microsoft.EntityFrameworkCore;
using MobiBoxLite.Application.Interfaces;
using MobiBoxLite.Domain.Exceptions;
using MySqlConnector;

namespace MobiBoxLite.Infrastructure.Persistence;

public sealed class UnitOfWork(MobiBoxDbContext db) : IUnitOfWork
{
    // This is the unique index created by the BE-06 migration.
    private const string CommandIndex = "ux_services_operator_keyword_shortcode";

    public async Task<int> SaveChangesAsync(CancellationToken ct)
    {
        try
        {
            return await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException mysql
            && mysql.Number == 1062
            && (mysql.Message.EndsWith("." + CommandIndex + "'", StringComparison.OrdinalIgnoreCase)
                || mysql.Message.EndsWith("'" + CommandIndex + "'", StringComparison.OrdinalIgnoreCase)))
        {
            throw new ConflictException(
                "This operator already has a service with that keyword and shortcode.", ex);
        }
    }
}
