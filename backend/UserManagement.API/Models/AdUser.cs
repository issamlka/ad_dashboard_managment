namespace UserManagement.API.Models
{
    public class AdUser
    {
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
    }
}