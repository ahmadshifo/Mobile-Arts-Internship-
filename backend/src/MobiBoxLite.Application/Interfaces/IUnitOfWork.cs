namespace MobiBoxLite.Application.Interfaces;

public interface IUnitOfWork
{
Task<int> SaveChangesAsync(CancellationToken ct);
}
