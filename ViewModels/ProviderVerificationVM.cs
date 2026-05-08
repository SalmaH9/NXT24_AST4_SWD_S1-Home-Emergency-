using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.ViewModels
{
    public class ProviderVerificationVM
    {
        public int ProviderId { get; set; }
        public string IdDocumentPath { get; set; }
        public string CriminalRecordPath { get; set; }
        public bool IsApproved { get; set; }
    }
}
