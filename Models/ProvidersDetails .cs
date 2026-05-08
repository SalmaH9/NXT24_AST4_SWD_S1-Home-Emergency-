using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.Models
{
   public class ProvidersDetails
    {
        public int ProviderId { get; set; }
        public bool IsApproved { get; set; }
        public bool HasActiveSubscription { get; set; }
        public string IdDocument { get; set; }
        public string CriminalRecord { get; set; }
    }
}
