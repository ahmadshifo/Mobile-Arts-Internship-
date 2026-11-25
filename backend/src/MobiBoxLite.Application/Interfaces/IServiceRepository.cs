using MobiBoxLite.Application.Contracts;
using MobiBoxLite.Domain.Entities;

namespace MobiBoxLite.Application.Interfaces;

public interface IServiceRepository
{
// List and detail reads exclude soft-deleted rows and load the operator.
Task<PagedResult<Service>> ListAsync(ServiceListQuery query, CancellationToken ct);
Task<Service?> GetByIdAsync(int id, CancellationToken ct);

// Keep the row tracked for PUT, status changes and soft deletion.
Task<Service?> GetForUpdateAsync(int id, CancellationToken ct);
Task AddAsync(Service service, CancellationToken ct);

// Include deleted rows. On edit, exclude only the service being edited.
Task<bool> CommandExistsAsync(int operatorId, string keyword, string shortcode,
    int? excludingServiceId, CancellationToken ct);

}
