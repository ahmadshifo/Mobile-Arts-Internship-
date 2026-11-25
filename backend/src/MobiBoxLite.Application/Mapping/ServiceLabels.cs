using MobiBoxLite.Domain.Enums;

namespace MobiBoxLite.Application.Mapping;

internal static class ServiceLabels
{
internal static string CategoryName(ServiceCategory category) =>
category == ServiceCategory.HealthAndFitness ? "Health & fitness" : category.ToString();

internal static readonly IReadOnlyDictionary<string, ServiceCategory> Categories =
    Enum.GetValues<ServiceCategory>().ToDictionary(CategoryName, StringComparer.Ordinal);

internal static readonly IReadOnlyDictionary<string, BillingCycle> Cycles =
    Enum.GetValues<BillingCycle>().ToDictionary(value => value.ToString(), StringComparer.Ordinal);

internal static readonly IReadOnlyDictionary<string, ServiceStatus> Statuses =
    Enum.GetValues<ServiceStatus>().ToDictionary(value => value.ToString(), StringComparer.Ordinal);

}
