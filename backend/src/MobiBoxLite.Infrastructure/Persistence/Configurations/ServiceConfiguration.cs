using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MobiBoxLite.Domain.Entities;
using MobiBoxLite.Domain.Enums;

namespace MobiBoxLite.Infrastructure.Persistence.Configurations;

internal sealed class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.ToTable("services", table =>
        {
            table.HasCheckConstraint("ck_services_price", "price_usd > 0 AND price_usd <= 50");
            table.HasCheckConstraint("ck_services_trial", "trial_days IN (0, 1, 3, 7)");
            table.HasCheckConstraint("ck_services_subscribers", "subscriber_count >= 0");
            table.HasCheckConstraint("ck_services_name", "CHAR_LENGTH(TRIM(name)) > 0");
            table.HasCheckConstraint("ck_services_provider", "CHAR_LENGTH(TRIM(provider)) > 0");
        });

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("service_id").ValueGeneratedOnAdd();
        builder.Property(s => s.Name).HasColumnName("name").HasColumnType("text").IsRequired();
        builder.Property(s => s.Provider).HasColumnName("provider").HasColumnType("text").IsRequired();
        builder.Property(s => s.Category).HasColumnName("category")
            .HasConversion(
                value => value == ServiceCategory.HealthAndFitness ? "Health & fitness" : value.ToString(),
                text => text == "Health & fitness" ? ServiceCategory.HealthAndFitness : Enum.Parse<ServiceCategory>(text))
            .HasColumnType("enum('Games','Video','Education','Health & fitness','News')");
        builder.Property(s => s.Description).HasColumnName("description").HasMaxLength(120);

        builder.Property(s => s.OperatorId).HasColumnName("operator_id");
        builder.HasOne(s => s.Operator).WithMany(op => op.Services)
            .HasForeignKey(s => s.OperatorId).OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_services_operators");
        builder.Property(s => s.Price).HasColumnName("price_usd")
            .HasColumnType("decimal(10,2)").HasPrecision(10, 2);
        builder.Property(s => s.Cycle).HasColumnName("cycle")
            .HasConversion<string>().HasColumnType("enum('Daily','Weekly','Monthly')");
        builder.Property(s => s.TrialDays).HasColumnName("trial_days")
            .HasConversion<sbyte>().HasColumnType("tinyint");

        builder.Property(s => s.Keyword).HasColumnName("keyword").HasMaxLength(10).IsRequired();
        builder.Property(s => s.Shortcode).HasColumnName("shortcode").HasMaxLength(6).IsRequired();
        builder.Property(s => s.NotificationUrl).HasColumnName("notification_url").HasColumnType("text").IsRequired();
        builder.Property(s => s.SendWelcomeSms).HasColumnName("send_welcome_sms").HasColumnType("tinyint(1)");
        builder.Property(s => s.Status).HasColumnName("status")
            .HasConversion<string>().HasColumnType("enum('Active','Paused')");
        builder.Property(s => s.SubscriberCount).HasColumnName("subscriber_count").HasDefaultValue(0);
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").HasColumnType("datetime(6)");
        builder.Property(s => s.DeletedAt).HasColumnName("deleted_at").HasColumnType("datetime(6)");

        builder.HasIndex(s => new { s.OperatorId, s.Keyword, s.Shortcode })
            .IsUnique().HasDatabaseName("ux_services_operator_keyword_shortcode");
        builder.HasQueryFilter(s => s.DeletedAt == null);
    }
}
