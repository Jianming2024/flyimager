using Microsoft.AspNetCore.Identity;

namespace DataAccess;

public class User:IdentityUser
{
    public ICollection<ImageFile> ImageFiles { get; set; } 
}