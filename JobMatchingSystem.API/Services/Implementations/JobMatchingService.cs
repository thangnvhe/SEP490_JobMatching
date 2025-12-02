using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class JobMatchingService : IJobMatchingService
    {
        private readonly ApplicationDbContext _context;
        private const double SKILL_WEIGHT = 0.30;      // 30%
        private const double EXPERIENCE_WEIGHT = 0.20; // 20%
        private const double POSITION_WEIGHT = 0.40;   // 40%
        private const double EDUCATION_WEIGHT = 0.10;  // 10%

        public JobMatchingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<JobMatchingResult>> FindMatchingJobsAsync(int candidateId, int limit = 10)
        {
            var candidate = await GetCandidateWithDetailsAsync(candidateId);
            if (candidate == null) return new List<JobMatchingResult>();

            var activeJobs = await _context.Jobs
                .Include(j => j.Company)
                .Include(j => j.Position)
                .Include(j => j.RequiredEducationLevel)
                .Include(j => j.JobTaxonomies)
                    .ThenInclude(jt => jt.Taxonomy)
                .Where(j => j.Status == Enums.JobStatus.Opened && !j.IsDeleted)
                .ToListAsync();

            var matchingResults = new List<JobMatchingResult>();

            foreach (var job in activeJobs)
            {
                var matchingResult = await CalculateMatchingScoreInternalAsync(candidate, job);
                if (matchingResult != null)
                {
                    matchingResults.Add(matchingResult);
                }
            }

            return matchingResults
                .OrderByDescending(r => r.TotalScore)
                .Take(limit)
                .ToList();
        }

        public async Task<List<JobMatchingResult>> FindMatchingCandidatesAsync(int jobId, int limit = 10)
        {
            var job = await GetJobWithDetailsAsync(jobId);
            if (job == null) return new List<JobMatchingResult>();

            var activeCandidates = await _context.Users
                .Include(u => u.Position)
                .Include(u => u.CVEducations)
                    .ThenInclude(e => e.EducationLevel)
                .Include(u => u.CandidateTaxonomies)
                    .ThenInclude(ct => ct.Taxonomy)
                .Include(u => u.CVExperiences)
                .Include(u => u.CVCertificates)
                .Include(u => u.CVAchievements)
                .Where(u => u.IsActive)
                .ToListAsync();

            var matchingResults = new List<JobMatchingResult>();

            foreach (var candidate in activeCandidates)
            {
                var matchingResult = await CalculateMatchingScoreInternalAsync(candidate, job);
                if (matchingResult != null)
                {
                    matchingResults.Add(matchingResult);
                }
            }

            return matchingResults
                .OrderByDescending(r => r.TotalScore)
                .Take(limit)
                .ToList();
        }

        public async Task<JobMatchingResult?> CalculateMatchingScoreAsync(int candidateId, int jobId)
        {
            var candidate = await GetCandidateWithDetailsAsync(candidateId);
            var job = await GetJobWithDetailsAsync(jobId);

            if (candidate == null || job == null) return null;

            return await CalculateMatchingScoreInternalAsync(candidate, job);
        }

        public async Task<List<JobMatchingResult>> SearchJobsWithMatchingAsync(int candidateId, 
            string? location = null, 
            int? minSalary = null, 
            int? maxSalary = null, 
            List<int>? requiredSkills = null, 
            int page = 1, 
            int size = 10)
        {
            var candidate = await GetCandidateWithDetailsAsync(candidateId);
            if (candidate == null) return new List<JobMatchingResult>();

            var query = _context.Jobs
                .Include(j => j.Company)
                .Include(j => j.Position)
                .Include(j => j.RequiredEducationLevel)
                .Include(j => j.JobTaxonomies)
                    .ThenInclude(jt => jt.Taxonomy)
                .Where(j => j.Status == Enums.JobStatus.Opened && !j.IsDeleted);

            // Apply filters
            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(j => j.Location.Contains(location));
            }

            if (minSalary.HasValue)
            {
                query = query.Where(j => j.SalaryMin >= minSalary.Value);
            }

            if (maxSalary.HasValue)
            {
                query = query.Where(j => j.SalaryMax <= maxSalary.Value);
            }

            if (requiredSkills?.Any() == true)
            {
                query = query.Where(j => j.JobTaxonomies.Any(jt => requiredSkills.Contains(jt.TaxonomyId)));
            }

            var jobs = await query.ToListAsync();
            var matchingResults = new List<JobMatchingResult>();

            foreach (var job in jobs)
            {
                var matchingResult = await CalculateMatchingScoreInternalAsync(candidate, job);
                if (matchingResult != null)
                {
                    matchingResults.Add(matchingResult);
                }
            }

            return matchingResults
                .OrderByDescending(r => r.TotalScore)
                .Skip((page - 1) * size)
                .Take(size)
                .ToList();
        }

        public async Task<List<JobMatchingResult>> SearchCandidatesWithMatchingAsync(int jobId, 
            int? minExperience = null, 
            int? maxExperience = null, 
            List<int>? requiredSkills = null, 
            int? educationLevelId = null, 
            int page = 1, 
            int size = 10)
        {
            var job = await GetJobWithDetailsAsync(jobId);
            if (job == null) return new List<JobMatchingResult>();

            var query = _context.Users
                .Include(u => u.Position)
                .Include(u => u.CVEducations)
                    .ThenInclude(e => e.EducationLevel)
                .Include(u => u.CandidateTaxonomies)
                    .ThenInclude(ct => ct.Taxonomy)
                .Include(u => u.CVExperiences)
                .Include(u => u.CVCertificates)
                .Include(u => u.CVAchievements)
                .Where(u => u.IsActive);

            // Apply filters
            if (minExperience.HasValue)
            {
                query = query.Where(u => u.CVExperiences.Any(e => 
                    EF.Functions.DateDiffYear(e.StartDate, e.EndDate ?? DateTime.Now) >= minExperience.Value));
            }

            if (maxExperience.HasValue)
            {
                query = query.Where(u => u.CVExperiences.Sum(e => 
                    EF.Functions.DateDiffYear(e.StartDate, e.EndDate ?? DateTime.Now)) <= maxExperience.Value);
            }

            if (requiredSkills?.Any() == true)
            {
                query = query.Where(u => u.CandidateTaxonomies.Any(ct => requiredSkills.Contains(ct.TaxonomyId)));
            }

            if (educationLevelId.HasValue)
            {
                query = query.Where(u => u.CVEducations.Any(e => e.EducationLevelId == educationLevelId.Value));
            }

            var candidates = await query.ToListAsync();
            var matchingResults = new List<JobMatchingResult>();

            foreach (var candidate in candidates)
            {
                var matchingResult = await CalculateMatchingScoreInternalAsync(candidate, job);
                if (matchingResult != null)
                {
                    matchingResults.Add(matchingResult);
                }
            }

            return matchingResults
                .OrderByDescending(r => r.TotalScore)
                .Skip((page - 1) * size)
                .Take(size)
                .ToList();
        }

        private async Task<ApplicationUser?> GetCandidateWithDetailsAsync(int candidateId)
        {
            return await _context.Users
                .Include(u => u.Position)
                .Include(u => u.CVEducations)
                    .ThenInclude(e => e.EducationLevel)
                .Include(u => u.CandidateTaxonomies)
                    .ThenInclude(ct => ct.Taxonomy)
                .Include(u => u.CVExperiences)
                .Include(u => u.CVCertificates)
                .Include(u => u.CVAchievements)
                .FirstOrDefaultAsync(u => u.Id == candidateId && u.IsActive);
        }

        private async Task<Job?> GetJobWithDetailsAsync(int jobId)
        {
            return await _context.Jobs
                .Include(j => j.Company)
                .Include(j => j.Position)
                .Include(j => j.RequiredEducationLevel)
                .Include(j => j.JobTaxonomies)
                    .ThenInclude(jt => jt.Taxonomy)
                .FirstOrDefaultAsync(j => j.JobId == jobId && j.Status == Enums.JobStatus.Opened && !j.IsDeleted);
        }

        private async Task<JobMatchingResult?> CalculateMatchingScoreInternalAsync(ApplicationUser candidate, Job job)
        {
            try
            {
                // Calculate individual scores
                var skillDetails = await CalculateSkillMatchingAsync(candidate, job);
                var experienceDetails = CalculateExperienceMatching(candidate, job);
                var positionDetails = CalculatePositionMatching(candidate, job);
                var educationDetails = CalculateEducationMatching(candidate, job);

                // Calculate weighted total score
                var totalScore = 
                    (skillDetails.Score * SKILL_WEIGHT) +
                    (experienceDetails.Score * EXPERIENCE_WEIGHT) +
                    (positionDetails.Score * POSITION_WEIGHT) +
                    (educationDetails.Score * EDUCATION_WEIGHT);

                return new JobMatchingResult
                {
                    JobId = job.JobId,
                    JobTitle = job.Title,
                    CompanyName = job.Company?.Name ?? "",
                    CandidateId = candidate.Id,
                    CandidateName = candidate.FullName,
                    TotalScore = Math.Round(totalScore, 2),
                    Details = new MatchingDetails
                    {
                        SkillMatching = skillDetails,
                        ExperienceMatching = experienceDetails,
                        PositionMatching = positionDetails,
                        EducationMatching = educationDetails
                    }
                };
            }
            catch (Exception ex)
            {
                // Log error and return null
                Console.WriteLine($"Error calculating matching score for candidate {candidate.Id} and job {job.JobId}: {ex.Message}");
                return null;
            }
        }

        private async Task<SkillMatchingDetails> CalculateSkillMatchingAsync(ApplicationUser candidate, Job job)
        {
            var details = new SkillMatchingDetails();
            var requiredSkills = job.JobTaxonomies.ToList();
            
            if (!requiredSkills.Any())
            {
                details.Score = 50; // Default score if no skills required
                return details;
            }

            double totalScore = 0;
            double maxPossibleScore = 0;

            foreach (var requiredSkill in requiredSkills)
            {
                maxPossibleScore += 1.0;
                var skillMatch = await FindBestSkillMatchAsync(candidate, requiredSkill, job);
                
                if (skillMatch != null)
                {
                    details.MatchedSkills.Add(skillMatch);
                    totalScore += skillMatch.FinalScore / 100.0; // Convert to ratio
                }
                else
                {
                    details.MissingSkills.Add(requiredSkill.Taxonomy?.Name ?? "Unknown");
                }
            }

            details.Score = maxPossibleScore > 0 ? Math.Round((totalScore / maxPossibleScore) * 100, 2) : 0;
            return details;
        }

        private async Task<SkillMatchItem?> FindBestSkillMatchAsync(ApplicationUser candidate, JobTaxonomy requiredSkill, Job job)
        {
            var candidateSkills = candidate.CandidateTaxonomies.ToList();
            SkillMatchItem? bestMatch = null;
            double bestScore = 0;

            foreach (var candidateSkill in candidateSkills)
            {
                var similarity = await CalculateSkillSimilarityAsync(
                    candidateSkill.TaxonomyId, 
                    requiredSkill.TaxonomyId);

                if (similarity > 0)
                {
                    var experienceRatio = CalculateExperienceRatio(
                        candidateSkill.ExperienceYear ?? 0, 
                        job.ExperienceYear ?? 1);

                    var finalScore = similarity * experienceRatio * 100;

                    if (finalScore > bestScore)
                    {
                        bestScore = finalScore;
                        bestMatch = new SkillMatchItem
                        {
                            TaxonomyId = candidateSkill.TaxonomyId,
                            SkillName = candidateSkill.Taxonomy?.Name ?? "",
                            Similarity = similarity,
                            RequiredYears = job.ExperienceYear ?? 0,
                            CandidateYears = candidateSkill.ExperienceYear ?? 0,
                            ExperienceRatio = experienceRatio,
                            FinalScore = Math.Round(finalScore, 2),
                            MatchType = GetSkillMatchType(similarity)
                        };
                    }
                }
            }

            return bestMatch;
        }

        private async Task<double> CalculateSkillSimilarityAsync(int candidateSkillId, int requiredSkillId)
        {
            if (candidateSkillId == requiredSkillId)
                return 1.0; // Exact match

            // Get both taxonomies with their hierarchies
            var candidateSkill = await GetTaxonomyWithHierarchyAsync(candidateSkillId);
            var requiredSkill = await GetTaxonomyWithHierarchyAsync(requiredSkillId);

            if (candidateSkill == null || requiredSkill == null)
                return 0.0;

            // Check if candidate skill is parent of required skill
            if (await IsParentOfAsync(candidateSkill.Id, requiredSkill.Id))
                return 0.5; // Parent match - knows language but not specific framework

            // Check if they are siblings (same parent)
            if (await AreSiblingsAsync(candidateSkill.Id, requiredSkill.Id))
                return 0.3; // Sibling match - same ecosystem

            return 0.0; // No relationship
        }

        private async Task<Taxonomy?> GetTaxonomyWithHierarchyAsync(int taxonomyId)
        {
            return await _context.Taxonomies
                .Include(t => t.Parent)
                .Include(t => t.Children)
                .FirstOrDefaultAsync(t => t.Id == taxonomyId);
        }

        private async Task<bool> IsParentOfAsync(int parentId, int childId)
        {
            var child = await _context.Taxonomies
                .FirstOrDefaultAsync(t => t.Id == childId);
            
            while (child?.ParentId != null)
            {
                if (child.ParentId == parentId)
                    return true;
                    
                child = await _context.Taxonomies
                    .FirstOrDefaultAsync(t => t.Id == child.ParentId);
            }
            
            return false;
        }

        private async Task<bool> AreSiblingsAsync(int taxonomyId1, int taxonomyId2)
        {
            var taxonomy1 = await _context.Taxonomies
                .FirstOrDefaultAsync(t => t.Id == taxonomyId1);
            var taxonomy2 = await _context.Taxonomies
                .FirstOrDefaultAsync(t => t.Id == taxonomyId2);

            return taxonomy1?.ParentId != null && 
                   taxonomy2?.ParentId != null && 
                   taxonomy1.ParentId == taxonomy2.ParentId;
        }

        private static double CalculateExperienceRatio(int candidateYears, int requiredYears)
        {
            if (requiredYears <= 0) return 1.0;
            return Math.Min((double)candidateYears / requiredYears, 1.0);
        }

        private static SkillMatchType GetSkillMatchType(double similarity)
        {
            return similarity switch
            {
                1.0 => SkillMatchType.ExactMatch,
                0.5 => SkillMatchType.ParentMatch,
                0.3 => SkillMatchType.SiblingMatch,
                _ => SkillMatchType.ExactMatch
            };
        }

        private ExperienceMatchingDetails CalculateExperienceMatching(ApplicationUser candidate, Job job)
        {
            var details = new ExperienceMatchingDetails
            {
                RequiredYears = job.ExperienceYear ?? 0
            };

            if (details.RequiredYears <= 0)
            {
                details.Score = 100; // No experience required
                details.ExperienceRatio = 1.0;
                return details;
            }

            // Calculate candidate's maximum experience from CV
            var maxExperience = 0;
            if (candidate.CVExperiences.Any())
            {
                maxExperience = candidate.CVExperiences
                    .Select(e => CalculateYearsOfExperience(e.StartDate, e.EndDate))
                    .Max();
            }

            details.CandidateMaxYears = maxExperience;
            details.ExperienceRatio = CalculateExperienceRatio(maxExperience, details.RequiredYears);
            details.Score = Math.Round(details.ExperienceRatio * 100, 2);

            return details;
        }

        private PositionMatchingDetails CalculatePositionMatching(ApplicationUser candidate, Job job)
        {
            var details = new PositionMatchingDetails
            {
                RequiredPosition = job.Position?.Name ?? "",
                CandidatePosition = candidate.Position?.Name ?? ""
            };

            if (string.IsNullOrEmpty(details.RequiredPosition))
            {
                details.Score = 50; // Default score if no specific position required
                details.MatchType = PositionMatchType.ExactMatch;
                return details;
            }

            if (string.IsNullOrEmpty(details.CandidatePosition))
            {
                details.Score = 25; // Low score if candidate has no specified position
                details.MatchType = PositionMatchType.NoMatch;
                return details;
            }

            // Exact match
            if (details.RequiredPosition.Equals(details.CandidatePosition, StringComparison.OrdinalIgnoreCase))
            {
                details.Score = 100;
                details.MatchType = PositionMatchType.ExactMatch;
                return details;
            }

            // Check for Fullstack match
            var requiredLower = details.RequiredPosition.ToLower();
            var candidateLower = details.CandidatePosition.ToLower();

            if (candidateLower.Contains("fullstack") || candidateLower.Contains("full stack"))
            {
                if (requiredLower.Contains("backend") || requiredLower.Contains("frontend") || 
                    requiredLower.Contains("developer") || requiredLower.Contains("engineer"))
                {
                    details.Score = 80;
                    details.MatchType = PositionMatchType.FullstackMatch;
                    return details;
                }
            }

            // Check for related positions (basic keyword matching)
            var relatedKeywords = new[] { "developer", "engineer", "programmer", "architect" };
            var hasRelatedKeywords = relatedKeywords.Any(keyword => 
                requiredLower.Contains(keyword) && candidateLower.Contains(keyword));

            if (hasRelatedKeywords)
            {
                details.Score = 30;
                details.MatchType = PositionMatchType.RelatedMatch;
            }
            else
            {
                details.Score = 0;
                details.MatchType = PositionMatchType.NoMatch;
            }

            return details;
        }

        private EducationMatchingDetails CalculateEducationMatching(ApplicationUser candidate, Job job)
        {
            var details = new EducationMatchingDetails();

            var requiredEducation = job.RequiredEducationLevel;
            var candidateHighestEducation = candidate.CVEducations
                .Where(e => e.EducationLevel != null)
                .OrderByDescending(e => e.EducationLevel!.RankScore)
                .FirstOrDefault()?.EducationLevel;

            details.RequiredLevel = requiredEducation?.LevelName ?? "Không yêu cầu";
            details.CandidateLevel = candidateHighestEducation?.LevelName ?? "Không có thông tin";
            details.RequiredRankScore = requiredEducation?.RankScore ?? 0;
            details.CandidateRankScore = candidateHighestEducation?.RankScore ?? 0;

            // If no education required
            if (requiredEducation == null)
            {
                details.Score = 100;
                return details;
            }

            // If candidate has no education info
            if (candidateHighestEducation == null)
            {
                details.Score = 0;
                return details;
            }

            // Compare rank scores
            var scoreDifference = details.CandidateRankScore - details.RequiredRankScore;

            if (scoreDifference < 0)
            {
                details.Score = 0; // Candidate doesn't meet minimum education requirement
            }
            else if (scoreDifference == 0)
            {
                details.Score = 100; // Perfect match
            }
            else
            {
                // Over-qualified, slight reduction
                details.Score = Math.Max(80, 100 - (scoreDifference * 5));
            }

            return details;
        }

        private static int CalculateYearsOfExperience(DateTime startDate, DateTime? endDate)
        {
            var endDt = endDate ?? DateTime.Now;
            return Math.Max(0, endDt.Year - startDate.Year);
        }
    }
}