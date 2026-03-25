using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class HashPasswords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$qmTa7qNDeFq8CuSKi9yNkuh9As1Dr9JZPD512xwv9XQuGbo9R6f1m");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$8H9kqtWdNovf4hf4BOPDFONPsNJcKmhiEsgukA5XkjjRjXHXXVVTa");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "$2a$11$ztfSfoDwWxC20pzfanWXhu.TKgRC5P4EZ3UJP4OUtRl5WAvY7NlGa");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "Admin123");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "User123");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Password",
                value: "User123");
        }
    }
}
