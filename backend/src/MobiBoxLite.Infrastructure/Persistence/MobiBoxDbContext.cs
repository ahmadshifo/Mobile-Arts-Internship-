using Microsoft.EntityFrameworkCore;
using MobiBoxLite.Domain.Entities;
using MobiBoxLite.Infrastructure.Persistence.Configurations;

namespace MobiBoxLite.Infrastructure.Persistence;

public sealed class MobiBoxDbContext(DbContextOptions<MobiBoxDbContext> options) : DbContext(options)
{
    public DbSet<Operator> Operators => Set<Operator>();
    public DbSet<Service> Services => Set<Service>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasCharSet("utf8mb4");
        modelBuilder.ApplyConfiguration(new OperatorConfiguration());
        modelBuilder.ApplyConfiguration(new ServiceConfiguration());
        CatalogSeed.Configure(modelBuilder);
    }
}
