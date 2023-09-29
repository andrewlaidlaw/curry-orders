using menu_apis.Models;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

namespace menu_apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{

    public static String GetEnvironmentVariable(string name, string defaultValue)
        => Environment.GetEnvironmentVariable(name) ?? defaultValue;

    private static String dbServer = GetEnvironmentVariable("DB_HOST", "localhost");
    private static String dbUser = GetEnvironmentVariable("DB_USER", "root");
    private static String dbPassword = GetEnvironmentVariable("DB_PASS", "abc1234");
    private static String dbDatabase = GetEnvironmentVariable("DB_DATABASE", "menu");

    private MySqlConnectionStringBuilder _connectionString = new MySqlConnectionStringBuilder
        {
            Server=dbServer,
            Port=3306,
            UserID=dbUser,
            Password=dbPassword,
            Database=dbDatabase
        };

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var Categories = new List<Category> {};
        
        using (var conn = new MySqlConnection(_connectionString.ConnectionString))
            {
                await conn.OpenAsync();
                using (var command = conn.CreateCommand())
                {
                    command.CommandText = "SELECT * FROM categories;";
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var category = new Category { Id = reader.GetInt32(0), CategoryId = reader.GetString(1), Name = reader.GetString(2)};
                            Categories.Add(category);
                        }
                    }
                }
            }
        return Ok(Categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> Get(int id)
    {
        var Items = new List<ShortItem> {};
        using (var conn = new MySqlConnection(_connectionString.ConnectionString))
            {
                await conn.OpenAsync();
                using (var command = conn.CreateCommand())
                {
                    command.CommandText = "SELECT id, itemtitle, price FROM menu WHERE category=" + id + ";";
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var item = new ShortItem { Id = reader.GetInt32(0), Name = reader.GetString(1), Price = reader.GetDouble(2) };
                            Items.Add(item);
                        }
                    }
                }
            }
        return Ok(Items);
    }
}
