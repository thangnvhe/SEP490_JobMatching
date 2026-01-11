using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Helpers
{
    public static class EducationMatchingHelper
    {
        /// <summary>
        /// Kiểm tra xem candidate có đáp ứng yêu cầu về bằng cấp của job không
        /// </summary>
        /// <param name="candidateEducationLevel">SystemConfig của education cao nhất của candidate</param>
        /// <param name="jobRequiredEducationLevel">SystemConfig của education yêu cầu của job</param>
        /// <returns>True nếu candidate đáp ứng yêu cầu</returns>
        public static bool IsEducationMatch(SystemConfig? candidateEducationLevel, SystemConfig? jobRequiredEducationLevel)
        {
            // Nếu job không yêu cầu bằng cấp cụ thể, accept tất cả
            if (jobRequiredEducationLevel == null)
                return true;

            // Nếu candidate không có bằng cấp, chỉ match với job không yêu cầu bằng cấp
            if (candidateEducationLevel == null)
                return false;

            // Candidate có bằng cấp >= yêu cầu job (RankScore cao hơn = bằng cấp cao hơn)
            var candidateScore = int.TryParse(candidateEducationLevel.Value, out var candScore) ? candScore : 0;
            var requiredScore = int.TryParse(jobRequiredEducationLevel.Value, out var reqScore) ? reqScore : 0;
            return candidateScore >= requiredScore;
        }

        /// <summary>
        /// Tính điểm matching cho education (0-100)
        /// </summary>
        public static int CalculateEducationMatchScore(SystemConfig? candidateEducationLevel, SystemConfig? jobRequiredEducationLevel)
        {
            if (jobRequiredEducationLevel == null)
                return 100; // Perfect match nếu job không yêu cầu bằng cấp

            if (candidateEducationLevel == null)
                return 0; // No match nếu candidate không có bằng cấp

            // Tính điểm dựa trên độ chênh lệch RankScore
            var candidateScore = int.TryParse(candidateEducationLevel.Value, out var candScore) ? candScore : 0;
            var requiredScore = int.TryParse(jobRequiredEducationLevel.Value, out var reqScore) ? reqScore : 0;
            int scoreDifference = candidateScore - requiredScore;

            if (scoreDifference < 0)
                return 0; // Candidate không đủ yêu cầu

            if (scoreDifference == 0)
                return 100; // Perfect match

            // Điểm giảm 10% cho mỗi level cao hơn (over-qualified)
            return Math.Max(70, 100 - (scoreDifference * 10));
        }

        /// <summary>
        /// Lấy bằng cấp cao nhất của candidate
        /// </summary>
        public static SystemConfig? GetHighestEducationLevel(IEnumerable<CVEducation> educations)
        {
            return educations
                .Where(e => e.EducationLevel != null)
                .OrderByDescending(e => int.TryParse(e.EducationLevel!.Value, out var score) ? score : 0)
                .FirstOrDefault()?.EducationLevel;
        }
    }
}