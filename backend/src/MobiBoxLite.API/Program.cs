using MobiBoxLite.API.Configuration;
using MobiBoxLite.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("MobiBox")
    ?? throw new InvalidOperationException("Set ConnectionStrings:MobiBox for the API project.");

builder.Services.AddInfrastructure(connectionString);
builder.Services.AddServiceManagement();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
