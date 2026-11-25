namespace MobiBoxLite.Application.Contracts;

public abstract record ServiceWriteRequest
{
public string? Name { get; init; }
public string? Provider { get; init; }
public string? Category { get; init; }
public string? Description { get; init; }
public int? OperatorId { get; init; }
public decimal? Price { get; init; }
public string? Cycle { get; init; }
public int? TrialDays { get; init; }
public string? Keyword { get; init; }
public string? Shortcode { get; init; }
public string? NotificationUrl { get; init; }
public bool? SendWelcomeSms { get; init; }
public string? Status { get; init; }
}

public sealed record CreateServiceRequest : ServiceWriteRequest;
public sealed record UpdateServiceRequest : ServiceWriteRequest;
public sealed record UpdateStatusRequest(string? Status);

public sealed record ServiceListQuery(
string? Search = null,
int? OperatorId = null,
string? Status = null,
int Page = 1,
int PageSize = 20);
