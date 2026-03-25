namespace UserManagement.API.Models
{
    public class UserPermission
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        // AD Permissions
        public bool CanCreateAdUsers { get; set; } = false;
        public bool CanDisableEnableAdUsers { get; set; } = false;

        /*
        // DB Permissions
        public bool CanCreateDbUsers { get; set; } = false;
        public bool CanEditDbUsers { get; set; } = false;
        public bool CanDeleteDbUsers { get; set; } = false;
        */

        // Navigation property
        public User? User { get; set; }
    }
}