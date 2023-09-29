namespace menu_apis.Models;

public class Item
{
    public string Name { get; set; } = "Unknown";

    public double Price { get; set; } = 0;

    public string? Description { get; set; } 

    public int Id { get; set; }
}

public class ShortItem
{
    public string Name { get; set; } = "Unknown";

    public double Price { get; set; } = 0;

    public int Id { get; set; }
}

public class Category
{
    public int Id { get; set; }

    public string Name { get; set; } = "Unknown";

    public string CategoryId {get; set; } = "Unknown";
}