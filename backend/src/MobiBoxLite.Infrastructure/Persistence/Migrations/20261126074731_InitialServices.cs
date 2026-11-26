using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MobiBoxLite.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialServices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "operators",
                columns: table => new
                {
                    operator_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_operators", x => x.operator_id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "services",
                columns: table => new
                {
                    service_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "text", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    provider = table.Column<string>(type: "text", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    category = table.Column<string>(type: "enum('Games','Video','Education','Health & fitness','News')", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "varchar(120)", maxLength: 120, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    operator_id = table.Column<int>(type: "int", nullable: false),
                    price_usd = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    cycle = table.Column<string>(type: "enum('Daily','Weekly','Monthly')", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    trial_days = table.Column<sbyte>(type: "tinyint", nullable: false),
                    keyword = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    shortcode = table.Column<string>(type: "varchar(6)", maxLength: 6, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    notification_url = table.Column<string>(type: "text", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    send_welcome_sms = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    status = table.Column<string>(type: "enum('Active','Paused')", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    subscriber_count = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_services", x => x.service_id);
                    table.CheckConstraint("ck_services_name", "CHAR_LENGTH(TRIM(name)) > 0");
                    table.CheckConstraint("ck_services_price", "price_usd > 0 AND price_usd <= 50");
                    table.CheckConstraint("ck_services_provider", "CHAR_LENGTH(TRIM(provider)) > 0");
                    table.CheckConstraint("ck_services_subscribers", "subscriber_count >= 0");
                    table.CheckConstraint("ck_services_trial", "trial_days IN (0, 1, 3, 7)");
                    table.ForeignKey(
                        name: "fk_services_operators",
                        column: x => x.operator_id,
                        principalTable: "operators",
                        principalColumn: "operator_id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "operators",
                columns: new[] { "operator_id", "name" },
                values: new object[,]
                {
                    { 1, "Cedar Mobile" },
                    { 2, "Gulf Connect" },
                    { 3, "Nova Telecom" }
                });

            migrationBuilder.InsertData(
                table: "services",
                columns: new[] { "service_id", "category", "created_at", "cycle", "deleted_at", "description", "keyword", "name", "notification_url", "operator_id", "price_usd", "provider", "send_welcome_sms", "shortcode", "status", "subscriber_count", "trial_days" },
                values: new object[,]
                {
                    { 1, "Games", new DateTime(2026, 9, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Weekly", null, "Play console-quality games on your phone with no downloads.", "PLAY", "CloudPlay Games", "https://api.pixelforge.example/dcb/notify", 1, 0.99m, "PixelForge Studio", true, "1234", "Active", 18420, (sbyte)1 },
                    { 2, "Video", new DateTime(2026, 9, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Weekly", null, "Watch short videos and discover new entertainment every week.", "REELS", "Reels Video", "https://api.frameline.example/dcb/notify", 2, 1.49m, "Frameline Media", true, "2345", "Active", 12905, (sbyte)3 },
                    { 3, "Education", new DateTime(2026, 9, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Monthly", null, "Explore fun learning activities and educational content for children.", "LEARN", "Kids Learn", "https://api.brightsteps.example/dcb/notify", 3, 2.99m, "BrightSteps", true, "3456", "Active", 6310, (sbyte)7 },
                    { 4, "Health & fitness", new DateTime(2026, 9, 12, 0, 0, 0, 0, DateTimeKind.Utc), "Daily", null, "Build healthy habits with daily workouts and fitness tips.", "FIT", "FitDaily", "https://api.pulselabs.example/dcb/notify", 1, 0.49m, "Pulse Labs", false, "4567", "Paused", 9870, (sbyte)0 },
                    { 5, "News", new DateTime(2026, 9, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Weekly", null, "Stay informed with the latest headlines and weekly news updates.", "NEWS", "Headline Hub", "https://api.inkwell.example/dcb/notify", 2, 0.99m, "Inkwell News", false, "5678", "Paused", 725, (sbyte)0 }
                });

            migrationBuilder.CreateIndex(
                name: "ux_operators_name",
                table: "operators",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_services_operator_keyword_shortcode",
                table: "services",
                columns: new[] { "operator_id", "keyword", "shortcode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "services");

            migrationBuilder.DropTable(
                name: "operators");
        }
    }
}
