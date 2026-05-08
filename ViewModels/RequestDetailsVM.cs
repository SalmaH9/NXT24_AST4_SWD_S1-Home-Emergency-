using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.ViewModels
{
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
}
