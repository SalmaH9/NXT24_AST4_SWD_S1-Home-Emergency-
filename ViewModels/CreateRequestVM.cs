using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.ViewModels
{
    public class CreateRequestVM
    {
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public int RequiredProviders { get; set; }
    }
}
