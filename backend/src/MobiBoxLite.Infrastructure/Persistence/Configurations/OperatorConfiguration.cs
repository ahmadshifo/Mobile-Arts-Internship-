using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MobiBoxLite.Domain.Entities;

namespace MobiBoxLite.Infrastructure.Persistence.Configurations;

internal sealed class OperatorConfiguration : IEntityTypeConfiguration<Operator>
{
    public void Configure(EntityTypeBuilder<Operator> builder)
    {
        builder.ToTable("operators");
        builder.HasKey(op => op.Id);
        builder.Property(op => op.Id).HasColumnName("operator_id").ValueGeneratedOnAdd();
        builder.Property(op => op.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.HasIndex(op => op.Name).IsUnique().HasDatabaseName("ux_operators_name");
    }
}
