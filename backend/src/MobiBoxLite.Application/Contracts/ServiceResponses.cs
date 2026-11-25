namespace MobiBoxLite.Application.Contracts;

public sealed record OperatorDto(int Id, string Name);

public sealed record PagedResult<T>(
IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);

public sealed record ServiceListItemDto(
int Id, string Name, string Provider, int OperatorId, string OperatorName,
decimal Price, string Cycle, int TrialDays, int Subscribers, string Status);

public sealed record ServiceDto(
int Id, string Name, string Provider, string Category, string? Description,
int OperatorId, string OperatorName, decimal Price, string Cycle, int TrialDays,
string Keyword, string Shortcode, string NotificationUrl, bool SendWelcomeSms,
string Status, int Subscribers, DateTime CreatedAt);
