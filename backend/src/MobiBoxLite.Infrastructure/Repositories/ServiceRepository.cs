using Microsoft.EntityFrameworkCore;
using MobiBoxLite.Application.Contracts;
using MobiBoxLite.Application.Interfaces;
using MobiBoxLite.Domain.Entities;
using MobiBoxLite.Domain.Enums;
using MobiBoxLite.Infrastructure.Persistence;

namespace MobiBoxLite.Infrastructure.Repositories;

public sealed class ServiceRepository(MobiBoxDbContext db) : IServiceRepository
{
    public async Task<PagedResult<Service>> ListAsync(ServiceListQuery query, CancellationToken ct)
    {
        var rows = db.Services.AsNoTracking();
        var term = query.Search?.Trim();

        if (!string.IsNullOrEmpty(term))
            rows = rows.Where(s => s.Name.Contains(term) || s.Provider.Contains(term));

        if (query.OperatorId is int operatorId)
            rows = rows.Where(s => s.OperatorId == operatorId);

        // ServiceListQueryValidator checks the label and positive page sizes.
        if (!string.IsNullOrEmpty(query.Status))
        {
            var status = Enum.Parse<ServiceStatus>(query.Status);
            rows = rows.Where(s => s.Status == status);
        }

        var total = await rows.CountAsync(ct);
        long offset = ((long)query.Page - 1) * query.PageSize;
        if (offset >= total)
            return new PagedResult<Service>(Array.Empty<Service>(), total, query.Page, query.PageSize);

        var items = await rows.Include(s => s.Operator)
            .OrderBy(s => s.Id)
            .Skip((int)offset)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new PagedResult<Service>(items, total, query.Page, query.PageSize);
    }

    public Task<Service?> GetByIdAsync(int id, CancellationToken ct) =>
        db.Services.AsNoTracking().Include(s => s.Operator)
            .SingleOrDefaultAsync(s => s.Id == id, ct);

    public Task<Service?> GetForUpdateAsync(int id, CancellationToken ct) =>
        db.Services.AsTracking().Include(s => s.Operator)
            .SingleOrDefaultAsync(s => s.Id == id, ct);

    public async Task AddAsync(Service service, CancellationToken ct)
    {
        await db.Services.AddAsync(service, ct);
    }

    public Task<bool> CommandExistsAsync(int operatorId, string keyword, string shortcode,
        int? excludingServiceId, CancellationToken ct)
    {
        var matches = db.Services.IgnoreQueryFilters()
            .Where(s => s.OperatorId == operatorId && s.Keyword == keyword && s.Shortcode == shortcode);

        if (excludingServiceId is int id)
            matches = matches.Where(s => s.Id != id);

        return matches.AnyAsync(ct);
    }
}
