using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Helpers
{
    public static class EducationMatchingHelper
    {
        /// <summary>
        /// Kiểm tra xem candidate có đáp ứng yêu cầu về bằng cấp của job không
        /// </summary>
        /// <param name="candidateEducationLevel">Bằng cấp cao nhất của candidate</param>
        /// <param name="jobRequiredEducationLevel">Bằng cấp yêu cầu của job</param>
        /// <returns>True nếu candidate đáp ứng yêu cầu</returns>
        public static bool IsEducationMatch(EducationLevel? candidateEducationLevel, EducationLevel? jobRequiredEducationLevel)
        {
            // Nếu job không yêu cầu bằng cấp cụ thể, accept tất cả
            if (jobRequiredEducationLevel == null)
                return true;

            // Nếu candidate không có bằng cấp, chỉ match với job không yêu cầu bằng cấp
            if (candidateEducationLevel == null)
                return false;

            // Candidate có bằng cấp >= yêu cầu job (RankScore cao hơn = bằng cấp cao hơn)
            return candidateEducationLevel.RankScore >= jobRequiredEducationLevel.RankScore;
        }

        /// <summary>
        /// Tính điểm matching cho education (0-100)
        /// </summary>
        public static int CalculateEducationMatchScore(EducationLevel? candidateEducationLevel, EducationLevel? jobRequiredEducationLevel)
        {
            if (jobRequiredEducationLevel == null)
                return 100; // Perfect match nếu job không yêu cầu bằng cấp

            if (candidateEducationLevel == null)
                return 0; // No match nếu candidate không có bằng cấp

            // Tính điểm dựa trên độ chênh lệch RankScore
            int scoreDifference = candidateEducationLevel.RankScore - jobRequiredEducationLevel.RankScore;

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
        public static EducationLevel? GetHighestEducationLevel(IEnumerable<CVEducation> educations)
        {
            return educations
                .Where(e => e.EducationLevel != null)
                .OrderByDescending(e => e.EducationLevel!.RankScore)
                .FirstOrDefault()?.EducationLevel;
        }
    }
}