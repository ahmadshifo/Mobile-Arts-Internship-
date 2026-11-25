using FluentValidation;
using MobiBoxLite.Application.Contracts;
using MobiBoxLite.Application.Interfaces;
using MobiBoxLite.Application.Mapping;

namespace MobiBoxLite.Application.Validation;

public abstract class ServiceWriteValidator<T> : AbstractValidator<T> where T : ServiceWriteRequest
{
protected ServiceWriteValidator(IOperatorRepository operators)
{
RuleLevelCascadeMode = CascadeMode.Stop;

    RuleFor(r => r.Name)
        .NotNull().WithMessage("Required")
        .NotEmpty().WithMessage("Enter a service name.")
        .OverridePropertyName("name");

    RuleFor(r => r.Provider)
        .NotNull().WithMessage("Required")
        .NotEmpty().WithMessage("Enter the content provider.")
        .OverridePropertyName("provider");

    RuleFor(r => r.Category).OneOf(ServiceLabels.Categories).OverridePropertyName("category");
    RuleFor(r => r.Description).MaximumLength(120).WithMessage("Max 120 characters.")
        .OverridePropertyName("description");

    RuleFor(r => r.OperatorId)
        .NotNull().WithMessage("Required")
        .Must(id => id > 0).WithMessage("Choose an existing operator.")
        .MustAsync((id, ct) => operators.ExistsAsync(id!.Value, ct))
        .WithMessage("Choose an existing operator.")
        .OverridePropertyName("operatorId");

    RuleFor(r => r.Price)
        .NotNull().WithMessage("Enter a price.")
        .Must(price => price > 0m).WithMessage("Price must be greater than 0.")
        .Must(price => price <= 50m).WithMessage("Price can’t be more than $50.")
        .OverridePropertyName("price");

    RuleFor(r => r.Cycle).OneOf(ServiceLabels.Cycles).OverridePropertyName("cycle");
    RuleFor(r => r.TrialDays).Must(days => days is 0 or 1 or 3 or 7)
        .WithMessage(r => r.TrialDays is null ? "Expected number, received nan" : "Invalid input")
        .OverridePropertyName("trialDays");

    RuleFor(r => r.Keyword)
        .NotNull().WithMessage("Required")
        .Matches(@"\A[A-Z]{2,10}\z").WithMessage("Use 2–10 capital letters, e.g. PLAY.")
        .OverridePropertyName("keyword");

    RuleFor(r => r.Shortcode)
        .NotNull().WithMessage("Required")
        .Matches(@"\A[0-9]{3,6}\z").WithMessage("Use 3–6 digits, e.g. 1234.")
        .OverridePropertyName("shortcode");

    RuleFor(r => r.NotificationUrl)
        .NotNull().WithMessage("Required")
        .Must(IsAbsoluteUrl).WithMessage("Enter a valid URL.")
        .Must(url => url!.StartsWith("https://", StringComparison.Ordinal))
        .WithMessage("Enter a URL that starts with https://")
        .OverridePropertyName("notificationUrl");

    RuleFor(r => r.SendWelcomeSms).NotNull().WithMessage("Required")
        .OverridePropertyName("sendWelcomeSms");
    RuleFor(r => r.Status).OneOf(ServiceLabels.Statuses).OverridePropertyName("status");
}

private static bool IsAbsoluteUrl(string? value) =>
    value is not null && Uri.TryCreate(value, UriKind.Absolute, out var uri)
    && value.Contains(':') && (!uri.IsFile || value.StartsWith("file:", StringComparison.OrdinalIgnoreCase));

}

public sealed class CreateServiceValidator(IOperatorRepository operators)
: ServiceWriteValidator<CreateServiceRequest>(operators) { }

public sealed class UpdateServiceValidator(IOperatorRepository operators)
: ServiceWriteValidator<UpdateServiceRequest>(operators) { }

public sealed class UpdateStatusValidator : AbstractValidator<UpdateStatusRequest>
{
public UpdateStatusValidator() =>
RuleFor(r => r.Status).OneOf(ServiceLabels.Statuses).OverridePropertyName("status");
}

public sealed class ServiceListQueryValidator : AbstractValidator<ServiceListQuery>
{
public ServiceListQueryValidator()
{
RuleFor(q => q.Page).GreaterThan(0).WithMessage("Page must be at least 1.")
.OverridePropertyName("page");
RuleFor(q => q.PageSize).GreaterThan(0).WithMessage("Page size must be at least 1.")
.OverridePropertyName("pageSize");
RuleFor(q => q.OperatorId).Must(id => id is null or > 0)
.WithMessage("Operator ID must be greater than 0.").OverridePropertyName("operatorId");
RuleFor(q => q.Status).OneOf(ServiceLabels.Statuses)
.When(q => !string.IsNullOrEmpty(q.Status)).OverridePropertyName("status");
}
}

internal static class ChoiceRules
{
// Zod 3 supplies this message for z.enum when the input is an unknown string.
internal static IRuleBuilderOptions<T, string?> OneOf<T, TValue>(
this IRuleBuilder<T, string?> rule, IReadOnlyDictionary<string, TValue> choices)
{
var expected = string.Join(" | ", choices.Keys.Select(key => $"'{key}'"));
return rule.Must(value => value is not null && choices.ContainsKey(value))
.WithMessage((_, value) => value is null
? "Required"
: $"Invalid enum value. Expected {expected}, received '{value}'");
}
}
