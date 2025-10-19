using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.Domain.Enums
{
    public enum CandidateStageStatus
    {
        Pending,
        Schedule,
        Passed,
        Failed,
        Skipped,
        Cancelled
    }
}
