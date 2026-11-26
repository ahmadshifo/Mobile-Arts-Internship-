using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MobiBoxLite.Application.Interfaces;
using MobiBoxLite.Infrastructure.Persistence;
using MobiBoxLite.Infrastructure.Repositories;

namespace MobiBoxLite.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        var serverVersion = new MySqlServerVersion(new Version(8, 4, 13));
        services.AddDbContext<MobiBoxDbContext>(options => options.UseMySql(connectionString, serverVersion));
        services.AddScoped<IServiceRepository, ServiceRepository>();
        services.AddScoped<IOperatorRepository, OperatorRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        return services;
    }
}
