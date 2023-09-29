using menu_apis.Models;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

namespace menu_apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
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
        var Items = new List<Item> {};
        
        using (var conn = new MySqlConnection(_connectionString.ConnectionString))
            {
                await conn.OpenAsync();
                using (var command = conn.CreateCommand())
                {
                    command.CommandText = "SELECT * FROM menu;";
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var item = new Item { Id = reader.GetInt32(0), Name = reader.GetString(2), Description = reader.GetString(3), Price = reader.GetDouble(4) };
                            Items.Add(item);
                        }
                    }
                }
            }
        return Ok(Items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> Get(int id)
    {
        var item = new Item {};
        
        using (var conn = new MySqlConnection(_connectionString.ConnectionString))
            {
                await conn.OpenAsync();
                using (var command = conn.CreateCommand())
                {
                    command.CommandText = "SELECT * FROM menu WHERE id= " + id + ";";
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            item = new Item { Id = reader.GetInt32(0), Name = reader.GetString(2), Description = reader.GetString(3), Price = reader.GetDouble(4) };
                        }
                    }
                }
            }
        return Ok(item);
    }
   

}
