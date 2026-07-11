using System;
using System.Collections.Generic;
namespace HomeEmergency
{
    internal class Program
    {
        static void Main(string[] args)
        {
            
        }
    }
    public class User
    {
        public int UserId { get; set; } 
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; } 
        public string AccountType { get; set; }  
        public DateTime CreatedAt { get; set; }

    }

    public class Subscription
    {
        public int SubscriptionId { get; set; }
        public int UserId { get; set; }
        public string Type { get; set; } 
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }

    }

    public class Category
    {
        public int CategoryId { get; set; }
        public string Name { get; set; }
    }

    public class ServiceRequest
    {
        public int RequestId { get; set; }
        public int UserId { get; set; }
        public int CategoryId { get; set; }
        public string Description { get; set; }
        public int RequiredProviders { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }


    public class RegisterVM
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }  
        public string AccountType { get; set; } // Normal / VIP
    }

    public class LoginVM
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }


    public class UserProfileVM
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }

    public class CreateRequestVM
    {
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public int RequiredProviders { get; set; }
    }


    public class RequestDetailsVM
    {
        public int RequestId { get; set; }
        public string UserName { get; set; }
        public string CategoryName { get; set; }

        public string Description { get; set; }
        public int RequiredProviders { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }


    public class SubscriptionVM
    {
        public string Type { get; set; } // Monthly / Yearly
    }


}
