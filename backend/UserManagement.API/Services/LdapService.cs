using System.DirectoryServices;
using System.DirectoryServices.AccountManagement;
using UserManagement.API.Models;

namespace UserManagement.API.Services
{
    public class LdapService
    {
        private readonly IConfiguration _configuration;
        private readonly string _server;
        private readonly string _domain;
        private readonly string _searchBase;
        private readonly string _adminUsername;
        private readonly string _adminPassword;

        public LdapService(IConfiguration configuration)
        {
            _configuration = configuration;
            _server = configuration["LdapSettings:Server"]!;
            _domain = configuration["LdapSettings:Domain"]!;
            _searchBase = configuration["LdapSettings:SearchBase"]!;
            _adminUsername = configuration["LdapSettings:AdminUsername"]!;
            _adminPassword = configuration["LdapSettings:AdminPassword"]!;
        }

        // Get all AD users
        public List<AdUser> GetAllUsers()
        {
            var users = new List<AdUser>();

            using var context = new PrincipalContext(
                ContextType.Domain,
                _server,
                _searchBase,
                _adminUsername,
                _adminPassword
            );

            using var searcher = new PrincipalSearcher(new UserPrincipal(context));

            foreach (var result in searcher.FindAll())
            {
                if (result is UserPrincipal user && user.SamAccountName != null)
                {
                    users.Add(new AdUser
                    {
                        Username = user.SamAccountName,
                        FullName = user.DisplayName ?? user.SamAccountName,
                        Email = user.EmailAddress ?? "",
                        IsEnabled = user.Enabled ?? false
                    });
                }
            }

            return users;
        }

        // Validate AD user credentials
        public bool ValidateUser(string username, string password)
        {
            try
            {
                using var context = new PrincipalContext(
                    ContextType.Domain,
                    _server,
                    _searchBase,
                    _adminUsername,
                    _adminPassword
                );

                return context.ValidateCredentials(username, password);
            }
            catch
            {
                return false;
            }
        }

        // Get single AD user
        public AdUser? GetUser(string username)
        {
            using var context = new PrincipalContext(
                ContextType.Domain,
                _server,
                _searchBase,
                _adminUsername,
                _adminPassword
            );

            var user = UserPrincipal.FindByIdentity(context, username);

            if (user == null) return null;

            return new AdUser
            {
                Username = user.SamAccountName,
                FullName = user.DisplayName ?? user.SamAccountName,
                Email = user.EmailAddress ?? "",
                IsEnabled = user.Enabled ?? false
            };
        }

        // Create AD user
        public bool CreateUser(string username, string fullName, string password)
        {
            try
            {
                using var context = new PrincipalContext(
                    ContextType.Domain,
                    _server,
                    _searchBase,
                    _adminUsername,
                    _adminPassword
                );

                var user = new UserPrincipal(context)
                {
                    SamAccountName = username,
                    DisplayName = fullName,
                    Enabled = true
                };

                user.SetPassword(password);
                user.Save();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Disable AD user
        public bool DisableUser(string username)
        {
            try
            {
                using var context = new PrincipalContext(
                    ContextType.Domain,
                    _server,
                    _searchBase,
                    _adminUsername,
                    _adminPassword
                );

                var user = UserPrincipal.FindByIdentity(context, username);
                if (user == null) return false;

                user.Enabled = false;
                user.Save();
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}