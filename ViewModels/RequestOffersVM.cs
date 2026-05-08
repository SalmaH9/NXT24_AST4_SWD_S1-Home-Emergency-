using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.ViewModels
{
    public class RequestOffersVM
    {
        public int RequestId { get; set; }
        public string CustomerName { get; set; }
        public string ProblemDescription { get; set; }
        public List<OfferDetailVM> ActiveOffers { get; set; }
    }

    public class OfferDetailVM
    {
        public int OfferId { get; set; }
        public string ProviderName { get; set; }
        public decimal Price { get; set; }
        public bool ProviderIsApproved { get; set; }
    }
}
