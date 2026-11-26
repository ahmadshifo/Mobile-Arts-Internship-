using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using MobiBoxLite.Application.Contracts;
using MobiBoxLite.Application.Interfaces;
using MobiBoxLite.Application.Services;
using MobiBoxLite.Application.Validation;

namespace MobiBoxLite.API.Configuration;

public static class ServiceManagementRegistration
{
    public static IServiceCollection AddServiceManagement(this IServiceCollection services)
    {
        services.AddScoped<IValidator<ServiceListQuery>, ServiceListQueryValidator>();
        services.AddScoped<IValidator<CreateServiceRequest>, CreateServiceValidator>();
        services.AddScoped<IValidator<UpdateServiceRequest>, UpdateServiceValidator>();
        services.AddScoped<IValidator<UpdateStatusRequest>, UpdateStatusValidator>();
        services.AddScoped<IServiceManager, ServiceManager>();
        return services;
    }
}
