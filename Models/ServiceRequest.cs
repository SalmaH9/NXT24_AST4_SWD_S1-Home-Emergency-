using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.Models
{
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
}
