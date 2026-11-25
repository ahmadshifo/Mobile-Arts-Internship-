using MobiBoxLite.Application.Contracts;
using MobiBoxLite.Domain.Entities;
using MobiBoxLite.Domain.Enums;

namespace MobiBoxLite.Application.Mapping;

public static class ServiceMappings
{
public static OperatorDto ToDto(this Operator op) => new(op.Id, op.Name);

// Request mappings are called after successful validation.
public static Service ToEntity(this CreateServiceRequest r) => new()
{
    Name = r.Name!.Trim(),
    Provider = r.Provider!.Trim(),
    Category = ServiceLabels.Categories[r.Category!],
    Description = r.Description,
    OperatorId = r.OperatorId!.Value,
    Price = r.Price!.Value,
    Cycle = ServiceLabels.Cycles[r.Cycle!],
    TrialDays = r.TrialDays!.Value,
    Keyword = r.Keyword!,
    Shortcode = r.Shortcode!,
    NotificationUrl = r.NotificationUrl!,
    SendWelcomeSms = r.SendWelcomeSms!.Value,
    Status = ServiceLabels.Statuses[r.Status!]
};

public static void ApplyTo(this UpdateServiceRequest r, Service service)
{
    service.Name = r.Name!.Trim();
    service.Provider = r.Provider!.Trim();
    service.Category = ServiceLabels.Categories[r.Category!];
    service.Description = r.Description;
    service.OperatorId = r.OperatorId!.Value;
    service.Price = r.Price!.Value;
    service.Cycle = ServiceLabels.Cycles[r.Cycle!];
    service.TrialDays = r.TrialDays!.Value;
    service.Keyword = r.Keyword!;
    service.Shortcode = r.Shortcode!;
    service.NotificationUrl = r.NotificationUrl!;
    service.SendWelcomeSms = r.SendWelcomeSms!.Value;
    service.Status = ServiceLabels.Statuses[r.Status!];
}

public static ServiceStatus ToStatus(this UpdateStatusRequest r) =>
    ServiceLabels.Statuses[r.Status!];

public static ServiceListItemDto ToListItemDto(this Service s) => new(
    s.Id, s.Name, s.Provider, s.OperatorId, OperatorName(s),
    s.Price, s.Cycle.ToString(), s.TrialDays, s.SubscriberCount, s.Status.ToString());

public static ServiceDto ToDto(this Service s) => new(
    s.Id, s.Name, s.Provider, ServiceLabels.CategoryName(s.Category), s.Description,
    s.OperatorId, OperatorName(s), s.Price, s.Cycle.ToString(), s.TrialDays,
    s.Keyword, s.Shortcode, s.NotificationUrl, s.SendWelcomeSms,
    s.Status.ToString(), s.SubscriberCount, DateTime.SpecifyKind(s.CreatedAt, DateTimeKind.Utc));

private static string OperatorName(Service service) =>
    service.Operator?.Name ?? throw new InvalidOperationException(
        "Load the service's operator before mapping the response.");

}
