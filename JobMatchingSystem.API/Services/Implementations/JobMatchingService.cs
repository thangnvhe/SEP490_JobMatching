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

        public async Task<List<CandidateMatchingResult>> SearchCandidatesWithMatchingAsync(int jobId, 
            int? minExperience = null, 
            int? maxExperience = null, 
            List<int>? requiredSkills = null, 
            int? educationLevelId = null, 
            int page = 1, 
            int size = 10)
        {
            var job = await GetJobWithDetailsAsync(jobId);
            if (job == null) return new List<CandidateMatchingResult>();

            // Get candidates with CV and apply filters
            var candidatesWithCV = await _context.CVUploads
                .Include(cv => cv.User)
                    .ThenInclude(u => u.CandidateTaxonomies)
                        .ThenInclude(ct => ct.Taxonomy)
                .Include(cv => cv.User.CVProfile)
                    .ThenInclude(cvp => cvp.Position)
                .Where(cv => cv.IsPrimary == true && cv.User.IsActive)
                .Select(cv => cv.User)
                .Distinct()
                .ToListAsync();

            // Apply experience filter
            if (minExperience.HasValue || maxExperience.HasValue)
            {
                var filteredByExperience = new List<ApplicationUser>();
                foreach (var candidate in candidatesWithCV)
                {
                    var experiences = await _context.CVExperiences
                        .Where(exp => exp.UserId == candidate.Id)
                        .ToListAsync();

                    if (experiences.Any(exp =>
                        (!minExperience.HasValue || CalculateYearsOfExperience(exp.StartDate, exp.EndDate) >= minExperience.Value) &&
                        (!maxExperience.HasValue || CalculateYearsOfExperience(exp.StartDate, exp.EndDate) <= maxExperience.Value)))
                    {
                        filteredByExperience.Add(candidate);
                    }
                }
                candidatesWithCV = filteredByExperience;
            }

            // Apply skills filter
            if (requiredSkills != null && requiredSkills.Any())
            {
                candidatesWithCV = candidatesWithCV
                    .Where(c => c.CandidateTaxonomies.Any(ct => requiredSkills.Contains(ct.TaxonomyId)))
                    .ToList();
            }

            // Apply education filter
            if (educationLevelId.HasValue)
            {
                var filteredByEducation = new List<ApplicationUser>();
                foreach (var candidate in candidatesWithCV)
                {
                    var hasEducation = await _context.CVEducations
                        .AnyAsync(ed => ed.UserId == candidate.Id && ed.EducationLevelId == educationLevelId.Value);
                    
                    if (hasEducation)
                    {
                        filteredByEducation.Add(candidate);
                    }
                }
                candidatesWithCV = filteredByEducation;
            }

            var matchingResults = new List<CandidateMatchingResult>();

            foreach (var candidate in candidatesWithCV)
            {
                var matchingResult = await CalculateMatchingScoreForCandidateAsync(candidate, job);
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
            return await _context.ApplicationUsers
                .Include(u => u.CVProfile)
                    .ThenInclude(cvp => cvp.Position)
                .Include(u => u.CVEducations)
                    .ThenInclude(e => e.EducationLevel)
                .Include(u => u.CandidateTaxonomies)
                    .ThenInclude(ct => ct.Taxonomy)
                .Include(u => u.CVExperiences)
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
                CandidatePosition = candidate.CVProfile?.Position?.Name ?? ""
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

        public async Task<List<JobDetailResponse>> SearchJobsWithMatchingDetailAsync(int candidateId, 
            string? location = null, 
            int? minSalary = null, 
            int? maxSalary = null,
            List<int>? requiredSkills = null,
            int page = 1, 
            int size = 10,
            string sortBy = "",
            bool isDescending = false)
        {
            var candidate = await GetCandidateWithDetailsAsync(candidateId);
            if (candidate == null) return new List<JobDetailResponse>();

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

            if (requiredSkills != null && requiredSkills.Any())
            {
                query = query.Where(j => j.JobTaxonomies.Any(jt => requiredSkills.Contains(jt.TaxonomyId)));
            }

            var filteredJobs = await query.ToListAsync();

            var jobsWithScores = new List<(Job Job, double Score)>();

            foreach (var job in filteredJobs)
            {
                var matchingResult = await CalculateMatchingScoreInternalAsync(candidate, job);
                if (matchingResult != null)
                {
                    jobsWithScores.Add((job, matchingResult.TotalScore));
                }
            }

            // Sort by score (descending) or by other criteria
            var sortedJobs = jobsWithScores;
            if (string.IsNullOrEmpty(sortBy) || sortBy.ToLower() == "score")
            {
                sortedJobs = isDescending 
                    ? jobsWithScores.OrderBy(j => j.Score).ToList()
                    : jobsWithScores.OrderByDescending(j => j.Score).ToList();
            }
            else if (sortBy.ToLower() == "title")
            {
                sortedJobs = isDescending 
                    ? jobsWithScores.OrderByDescending(j => j.Job.Title).ToList()
                    : jobsWithScores.OrderBy(j => j.Job.Title).ToList();
            }
            else if (sortBy.ToLower() == "createdat")
            {
                sortedJobs = isDescending 
                    ? jobsWithScores.OrderByDescending(j => j.Job.CreatedAt).ToList()
                    : jobsWithScores.OrderBy(j => j.Job.CreatedAt).ToList();
            }

            // Apply pagination
            var paginatedJobs = sortedJobs
                .Skip((page - 1) * size)
                .Take(size)
                .Select(j => j.Job)
                .ToList();

            // Convert to JobDetailResponse
            var jobDetailResponses = new List<JobDetailResponse>();
            foreach (var job in paginatedJobs)
            {
                var response = await CreateJobDetailResponseAsync(job, candidateId);
                jobDetailResponses.Add(response);
            }

            return jobDetailResponses;
        }

        private async Task<JobDetailResponse> CreateJobDetailResponseAsync(Job job, int? userId)
        {
            // Calculate apply count
            var applyCount = await _context.CandidateJobs.CountAsync(cj => cj.JobId == job.JobId);

            var response = new JobDetailResponse
            {
                JobId = job.JobId,
                Title = job.Title,
                Description = job.Description,
                Requirements = job.Requirements,
                Benefits = job.Benefits,
                SalaryMin = job.SalaryMin,
                SalaryMax = job.SalaryMax,
                Location = job.Location,
                ExperienceYear = job.ExperienceYear,
                JobType = job.JobType,
                Status = job.Status.ToString(),
                PositionId = job.PositionId,
                ViewsCount = job.ViewsCount,
                CompanyId = job.CompanyId,
                RecuiterId = job.RecuiterId,
                VerifiedBy = job.VerifiedBy,
                CreatedAt = job.CreatedAt,
                OpenedAt = job.OpenedAt,
                ExpiredAt = job.ExpiredAt,
                IsDeleted = job.IsDeleted,
                IsHighlight = job.IsHighlighted,
                Taxonomies = job.JobTaxonomies.Select(jt => new TaxonomyResponse
                {
                    Id = jt.TaxonomyId,
                    Name = jt.Taxonomy?.Name ?? ""
                }).ToList(),
                ApplyCount = applyCount
            };

            // Set user-specific fields if userId is provided
            if (userId.HasValue)
            {
                // Check if user has applied
                response.IsApply = await _context.CandidateJobs
                    .Include(cj => cj.CVUpload)
                    .AnyAsync(cj => cj.JobId == job.JobId && cj.CVUpload != null && cj.CVUpload.UserId == userId.Value);

                // Check if user has saved
                response.IsSave = await _context.SavedJobs
                    .AnyAsync(sj => sj.JobId == job.JobId && sj.UserId == userId.Value);

                // Check if user has reported
                response.IsReport = await _context.Reports
                    .AnyAsync(jr => jr.JobId == job.JobId && jr.ReporterId == userId.Value);
            }

            return response;
        }

        private async Task<CandidateMatchingResult?> CalculateMatchingScoreForCandidateAsync(ApplicationUser candidate, Job job)
        {
            // Calculate matching score using existing logic
            var jobMatchingResult = await CalculateMatchingScoreInternalAsync(candidate, job);
            if (jobMatchingResult == null) return null;

            // Get primary CV
            var primaryCV = await _context.CVUploads
                .Where(cv => cv.UserId == candidate.Id && cv.IsPrimary == true)
                .FirstOrDefaultAsync();

            if (primaryCV == null) return null; // Skip candidates without primary CV

            // Create CandidateMatchingResult
            var result = new CandidateMatchingResult
            {
                CandidateId = candidate.Id,
                CandidateName = candidate.FullName,
                Birthday = candidate.Birthday,
                Gender = candidate.Gender,
                Email = candidate.Email ?? "",
                PhoneNumber = candidate.PhoneNumber ?? "",
                Address = candidate.Address ?? "",
                Position = candidate.CVProfile?.Position?.Name ?? "",
                TotalScore = jobMatchingResult.TotalScore,
                MatchedAt = DateTime.UtcNow,
                
                // Primary CV info
                PrimaryCV = new CandidateCVInfo
                {
                    CVId = primaryCV.Id,
                    FileName = primaryCV.FileName,
                    FileUrl = primaryCV.FileUrl,
                    IsPrimary = primaryCV.IsPrimary ?? false,
                    CreatedAt = DateTime.UtcNow // Use current time as fallback
                },

                // Skills
                Skills = candidate.CandidateTaxonomies.Select(ct => new CandidateSkillInfo
                {
                    TaxonomyId = ct.TaxonomyId,
                    SkillName = ct.Taxonomy?.Name ?? "",
                    ExperienceYear = ct.ExperienceYear ?? 0
                }).ToList(),

                // Work Experiences
                WorkExperiences = await _context.CVExperiences
                    .Where(exp => exp.UserId == candidate.Id)
                    .Select(exp => new CandidateExperienceInfo
                    {
                        CompanyName = exp.CompanyName,
                        Position = exp.Position,
                        StartDate = exp.StartDate,
                        EndDate = exp.EndDate,
                        Description = exp.Description
                    })
                    .ToListAsync(),

                // Education
                Educations = await _context.CVEducations
                    .Include(ed => ed.EducationLevel)
                    .Where(ed => ed.UserId == candidate.Id)
                    .Select(ed => new CandidateEducationInfo
                    {
                        SchoolName = ed.SchoolName,
                        EducationLevelName = ed.EducationLevel.LevelName,
                        RankScore = ed.EducationLevel.RankScore,
                        Major = ed.Major,
                        StartDate = ed.StartDate,
                        EndDate = ed.EndDate
                    })
                    .ToListAsync()
            };

            return result;
        }

        private static int CalculateYearsOfExperience(DateTime startDate, DateTime? endDate)
        {
            var endDt = endDate ?? DateTime.Now;
            return Math.Max(0, endDt.Year - startDate.Year);
        }
    }
}