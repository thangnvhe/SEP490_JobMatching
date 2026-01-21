using JobMatchingSystem.API.Configuration;
using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class JobMatchingService : IJobMatchingService
    {
        private readonly ApplicationDbContext _context;
        private readonly JobMatchingSettings _settings;

        public JobMatchingService(ApplicationDbContext context, IOptions<JobMatchingSettings> settings)
        {
            _context = context;
            _settings = settings.Value;
        }
        public async Task<JobMatchingResult?> CalculateMatchingScoreAsync(int candidateId, int jobId)
        {
            var candidate = await GetCandidateWithDetailsAsync(candidateId);
            var job = await GetJobWithDetailsAsync(jobId);

            if (candidate == null || job == null) return null;

            var allTaxonomies = await _context.Taxonomies.AsNoTracking().ToListAsync();
            var taxonomyLookup = new TaxonomyLookup(allTaxonomies);

            return await CalculateMatchingScoreInternalAsync(candidate, job, taxonomyLookup);
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
                .AsNoTracking()
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
            
            var allTaxonomies = await _context.Taxonomies.AsNoTracking().ToListAsync();
            var taxonomyLookup = new TaxonomyLookup(allTaxonomies);

            var matchingResults = new List<JobMatchingResult>();

            foreach (var job in jobs)
            {
                var matchingResult = await CalculateMatchingScoreInternalAsync(candidate, job, taxonomyLookup);
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

        public async Task<PagedResult<CandidateMatchingResult>> SearchCandidatesWithMatchingAsync(int jobId, 
            int? minExperience = null, 
            int? maxExperience = null, 
            List<int>? requiredSkills = null, 
            int? educationLevelId = null, 
            int page = 1, 
            int size = 10)
        {
            var job = await GetJobWithDetailsAsync(jobId);
            if (job == null) 
            {
                return new PagedResult<CandidateMatchingResult>
                {
                    Items = new List<CandidateMatchingResult>(),
                    pageInfo = new PageInfo(0, page, size, "", false)
                };
            }

            // Get candidates with CV and apply filters
            var candidatesWithCV = await _context.CVUploads
                .AsNoTracking()
                .Include(cv => cv.User)
                    .ThenInclude(u => u.CandidateTaxonomies)
                        .ThenInclude(ct => ct.Taxonomy)
                .Include(cv => cv.User.CVEducations)
                    .ThenInclude(e => e.EducationLevel)
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
                    // Filter based on experience years in candidate's taxonomy (skills)
                    // We take the maximum experience year from any of their skills
                    var maxSkillExperience = candidate.CandidateTaxonomies != null && candidate.CandidateTaxonomies.Any() 
                        ? candidate.CandidateTaxonomies.Max(ct => ct.ExperienceYear ?? 0) 
                        : 0;

                    if ((!minExperience.HasValue || maxSkillExperience >= minExperience.Value) &&
                        (!maxExperience.HasValue || maxSkillExperience <= maxExperience.Value))
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
                        .AnyAsync(ed => ed.UserId == candidate.Id && ed.SystemConfigId == educationLevelId.Value);
                    
                    if (hasEducation)
                    {
                        filteredByEducation.Add(candidate);
                    }
                }
                candidatesWithCV = filteredByEducation;
            }

            // Only return candidates with matching score >= Minimum Matching Score
            double minMatchingScore = _settings.MinMatchingScore;
            
            var allTaxonomies = await _context.Taxonomies.AsNoTracking().ToListAsync();
            var taxonomyLookup = new TaxonomyLookup(allTaxonomies);
            
            var matchingResults = new List<CandidateMatchingResult>();

            foreach (var candidate in candidatesWithCV)
            {
                var matchingResult = await CalculateMatchingScoreForCandidateAsync(candidate, job, taxonomyLookup);
                if (matchingResult != null && matchingResult.TotalScore >= minMatchingScore)
                {
                    matchingResults.Add(matchingResult);
                }
            }

            // If no matching candidates found, return empty result
            if (!matchingResults.Any())
            {
                return new PagedResult<CandidateMatchingResult>
                {
                    Items = new List<CandidateMatchingResult>(),
                    pageInfo = new PageInfo(0, page, size, "", false)
                };
            }

            // Get total count before pagination
            var totalCount = matchingResults.Count;

            var paginatedResults = matchingResults
                .OrderByDescending(r => r.TotalScore)
                .Skip((page - 1) * size)
                .Take(size)
                .ToList();

            return new PagedResult<CandidateMatchingResult>
            {
                Items = paginatedResults,
                pageInfo = new PageInfo(totalCount, page, size, "score", true)
            };
        }

        private async Task<ApplicationUser?> GetCandidateWithDetailsAsync(int candidateId)
        {
            return await _context.ApplicationUsers
                .AsNoTracking()
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
                .AsNoTracking()
                .Include(j => j.Company)
                .Include(j => j.Position)
                .Include(j => j.RequiredEducationLevel)
                .Include(j => j.JobTaxonomies)
                    .ThenInclude(jt => jt.Taxonomy)
                .FirstOrDefaultAsync(j => j.JobId == jobId && j.Status == Enums.JobStatus.Opened && !j.IsDeleted);
        }

        private async Task<JobMatchingResult?> CalculateMatchingScoreInternalAsync(ApplicationUser candidate, Job job, TaxonomyLookup taxonomyLookup)
        {
            try
            {
                // Calculate individual scores
                var skillDetails = CalculateSkillMatching(candidate, job, taxonomyLookup);
                var educationDetails = CalculateEducationMatching(candidate, job);

                // Calculate weighted total score
                var totalScore = 
                    (skillDetails.Score * _settings.SkillWeight) +
                    (educationDetails.Score * _settings.EducationWeight);

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

        private SkillMatchingDetails CalculateSkillMatching(ApplicationUser candidate, Job job, TaxonomyLookup taxonomyLookup)
        {
            var details = new SkillMatchingDetails();
            var requiredSkills = job.JobTaxonomies.ToList();
            
            if (!requiredSkills.Any())
            {
                details.Score = 100; // Default score if no skills required
                return details;
            }

            double totalScore = 0;

            foreach (var requiredSkill in requiredSkills)
            {
                // Find Best Match for this Requirement
                var skillMatch = FindBestSkillMatch(candidate, requiredSkill, job, taxonomyLookup);

                if (skillMatch != null)
                {
                    details.MatchedSkills.Add(skillMatch);
                    totalScore += skillMatch.FinalScore / 100.0; 
                }
                else
                {
                    details.MissingSkills.Add(requiredSkill.Taxonomy?.Name ?? "Unknown");
                }
            }

            // Formula: Sum(Scores) / n
            details.Score = Math.Round((totalScore / requiredSkills.Count) * 100, 2);
            return details;
        }

        private SkillMatchItem? FindBestSkillMatch(ApplicationUser candidate, JobTaxonomy requiredSkill, Job job, TaxonomyLookup taxonomyLookup)
        {
            var candidateSkills = candidate.CandidateTaxonomies.ToList();
            SkillMatchItem? bestMatch = null;
            double bestScore = 0;

            if (!candidateSkills.Any()) return null;

            foreach (var candidateSkill in candidateSkills)
            {
                var similarity = CalculateSkillSimilarity(
                    candidateSkill.TaxonomyId, 
                    requiredSkill.TaxonomyId, taxonomyLookup);

                var experienceRatio = CalculateExperienceRatio(
                    candidateSkill.ExperienceYear ?? 0, 
                    job.ExperienceYear ?? 1);

                var finalScore = similarity * experienceRatio * 100;

                // Pick MAX: Prioritize higher Final Score. 
                // If Scores are tied (e.g. both 0), prioritize higher Similarity (Related > Unrelated).
                if (finalScore > bestScore || (finalScore == bestScore && similarity > (bestMatch?.Similarity ?? -1)))
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

            return bestMatch;
        }

        private double CalculateSkillSimilarity(int candidateSkillId, int requiredSkillId, TaxonomyLookup taxonomyLookup)
        {
            if (candidateSkillId == requiredSkillId)
                return 1.0; // Rule: Exact match = 1

            // CASE 1: Candidate skill is Child of Required Skill (Specific implies General) -> Score 1.0
            if (taxonomyLookup.IsParentOf(requiredSkillId, candidateSkillId))
                return 1.0;

            // CASE 2: Candidate skill is Parent of Required Skill (General supports Specific) -> Score 0.6
            if (taxonomyLookup.IsParentOf(candidateSkillId, requiredSkillId))
                return 0.6; 

            // CASE 3: Siblings (Same ecosystem/parent) -> Score 0.4
            if (taxonomyLookup.AreSiblings(candidateSkillId, requiredSkillId))
                return 0.4; 

            return 0.0; // Rule: Unrelated = 0.0
        }

        private static double CalculateExperienceRatio(int candidateYears, int requiredYears)
        {
            if (requiredYears <= 0) return 1.0;
            return Math.Min((double)candidateYears / requiredYears, 1.0);
        }

        private static SkillMatchType GetSkillMatchType(double similarity)
        {
            if (similarity >= 1.0) return SkillMatchType.ExactMatch;
            if (similarity >= 0.6) return SkillMatchType.ParentMatch;
            if (similarity >= 0.4) return SkillMatchType.SiblingMatch;
            return SkillMatchType.Unrelated;
        }
        private EducationMatchingDetails CalculateEducationMatching(ApplicationUser candidate, Job job)
        {
            var details = new EducationMatchingDetails();

            var requiredEducation = job.RequiredEducationLevel;
            var candidateHighestEducation = candidate.CVEducations
                .Where(e => e.EducationLevel != null)
                .OrderByDescending(e => int.Parse(e.EducationLevel!.Value))
                .FirstOrDefault()?.EducationLevel;

            details.RequiredLevel = requiredEducation?.Name ?? "Không yêu cầu";
            details.CandidateLevel = candidateHighestEducation?.Name ?? "Không có thông tin";
            details.RequiredRankScore = int.TryParse(requiredEducation?.Value, out var reqScore) ? reqScore : 0;
            details.CandidateRankScore = int.TryParse(candidateHighestEducation?.Value, out var candScore) ? candScore : 0;

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

            // Calculate ratio: Candidate Score / Required Score
            if (details.RequiredRankScore <= 0)
            {
                details.Score = 100;
            }
            else
            {
                double ratio = (double)details.CandidateRankScore / details.RequiredRankScore;
                details.Score = Math.Min(ratio, 1.0) * 100;
            }

            return details;
        }

        public async Task<PagedResult<JobDetailResponse>> SearchJobsWithMatchingDetailAsync(int candidateId, 
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
            if (candidate == null) 
            {
                return new PagedResult<JobDetailResponse>
                {
                    Items = new List<JobDetailResponse>(),
                    pageInfo = new PageInfo(0, page, size, sortBy, isDescending)
                };
            }

            var query = _context.Jobs
                .AsNoTracking()
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

            var allTaxonomies = await _context.Taxonomies.AsNoTracking().ToListAsync();
            var taxonomyLookup = new TaxonomyLookup(allTaxonomies);

            // Only return jobs with matching score >= Minimum Matching Score
            double minMatchingScore = _settings.MinMatchingScore;
            var jobsWithScores = new List<(Job Job, double Score)>();

            foreach (var job in filteredJobs)
            {
                var matchingResult = await CalculateMatchingScoreInternalAsync(candidate, job, taxonomyLookup);
                if (matchingResult != null && matchingResult.TotalScore >= minMatchingScore)
                {
                    jobsWithScores.Add((job, matchingResult.TotalScore));
                }
            }

            // If no matching jobs found, return empty result
            if (!jobsWithScores.Any())
            {
                return new PagedResult<JobDetailResponse>
                {
                    Items = new List<JobDetailResponse>(),
                    pageInfo = new PageInfo(0, page, size, sortBy, isDescending)
                };
            }

            // Get total count before pagination
            var totalCount = jobsWithScores.Count;

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

            return new PagedResult<JobDetailResponse>
            {
                Items = jobDetailResponses,
                pageInfo = new PageInfo(totalCount, page, size, sortBy, isDescending)
            };
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

        private async Task<CandidateMatchingResult?> CalculateMatchingScoreForCandidateAsync(ApplicationUser candidate, Job job, TaxonomyLookup taxonomyLookup)
        {
            // Calculate matching score using existing logic
            var jobMatchingResult = await CalculateMatchingScoreInternalAsync(candidate, job, taxonomyLookup);
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

                // Education
                Educations = (await _context.CVEducations
                    .Include(ed => ed.EducationLevel)
                    .Where(ed => ed.UserId == candidate.Id)
                    .ToListAsync())
                    .Select(ed => new CandidateEducationInfo
                    {
                        SchoolName = ed.SchoolName,
                        EducationLevelName = ed.EducationLevel.Name,
                        RankScore = int.TryParse(ed.EducationLevel.Value, out var score) ? score : 0,
                        Major = ed.Major,
                        StartDate = ed.StartDate,
                        EndDate = ed.EndDate
                    })
                    .ToList()
            };

            return result;
        }
    }

    public class TaxonomyLookup
    {
        private readonly Dictionary<int, int?> _taxonomyParents;

        public TaxonomyLookup(List<Taxonomy> allTaxonomies)
        {
            _taxonomyParents = allTaxonomies.ToDictionary(t => t.Id, t => t.ParentId);
        }

        public bool IsParentOf(int parentId, int childId)
        {
            int? currentId = childId;
            // Safety limit to prevent infinite loops in case of circular references in data
            int depth = 0;
            const int MaxDepth = 50;

            while (currentId.HasValue && depth < MaxDepth)
            {
                if (_taxonomyParents.TryGetValue(currentId.Value, out var pId))
                {
                    if (pId == parentId) return true;
                    currentId = pId;
                    depth++;
                }
                else
                {
                    break;
                }
            }
            return false;
        }

        public bool AreSiblings(int id1, int id2)
        {
            if (!_taxonomyParents.TryGetValue(id1, out var p1) ||
                !_taxonomyParents.TryGetValue(id2, out var p2)) return false;

            return p1.HasValue && p2.HasValue && p1 == p2;
        }
    }
}