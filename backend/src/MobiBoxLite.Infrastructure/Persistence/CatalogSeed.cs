using Microsoft.EntityFrameworkCore;
using MobiBoxLite.Domain.Entities;
using MobiBoxLite.Domain.Enums;

namespace MobiBoxLite.Infrastructure.Persistence;

internal static class CatalogSeed
{
    public static void Configure(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Operator>().HasData(
            new Operator { Id = 1, Name = "Cedar Mobile" },
            new Operator { Id = 2, Name = "Gulf Connect" },
            new Operator { Id = 3, Name = "Nova Telecom" });

        modelBuilder.Entity<Service>().HasData(
            new Service
            {
                Id = 1,
                Name = "CloudPlay Games",
                Provider = "PixelForge Studio",
                Category = ServiceCategory.Games,
                Description = "Play console-quality games on your phone with no downloads.",
                OperatorId = 1,
                Price = 0.99m,
                Cycle = BillingCycle.Weekly,
                TrialDays = 1,
                Keyword = "PLAY",
                Shortcode = "1234",
                NotificationUrl = "https://api.pixelforge.example/dcb/notify",
                SendWelcomeSms = true,
                Status = ServiceStatus.Active,
                SubscriberCount = 18420,
                CreatedAt = new DateTime(2026, 9, 2, 0, 0, 0, DateTimeKind.Utc)
            },
            new Service
            {
                Id = 2,
                Name = "Reels Video",
                Provider = "Frameline Media",
                Category = ServiceCategory.Video,
                Description = "Watch short videos and discover new entertainment every week.",
                OperatorId = 2,
                Price = 1.49m,
                Cycle = BillingCycle.Weekly,
                TrialDays = 3,
                Keyword = "REELS",
                Shortcode = "2345",
                NotificationUrl = "https://api.frameline.example/dcb/notify",
                SendWelcomeSms = true,
                Status = ServiceStatus.Active,
                SubscriberCount = 12905,
                CreatedAt = new DateTime(2026, 9, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new Service
            {
                Id = 3,
                Name = "Kids Learn",
                Provider = "BrightSteps",
                Category = ServiceCategory.Education,
                Description = "Explore fun learning activities and educational content for children.",
                OperatorId = 3,
                Price = 2.99m,
                Cycle = BillingCycle.Monthly,
                TrialDays = 7,
                Keyword = "LEARN",
                Shortcode = "3456",
                NotificationUrl = "https://api.brightsteps.example/dcb/notify",
                SendWelcomeSms = true,
                Status = ServiceStatus.Active,
                SubscriberCount = 6310,
                CreatedAt = new DateTime(2026, 9, 8, 0, 0, 0, DateTimeKind.Utc)
            },
            new Service
            {
                Id = 4,
                Name = "FitDaily",
                Provider = "Pulse Labs",
                Category = ServiceCategory.HealthAndFitness,
                Description = "Build healthy habits with daily workouts and fitness tips.",
                OperatorId = 1,
                Price = 0.49m,
                Cycle = BillingCycle.Daily,
                TrialDays = 0,
                Keyword = "FIT",
                Shortcode = "4567",
                NotificationUrl = "https://api.pulselabs.example/dcb/notify",
                SendWelcomeSms = false,
                Status = ServiceStatus.Paused,
                SubscriberCount = 9870,
                CreatedAt = new DateTime(2026, 9, 12, 0, 0, 0, DateTimeKind.Utc)
            },
            new Service
            {
                Id = 5,
                Name = "Headline Hub",
                Provider = "Inkwell News",
                Category = ServiceCategory.News,
                Description = "Stay informed with the latest headlines and weekly news updates.",
                OperatorId = 2,
                Price = 0.99m,
                Cycle = BillingCycle.Weekly,
                TrialDays = 0,
                Keyword = "NEWS",
                Shortcode = "5678",
                NotificationUrl = "https://api.inkwell.example/dcb/notify",
                SendWelcomeSms = false,
                Status = ServiceStatus.Paused,
                SubscriberCount = 725,
                CreatedAt = new DateTime(2026, 9, 15, 0, 0, 0, DateTimeKind.Utc)
            });
    }
}
