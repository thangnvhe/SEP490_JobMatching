using System.Net;

namespace JobMatchingSystem.API.Exceptions
{
    public static class ErrorCode
    {
        public static Error InvalidCredentials() => new("Email hoặc mật khẩu không đúng.", HttpStatusCode.Unauthorized);
        public static Error InvalidCreate() => new("Tạo thất bại", HttpStatusCode.BadRequest);
        public static Error NotEnoughJobQuota() => new("Không đủ lượt đăng tin tuyển dụng", HttpStatusCode.BadRequest);
        public static Error NotFoundCompany() => new("Không tìm thấy công ty", HttpStatusCode.NotFound);
        public static Error InValidToken() => new("Token không hợp lệ", HttpStatusCode.BadRequest);
        public static Error EmailExist() => new("Email đã tồn tại trong hệ thống. Vui lòng sử dụng email khác hoặc đăng nhập nếu đây là tài khoản của bạn.", HttpStatusCode.BadRequest);
        public static Error NotFoundRecruiter() => new("Không tìm thấy nhà tuyển dụng", HttpStatusCode.NotFound);
        public static Error InvalidStatus() => new("Trạng thái không hợp lệ", HttpStatusCode.BadRequest);
        public static Error NotFoundJob() => new("Không tìm thấy công việc", HttpStatusCode.NotFound);
        public static Error NotFoundJobStage() => new("Không tìm thấy giai đoạn tuyển dụng", HttpStatusCode.NotFound);
        public static Error SalaryError() => new("Mức lương tối thiểu phải nhỏ hơn mức lương tối đa", HttpStatusCode.BadRequest);
        public static Error DayError() => new("Ngày không hợp lệ", HttpStatusCode.BadRequest);
        public static Error NotFoundUser() => new("Không tìm thấy người dùng", HttpStatusCode.NotFound);
        public static Error EmailNotExist() => new("Email không tồn tại", HttpStatusCode.NotFound);
        public static Error NotFoundTemplateCV() => new("Không tìm thấy mẫu CV", HttpStatusCode.NotFound);
        public static Error NotFoundCV() => new("Không tìm thấy CV", HttpStatusCode.NotFound);
        public static Error NotFoundCanTaxonomy() => new("Không tìm thấy kỹ năng ứng viên", HttpStatusCode.NotFound);
        public static Error NotFoundJobTaxonomy() => new("Không tìm thấy kỹ năng công việc", HttpStatusCode.NotFound);
        public static Error NotFoundTaxonomy() => new("Không tìm thấy kỹ năng", HttpStatusCode.NotFound);
        public static Error NotFoundCVCertificate() => new("Không tìm thấy chứng chỉ", HttpStatusCode.NotFound);
        public static Error NotFoundCVAchievement() => new("Không tìm thấy thành tích", HttpStatusCode.NotFound);
        public static Error NotFoundCVEducation() => new("Không tìm thấy học vấn", HttpStatusCode.NotFound);
        public static Error NotFoundCVExperience() => new("Không tìm thấy kinh nghiệm", HttpStatusCode.NotFound);
        public static Error NotFoundCVProject() => new("Không tìm thấy dự án", HttpStatusCode.NotFound);
        public static Error InvalidFile() => new("File không hợp lệ", HttpStatusCode.BadRequest);
        public static Error InvalidFile(string message) => new(message, HttpStatusCode.BadRequest);
        public static Error ExternalServiceError(string message) => new($"Lỗi dịch vụ bên ngoài: {message}", HttpStatusCode.ServiceUnavailable);
        public static Error NotFoundSkill() => new("Không tìm thấy kỹ năng", HttpStatusCode.NotFound);
        public static Error CantDelete() => new("Không thể xóa", HttpStatusCode.BadRequest);
        public static Error CantCreate() => new("Không thể tạo", HttpStatusCode.BadRequest);
        public static Error NoMoreSaveCVCount() => new("Đã hết lượt lưu CV", HttpStatusCode.BadRequest);
        public static Error NotConfirmEmail() => new("Email chưa được xác nhận", HttpStatusCode.BadRequest);
        public static Error AccountIsBand() => new("Tài khoản đã bị khóa", HttpStatusCode.BadRequest);
        public static Error CantUpdate() => new("Không thể cập nhật", HttpStatusCode.BadRequest);
        public static Error IsApplyJob() => new("Đã ứng tuyển công việc này", HttpStatusCode.BadRequest);
        public static Error NotFoundCandidateJob() => new("Không tìm thấy đơn ứng tuyển", HttpStatusCode.NotFound);
        public static Error NotFoundCandidateStage() => new("Không tìm thấy giai đoạn ứng viên", HttpStatusCode.NotFound);
        public static Error NotFoundReport() => new("Không tìm thấy báo cáo", HttpStatusCode.NotFound);
        public static Error NotFoundSaveJob() => new("Không tìm thấy công việc đã lưu", HttpStatusCode.NotFound);
        public static Error NotFoundSaveCV() => new("Không tìm thấy CV đã lưu", HttpStatusCode.NotFound);
        public static Error InvalidFileType() => new("Định dạng file không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG, GIF.", HttpStatusCode.BadRequest);
        public static Error FileSizeExceeded() => new("Kích thước file vượt quá giới hạn. Tối đa 5MB.", HttpStatusCode.BadRequest);
        public static Error EmailAlreadyExists() => new("Email đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.", HttpStatusCode.BadRequest);
        public static Error RoleNotFound() => new("Không tìm thấy vai trò.", HttpStatusCode.BadRequest);
        public static Error CreateUserFailed(string errors) => new($"Tạo người dùng thất bại: {errors}", HttpStatusCode.BadRequest);
        public static Error AssignRoleFailed() => new("Gán vai trò cho người dùng thất bại.", HttpStatusCode.InternalServerError);
        public static Error NotFoundServicePlan() => new("Không tìm thấy gói dịch vụ", HttpStatusCode.NotFound);
        public static Error NotFoundJobQuota() => new("Không tìm thấy hạn mức đăng tin", HttpStatusCode.NotFound);
        
        // UpdateResult specific errors
        public static Error InvalidResultValue() => new("Giá trị Result chỉ được phép là 'Pass' hoặc 'Fail'", HttpStatusCode.BadRequest);
        public static Error InvalidStageProgression() => new("Chỉ được phép chuyển ứng viên đến giai đoạn tiếp theo", HttpStatusCode.BadRequest);
        public static Error CannotMoveToPreviousStage() => new("Không thể chuyển ứng viên về giai đoạn trước đó", HttpStatusCode.BadRequest);
        public static Error JobStageNotBelongToJob() => new("Giai đoạn được chỉ định không thuộc về công việc này", HttpStatusCode.BadRequest);
        public static Error InvalidCandidateStageStatus() => new("Ứng viên chưa được lên lịch hẹn. Cần lên lịch trước khi cập nhật kết quả", HttpStatusCode.BadRequest);
        public static Error InvalidCandidateStageStatus(string customMessage) => new(customMessage, HttpStatusCode.BadRequest);
        public static Error NotFoundHighlightJob() => new("Không tìm thấy gói nổi bật tin tuyển dụng", HttpStatusCode.NotFound);
        public static Error NotFoundExtensionJob() => new("Không tìm thấy gói gia hạn tin tuyển dụng", HttpStatusCode.NotFound);
        public static Error NotFoundPosition() => new("Không tìm thấy vị trí", HttpStatusCode.NotFound);
        public static Error DuplicatePosition() => new("Vị trí với tên này đã tồn tại", HttpStatusCode.BadRequest);
        public static Error AlreadyExists() => new("Tên đã tồn tại ở cấp độ này", HttpStatusCode.BadRequest);
    }
}
