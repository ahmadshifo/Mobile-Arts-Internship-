using MobiBoxLite.Domain.Enums;

namespace MobiBoxLite.Domain.Entities;

public sealed class Service
{
    public int Id { get; init; }

    public required string Name { get; set; }
    public required string Provider { get; set; }
    public required ServiceCategory Category { get; set; }
    public string? Description { get; set; }

    public required int OperatorId { get; set; }
    public Operator? Operator { get; private set; }
    public required decimal Price { get; set; }
    public required BillingCycle Cycle { get; set; }
    public required int TrialDays { get; set; }

    public required string Keyword { get; set; }
    public required string Shortcode { get; set; }
    public required string NotificationUrl { get; set; }
    public required bool SendWelcomeSms { get; set; }
    public required ServiceStatus Status { get; set; }

    public int SubscriberCount { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; private set; }

    public void SoftDelete()
    {
        DeletedAt ??= DateTime.UtcNow;
    }
}
