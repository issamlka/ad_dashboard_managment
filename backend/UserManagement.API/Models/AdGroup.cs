namespace UserManagement.API.Models
{
    public class AdGroup
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int MemberCount { get; set; }
    }
}