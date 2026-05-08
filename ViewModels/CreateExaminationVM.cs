using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.ViewModels
{
    public class CreateExaminationVM
    {
        public int RequestId { get; set; }
        public int ProviderId { get; set; }

        [Required(ErrorMessage = "Please write the inspection report.")]
        public string Report { get; set; }

        [Required]
        public string SuggestedSolution { get; set; }

        [Range(0, 10000)]
        public decimal InitialPrice { get; set; }
    }
}
