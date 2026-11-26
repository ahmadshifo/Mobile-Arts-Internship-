using FluentValidation;
using MobiBoxLite.Application.Contracts;
using MobiBoxLite.Application.Interfaces;
using MobiBoxLite.Application.Mapping;
using MobiBoxLite.Domain.Entities;
using MobiBoxLite.Domain.Exceptions;

namespace MobiBoxLite.Application.Services;

public sealed class ServiceManager(
    IServiceRepository services,
    IUnitOfWork unitOfWork,
    IValidator<ServiceListQuery> listValidator,
    IValidator<CreateServiceRequest> createValidator,
    IValidator<UpdateServiceRequest> updateValidator,
    IValidator<UpdateStatusRequest> statusValidator) : IServiceManager
{
    public async Task<PagedResult<ServiceListItemDto>> ListAsync(ServiceListQuery query, CancellationToken ct)
    {
        await listValidator.ValidateAndThrowAsync(query, ct);
        var page = await services.ListAsync(query, ct);
        var items = page.Items.Select(service => service.ToListItemDto()).ToArray();
        return new PagedResult<ServiceListItemDto>(items, page.TotalCount, page.Page, page.PageSize);
    }

    public async Task<ServiceDto> GetByIdAsync(int id, CancellationToken ct)
    {
        var service = await services.GetByIdAsync(id, ct) ?? throw Missing(id);
        return service.ToDto();
    }

    public async Task<ServiceDto> CreateAsync(CreateServiceRequest request, CancellationToken ct)
    {
        await createValidator.ValidateAndThrowAsync(request, ct);
        await EnsureCommandAvailableAsync(request, null, ct);

        var service = request.ToEntity();
        await services.AddAsync(service, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return await GetByIdAsync(service.Id, ct);
    }

    public async Task<ServiceDto> UpdateAsync(int id, UpdateServiceRequest request, CancellationToken ct)
    {
        var service = await GetForUpdateAsync(id, ct);
        await updateValidator.ValidateAndThrowAsync(request, ct);
        await EnsureCommandAvailableAsync(request, id, ct);

        request.ApplyTo(service);
        await unitOfWork.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<ServiceDto> UpdateStatusAsync(int id, UpdateStatusRequest request, CancellationToken ct)
    {
        var service = await GetForUpdateAsync(id, ct);
        await statusValidator.ValidateAndThrowAsync(request, ct);

        service.Status = request.ToStatus();
        await unitOfWork.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var service = await GetForUpdateAsync(id, ct);
        service.SoftDelete();
        await unitOfWork.SaveChangesAsync(ct);
    }

    private async Task<Service> GetForUpdateAsync(int id, CancellationToken ct) =>
        await services.GetForUpdateAsync(id, ct) ?? throw Missing(id);

    private async Task EnsureCommandAvailableAsync(ServiceWriteRequest request, int? excludingId, CancellationToken ct)
    {
        // The write validator has already checked these required fields.
        if (await services.CommandExistsAsync(request.OperatorId!.Value, request.Keyword!,
                request.Shortcode!, excludingId, ct))
        {
            throw new ConflictException("This operator already has a service with that keyword and shortcode.");
        }
    }

    private static NotFoundException Missing(int id) => new($"Service {id} was not found.");
}
