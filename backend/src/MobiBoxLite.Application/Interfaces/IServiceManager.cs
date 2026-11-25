using MobiBoxLite.Application.Contracts;

namespace MobiBoxLite.Application.Interfaces;

public interface IServiceManager
{
Task<PagedResult<ServiceListItemDto>> ListAsync(ServiceListQuery query, CancellationToken ct);
Task<ServiceDto> GetByIdAsync(int id, CancellationToken ct);
Task<ServiceDto> CreateAsync(CreateServiceRequest request, CancellationToken ct);
Task<ServiceDto> UpdateAsync(int id, UpdateServiceRequest request, CancellationToken ct);
Task<ServiceDto> UpdateStatusAsync(int id, UpdateStatusRequest request, CancellationToken ct);
Task DeleteAsync(int id, CancellationToken ct);
}
