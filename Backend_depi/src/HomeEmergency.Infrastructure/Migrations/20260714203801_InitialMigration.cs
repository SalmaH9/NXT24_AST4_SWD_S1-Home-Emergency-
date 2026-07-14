using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HomeEmergency.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "Description", "Name", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { new Guid("05f69c31-7df2-4f60-da12-4fba5f4df0f8"), new DateTime(2026, 7, 14, 20, 38, 0, 267, DateTimeKind.Utc).AddTicks(9490), null, "Bugs, insects, and rodents elimination services.", "Pest Control", null, null },
                    { new Guid("16f7ad42-8df3-4f71-eb23-5fca6f5e01f9"), new DateTime(2026, 7, 14, 20, 38, 0, 267, DateTimeKind.Utc).AddTicks(9494), null, "Any other emergency maintenance services.", "Other", null, null },
                    { new Guid("a9e03c7b-1df6-4f04-d456-8fa59de7f4b2"), new DateTime(2026, 7, 14, 20, 38, 0, 267, DateTimeKind.Utc).AddTicks(9413), null, "Door, window, locks, and furniture repair services.", "Carpentry", null, null },
                    { new Guid("b0f14d8c-2df7-4f15-e567-9fa60ef8f5c3"), new DateTime(2026, 7, 14, 20, 38, 0, 267, DateTimeKind.Utc).AddTicks(9415), null, "Wall painting, touch-ups, and water damage cover-ups.", "Painting", null, null },
                    { new Guid("c1f25e9d-3df8-4f26-f678-0fa71f09f6d4"), new DateTime(2026, 7, 14, 20, 38, 0, 267, DateTimeKind.Utc).AddTicks(9418), null, "Wall repairs, tiles fixes, cement, and concrete touch-ups.", "Masonry", null, null },
                    { new Guid("d2b512c8-8df3-4c91-a123-5e926ab4d1ef"), new DateTime(2026, 7, 14, 20, 38, 0, 267, DateTimeKind.Utc).AddTicks(9396), null, "Plumbing repairs, leaks, blocks, and piping emergencies.", "Plumbing", null, null },
                    { new Guid("d2f36f0e-4df9-4f37-a789-1fa82f1af7e5"), new DateTime(2026, 7, 14, 20, 38, 0, 267, DateTimeKind.Utc).AddTicks(9481), null, "Emergency home cleaning, post-leak cleanups, and sanitization.", "Cleaning", null, null },
                    { new Guid("e3f47a1f-5df0-4f48-b890-2fa93f2bf8f6"), new DateTime(2026, 7, 14, 20, 38, 0, 267, DateTimeKind.Utc).AddTicks(9484), null, "Trimming, yard maintenance, and outdoor cleanups.", "Gardening", null, null },
                    { new Guid("e7c81a5f-9bf4-4d82-b234-6f937bc5d2f0"), new DateTime(2026, 7, 14, 20, 38, 0, 267, DateTimeKind.Utc).AddTicks(9406), null, "Short circuits, wiring issues, power cuts, and electrical emergencies.", "Electrical", null, null },
                    { new Guid("f4f58b20-6df1-4f59-c901-3faa4f3cf9f7"), new DateTime(2026, 7, 14, 20, 38, 0, 267, DateTimeKind.Utc).AddTicks(9487), null, "Oven, fridge, washing machine, and stove emergency fixes.", "Appliance Repair", null, null },
                    { new Guid("f8d92b6a-0cf5-4e93-c345-7fa48cd6e3a1"), new DateTime(2026, 7, 14, 20, 38, 0, 267, DateTimeKind.Utc).AddTicks(9410), null, "Air conditioning fixes, cooling issues, and gas refilling.", "AC Repair", null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("05f69c31-7df2-4f60-da12-4fba5f4df0f8"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("16f7ad42-8df3-4f71-eb23-5fca6f5e01f9"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("a9e03c7b-1df6-4f04-d456-8fa59de7f4b2"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("b0f14d8c-2df7-4f15-e567-9fa60ef8f5c3"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("c1f25e9d-3df8-4f26-f678-0fa71f09f6d4"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("d2b512c8-8df3-4c91-a123-5e926ab4d1ef"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("d2f36f0e-4df9-4f37-a789-1fa82f1af7e5"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("e3f47a1f-5df0-4f48-b890-2fa93f2bf8f6"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("e7c81a5f-9bf4-4d82-b234-6f937bc5d2f0"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("f4f58b20-6df1-4f59-c901-3faa4f3cf9f7"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("f8d92b6a-0cf5-4e93-c345-7fa48cd6e3a1"));
        }
    }
}
