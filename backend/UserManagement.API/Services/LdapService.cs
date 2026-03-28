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

        // ─── GROUPS ────────────────────────────────────────────────────

// Get all groups
public List<AdGroup> GetAllGroups()
{
    var groups = new List<AdGroup>();
    try
    {
        using var context = new PrincipalContext(
            ContextType.Domain,
            _server,
            _searchBase,
            _adminUsername,
            _adminPassword
        );

        using var searcher = new PrincipalSearcher(new GroupPrincipal(context));
        foreach (var result in searcher.FindAll())
        {
            if (result is GroupPrincipal group)
            {
                var members = group.GetMembers()
                    .OfType<UserPrincipal>()
                    .Select(m => m.SamAccountName)
                    .ToList();

                groups.Add(new AdGroup
                {
                    Name = group.Name ?? "",
                    Description = group.Description ?? "",
                    MemberCount = members.Count,
                    Members = members,
                });
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ GetAllGroups Error: {ex.Message}");
    }
    return groups;
}

// Get group members
public List<string> GetGroupMembers(string groupName)
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

        var group = GroupPrincipal.FindByIdentity(context, groupName);
        if (group == null) return new List<string>();

        return group.GetMembers()
            .OfType<UserPrincipal>()
            .Select(m => m.SamAccountName)
            .ToList();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ GetGroupMembers Error: {ex.Message}");
        return new List<string>();
    }
}

// Create group
public bool CreateGroup(string groupName, string description)
{
    try
    {
        using var context = new PrincipalContext(
            ContextType.Domain,
            _server,
            "CN=Users," + _searchBase,
            _adminUsername,
            _adminPassword
        );

        var group = new GroupPrincipal(context)
        {
            Name = groupName,
            Description = description,
            IsSecurityGroup = true,
        };

        group.Save();
        return true;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ CreateGroup Error: {ex.Message}");
        return false;
    }
}

// Add user to group
public bool AddUserToGroup(string username, string groupName)
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

        var group = GroupPrincipal.FindByIdentity(context, groupName);
        var user = UserPrincipal.FindByIdentity(context, username);

        if (group == null || user == null) return false;

        group.Members.Add(user);
        group.Save();
        return true;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ AddUserToGroup Error: {ex.Message}");
        return false;
    }
}

// Remove user from group
public bool RemoveUserFromGroup(string username, string groupName)
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

        var group = GroupPrincipal.FindByIdentity(context, groupName);
        var user = UserPrincipal.FindByIdentity(context, username);

        if (group == null || user == null) return false;

        group.Members.Remove(user);
        group.Save();
        return true;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ RemoveUserFromGroup Error: {ex.Message}");
        return false;
    }
}

// ─── OUs ───────────────────────────────────────────────────────

// Get all OUs
public List<AdOU> GetAllOUs()
{
    var ous = new List<AdOU>();
    try
    {
        using var entry = new DirectoryEntry(
            $"LDAP://{_server}/{_searchBase}",
            _adminUsername,
            _adminPassword
        );

        using var searcher = new DirectorySearcher(entry)
        {
            Filter = "(objectClass=organizationalUnit)",
            SearchScope = SearchScope.OneLevel
        };

        foreach (SearchResult result in searcher.FindAll())
        {
            var name = result.Properties["name"][0]?.ToString() ?? "";
            var dn = result.Properties["distinguishedName"][0]?.ToString() ?? "";

            ous.Add(new AdOU
            {
                Name = name,
                DistinguishedName = dn,
            });
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ GetAllOUs Error: {ex.Message}");
    }
    return ous;
}

// Create OU
public bool CreateOU(string ouName, string description)
{
    try
    {
        using var entry = new DirectoryEntry(
            $"LDAP://{_server}/{_searchBase}",
            _adminUsername,
            _adminPassword
        );

        var newOU = entry.Children.Add($"OU={ouName}", "organizationalUnit");
        newOU.Properties["description"].Value = description;
        newOU.CommitChanges();
        return true;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ CreateOU Error: {ex.Message}");
        return false;
    }
}

// Get users in OU
public List<AdUser> GetUsersInOU(string ouDN)
{
    var users = new List<AdUser>();
    try
    {
        using var entry = new DirectoryEntry(
            $"LDAP://{_server}/{ouDN}",
            _adminUsername,
            _adminPassword
        );

        using var searcher = new DirectorySearcher(entry)
        {
            Filter = "(objectClass=user)",
            SearchScope = SearchScope.OneLevel
        };

        foreach (SearchResult result in searcher.FindAll())
        {
            var username = result.Properties["sAMAccountName"][0]?.ToString() ?? "";
            var fullName = result.Properties["displayName"].Count > 0
                ? result.Properties["displayName"][0]?.ToString() ?? username
                : username;

            users.Add(new AdUser
            {
                Username = username,
                FullName = fullName,
                Email = result.Properties["mail"].Count > 0
                    ? result.Properties["mail"][0]?.ToString() ?? ""
                    : "",
                IsEnabled = true,
            });
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ GetUsersInOU Error: {ex.Message}");
    }
    return users;
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
        public bool CreateUser(string username, string firstName, string lastName, string logonName, string password)
{
    try
    {
        using var context = new PrincipalContext(
            ContextType.Domain,
            _server,
            "CN=Users,DC=ad,DC=issam,DC=com",  // ← specify Users container!
            _adminUsername,
            _adminPassword
        );

        var user = new UserPrincipal(context)
        {
            SamAccountName = username,
            GivenName = firstName,
            Surname = lastName,
            DisplayName = $"{firstName} {lastName}",
            UserPrincipalName = $"{logonName}@{_domain}",
            Enabled = true,
        };

        user.SetPassword(password);
        user.Save();
        return true;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ CreateUser Error: {ex.Message}");
        Console.WriteLine($"❌ Inner Exception: {ex.InnerException?.Message}");
        return false;
    }
}

        public bool EnableUser(string username)
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

        user.Enabled = true;
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