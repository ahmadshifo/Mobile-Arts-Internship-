namespace MobiBoxLite.Domain.Entities;

public sealed class Operator
{
    public int Id { get; init; }
    public required string Name { get; init; }

    public ICollection<Service> Services { get; } = new List<Service>();
}
