using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Helpers
{
    /// <summary>
    /// Helper class for advanced skill matching algorithms
    /// </summary>
    public static class SkillMatchingHelper
    {
        /// <summary>
        /// Tính toán similarity score nâng cao giữa hai skills
        /// </summary>
        public static double CalculateAdvancedSkillSimilarity(Taxonomy candidateSkill, Taxonomy requiredSkill, List<Taxonomy> allTaxonomies)
        {
            // Exact match
            if (candidateSkill.Id == requiredSkill.Id)
                return 1.0;

            // Parent-child relationship
            var parentChildScore = CalculateParentChildSimilarity(candidateSkill, requiredSkill, allTaxonomies);
            if (parentChildScore > 0)
                return parentChildScore;

            // Sibling relationship
            var siblingScore = CalculateSiblingSimilarity(candidateSkill, requiredSkill, allTaxonomies);
            if (siblingScore > 0)
                return siblingScore;

            // Cousin relationship (same grandparent)
            var cousinScore = CalculateCousinSimilarity(candidateSkill, requiredSkill, allTaxonomies);
            if (cousinScore > 0)
                return cousinScore;

            return 0.0;
        }

        /// <summary>
        /// Tính similarity cho parent-child relationship
        /// </summary>
        private static double CalculateParentChildSimilarity(Taxonomy candidateSkill, Taxonomy requiredSkill, List<Taxonomy> allTaxonomies)
        {
            // If candidate has parent skill of required skill
            if (IsAncestorOf(candidateSkill.Id, requiredSkill.Id, allTaxonomies))
            {
                var depth = GetDepthBetween(candidateSkill.Id, requiredSkill.Id, allTaxonomies);
                return Math.Max(0.3, 0.8 - (depth * 0.1)); // Decrease by 10% per level
            }

            // If candidate has child skill of required skill
            if (IsAncestorOf(requiredSkill.Id, candidateSkill.Id, allTaxonomies))
            {
                return 0.9; // Candidate has more specific skill than required
            }

            return 0.0;
        }

        /// <summary>
        /// Tính similarity cho sibling relationship
        /// </summary>
        private static double CalculateSiblingSimilarity(Taxonomy candidateSkill, Taxonomy requiredSkill, List<Taxonomy> allTaxonomies)
        {
            var candidateParent = allTaxonomies.FirstOrDefault(t => t.Id == candidateSkill.ParentId);
            var requiredParent = allTaxonomies.FirstOrDefault(t => t.Id == requiredSkill.ParentId);

            if (candidateParent?.Id == requiredParent?.Id && candidateParent != null)
            {
                // Same parent - sibling relationship
                return 0.4; // 40% similarity for siblings
            }

            return 0.0;
        }

        /// <summary>
        /// Tính similarity cho cousin relationship
        /// </summary>
        private static double CalculateCousinSimilarity(Taxonomy candidateSkill, Taxonomy requiredSkill, List<Taxonomy> allTaxonomies)
        {
            var candidateGrandparent = GetGrandparent(candidateSkill, allTaxonomies);
            var requiredGrandparent = GetGrandparent(requiredSkill, allTaxonomies);

            if (candidateGrandparent?.Id == requiredGrandparent?.Id && candidateGrandparent != null)
            {
                // Same grandparent - cousin relationship
                return 0.2; // 20% similarity for cousins
            }

            return 0.0;
        }

        /// <summary>
        /// Check if taxonomy1 is ancestor of taxonomy2
        /// </summary>
        private static bool IsAncestorOf(int ancestorId, int descendantId, List<Taxonomy> allTaxonomies)
        {
            var current = allTaxonomies.FirstOrDefault(t => t.Id == descendantId);
            
            while (current?.ParentId != null)
            {
                if (current.ParentId == ancestorId)
                    return true;
                    
                current = allTaxonomies.FirstOrDefault(t => t.Id == current.ParentId);
            }
            
            return false;
        }

        /// <summary>
        /// Get depth between ancestor and descendant
        /// </summary>
        private static int GetDepthBetween(int ancestorId, int descendantId, List<Taxonomy> allTaxonomies)
        {
            var current = allTaxonomies.FirstOrDefault(t => t.Id == descendantId);
            int depth = 0;
            
            while (current?.ParentId != null)
            {
                depth++;
                if (current.ParentId == ancestorId)
                    return depth;
                    
                current = allTaxonomies.FirstOrDefault(t => t.Id == current.ParentId);
            }
            
            return int.MaxValue; // Not found
        }

        /// <summary>
        /// Get grandparent of a taxonomy
        /// </summary>
        private static Taxonomy? GetGrandparent(Taxonomy taxonomy, List<Taxonomy> allTaxonomies)
        {
            var parent = allTaxonomies.FirstOrDefault(t => t.Id == taxonomy.ParentId);
            if (parent?.ParentId == null) return null;
            
            return allTaxonomies.FirstOrDefault(t => t.Id == parent.ParentId);
        }

        /// <summary>
        /// Calculate weighted skill importance based on hierarchy level
        /// </summary>
        public static double CalculateSkillImportance(Taxonomy skill, List<Taxonomy> allTaxonomies)
        {
            var level = GetHierarchyLevel(skill, allTaxonomies);
            
            return level switch
            {
                0 => 1.0,  // Root level (e.g., "Java") - highest importance
                1 => 0.9,  // Category level (e.g., "Backend Framework")
                2 => 0.8,  // Subcategory level (e.g., "Spring Ecosystem") 
                3 => 1.0,  // Specific skill level (e.g., "Spring Boot") - highest importance
                _ => 0.7   // Deeper levels
            };
        }

        /// <summary>
        /// Get hierarchy level of a taxonomy
        /// </summary>
        private static int GetHierarchyLevel(Taxonomy taxonomy, List<Taxonomy> allTaxonomies)
        {
            int level = 0;
            var current = taxonomy;
            
            while (current.ParentId != null)
            {
                level++;
                current = allTaxonomies.FirstOrDefault(t => t.Id == current.ParentId);
                if (current == null) break;
            }
            
            return level;
        }

        /// <summary>
        /// Calculate experience bonus based on years
        /// </summary>
        public static double CalculateExperienceBonus(int years)
        {
            return years switch
            {
                >= 10 => 1.2,  // 20% bonus for 10+ years
                >= 5 => 1.1,   // 10% bonus for 5+ years
                >= 2 => 1.05,  // 5% bonus for 2+ years
                _ => 1.0       // No bonus for < 2 years
            };
        }

        /// <summary>
        /// Normalize skill scores to prevent over-scoring
        /// </summary>
        public static double NormalizeScore(double rawScore)
        {
            return Math.Min(100.0, Math.Max(0.0, rawScore));
        }
    }

    /// <summary>
    /// Helper class for position matching logic
    /// </summary>
    public static class PositionMatchingHelper
    {
        private static readonly Dictionary<string, List<string>> _positionHierarchy = new()
        {
            ["fullstack"] = new() { "frontend", "backend", "web", "developer", "engineer" },
            ["frontend"] = new() { "ui", "ux", "react", "vue", "angular", "javascript", "typescript" },
            ["backend"] = new() { "api", "server", "database", "microservice", "java", "python", ".net", "nodejs" },
            ["mobile"] = new() { "android", "ios", "react native", "flutter", "kotlin", "swift" },
            ["devops"] = new() { "infrastructure", "deployment", "ci/cd", "docker", "kubernetes", "aws", "azure" },
            ["data"] = new() { "analyst", "scientist", "engineer", "ml", "ai", "python", "sql" },
            ["qa"] = new() { "tester", "automation", "quality", "test" }
        };

        /// <summary>
        /// Calculate advanced position matching score
        /// </summary>
        public static double CalculateAdvancedPositionMatch(string candidatePosition, string requiredPosition)
        {
            if (string.IsNullOrEmpty(candidatePosition) || string.IsNullOrEmpty(requiredPosition))
                return 0.0;

            var candidateLower = candidatePosition.ToLower();
            var requiredLower = requiredPosition.ToLower();

            // Exact match
            if (candidateLower == requiredLower)
                return 100.0;

            // Fullstack developer can work on frontend/backend
            if (candidateLower.Contains("fullstack") || candidateLower.Contains("full stack"))
            {
                if (_positionHierarchy["fullstack"].Any(skill => requiredLower.Contains(skill)))
                    return 85.0;
            }

            // Check for cross-compatibility
            foreach (var (category, skills) in _positionHierarchy)
            {
                if (skills.Any(skill => candidateLower.Contains(skill)) && 
                    skills.Any(skill => requiredLower.Contains(skill)))
                {
                    return 60.0; // Good compatibility within same category
                }
            }

            // Keyword matching for related positions
            var commonKeywords = ExtractKeywords(candidateLower)
                .Intersect(ExtractKeywords(requiredLower))
                .Count();

            if (commonKeywords > 0)
            {
                return Math.Min(40.0, commonKeywords * 15.0);
            }

            return 0.0;
        }

        private static List<string> ExtractKeywords(string position)
        {
            var keywords = new List<string> 
            { 
                "developer", "engineer", "analyst", "architect", "manager", "lead", 
                "senior", "junior", "intern", "specialist", "consultant"
            };
            
            return keywords.Where(keyword => position.Contains(keyword)).ToList();
        }
    }
}