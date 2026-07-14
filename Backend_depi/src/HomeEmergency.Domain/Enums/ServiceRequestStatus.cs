using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.Domain.Enums;

public enum ServiceRequestStatus
{
    Pending = 1,
    SearchingForProviders = 2,
    ProviderSelected = 3,
    WaitingForExamination = 4,
    WaitingCustomerApproval = 5,
    InProgress = 6,
    Completed = 7,
    Cancelled = 8
}