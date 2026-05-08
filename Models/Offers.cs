using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.Models
{
    public class Offers
    {
        public int OfferId { get; set; }
        public int ProviderId { get; set; }
        public int RequestId { get; set; }
        public decimal Price { get; set; }
    }
}
