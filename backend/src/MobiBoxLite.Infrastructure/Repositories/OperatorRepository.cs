using Microsoft.EntityFrameworkCore;
using MobiBoxLite.Application.Interfaces;
using MobiBoxLite.Domain.Entities;
using MobiBoxLite.Infrastructure.Persistence;

namespace MobiBoxLite.Infrastructure.Repositories;

public sealed class OperatorRepository(MobiBoxDbContext db) : IOperatorRepository
{
    public async Task<IReadOnlyList<Operator>> ListAsync(CancellationToken ct) =>
        await db.Operators.AsNoTracking().OrderBy(op => op.Id).ToListAsync(ct);

    public Task<bool> ExistsAsync(int id, CancellationToken ct) =>
        db.Operators.AnyAsync(op => op.Id == id, ct);
}
