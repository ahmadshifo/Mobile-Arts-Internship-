using MobiBoxLite.Domain.Entities;

namespace MobiBoxLite.Application.Interfaces;

public interface IOperatorRepository
{
Task<IReadOnlyList<Operator>> ListAsync(CancellationToken ct);
Task<bool> ExistsAsync(int id, CancellationToken ct);
}
