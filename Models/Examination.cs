using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.Models
{
    public class Examination
    {
        public int ExamId { get; set; }
        public int RequestId { get; set; }
        public int ProviderId { get; set; }
        public string Report { get; set; }
        public string SuggestedSolution { get; set; }
        public decimal InitialPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
