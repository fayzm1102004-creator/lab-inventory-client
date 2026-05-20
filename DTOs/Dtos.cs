namespace LabInventory.API.DTOs
{
    public class AdminLoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UserLoginDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class MaterialDto
    {
        public string MaterialName { get; set; } = string.Empty;
        public string PhysicalLocation { get; set; } = string.Empty;
        public bool IsAvailable { get; set; } = true;
        public int Quantity { get; set; }
    }

    public class SearchDto
    {
        public int LogId { get; set; }
        public string Keyword { get; set; } = string.Empty;
    }

    public class UserLogoutDto
    {
        public int LogId { get; set; }
    }
}
