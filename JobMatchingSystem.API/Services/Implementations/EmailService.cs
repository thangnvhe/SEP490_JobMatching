using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Net.Mail;
using System.Net;
using OfficeOpenXml.FormulaParsing.LexicalAnalysis;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly string _frontendBaseUrl = "http://localhost:5173";
        private readonly IConfiguration _configuration;

        public EmailService(IOptions<EmailSettings> options, IConfiguration configuration)
        {
            _settings = options.Value;
            _configuration = configuration;
        }
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var message = new MailMessage();
            message.From = new MailAddress(_settings.SenderEmail, _settings.SenderName);
            message.To.Add(toEmail);
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = true;

            using var client = new SmtpClient(_settings.SmtpServer, _settings.SmtpPort)
            {
                Credentials = new NetworkCredential(_settings.Username, _settings.Password),
                EnableSsl = _settings.EnableSsl
            };

            await client.SendMailAsync(message);
        }
        public async Task SendResetPasswordEmailAsync(string toEmail, string token)
        {
            string resetLink = $"{_frontendBaseUrl}/reset-password?token={token}&email={toEmail}";
            string subject = "Yêu cầu đặt lại mật khẩu - JobMatching System";

            string body = $@"
        <h2>Đặt lại mật khẩu của bạn</h2>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
        <a href='{resetLink}' 
           style='display:inline-block; padding:10px 20px; background-color:#007bff; color:#fff; border-radius:5px; text-decoration:none;'>
           Đặt lại mật khẩu
        </a>
        <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email.</p>
        ";

            await SendEmailAsync(toEmail, subject, body);
        }
        public async Task SendEmailConfirmationAsync(string toEmail, string fullName, string token)
        {
            // Tiêu đề email
            string subject = "Xác nhận email - JobMatching System";

            // Link xác nhận email (frontend sẽ nhận token này để gọi API Verify)
            string confirmationUrl = $"{_frontendBaseUrl}/confirm-email?token={token}";

            // Nội dung email (HTML)
            string body = $@"
        <h2>Chào {fullName}</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn vào nút bên dưới để xác nhận email:</p>
        <a href='{confirmationUrl}' 
           style='display:inline-block; padding:10px 20px; background-color:#28a745; color:#fff; border-radius:5px; text-decoration:none;'>
           Xác nhận email
        </a>
        <p>Nếu bạn không đăng ký, hãy bỏ qua email này.</p>
    ";

            // Gửi email sử dụng hàm SendEmailAsync có sẵn
            await SendEmailAsync(toEmail, subject, body);

        }
        public async Task SendWelcomeEmailAsync(string toEmail, string fullName)
        {
            string subject = "Chào mừng đến với JobMatching System!";

            string body = $@"
        <h2>Chào {fullName},</h2>
        <p>Chúc mừng! Email của bạn đã được xác nhận thành công.</p>
        <p>Bây giờ bạn có thể đăng nhập và bắt đầu khám phá các cơ hội việc làm trên hệ thống.</p>
        <p>Cảm ơn bạn đã đăng ký!</p>
        <hr>
        <p>JobMatching System Team</p>
    ";

            // Gọi hàm gửi email chung
            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendCompanyApprovedEmailAsync(string toEmail, string fullName, string token, string companyName)
        {
            string resetLink = $"{_frontendBaseUrl}/reset-password?token={token}&email={toEmail}";
            string subject = "Công ty của bạn đã được duyệt - JobMatching System";

            string body = $@"
    <h2>Chào {WebUtility.HtmlEncode(fullName)}</h2>
    <p>Xin chúc mừng! Công ty <strong>{WebUtility.HtmlEncode(companyName)}</strong> của bạn đã được duyệt.</p>
    <p>Để hoàn tất việc kích hoạt tài khoản recruiter và đặt mật khẩu, vui lòng nhấn vào nút bên dưới:</p>
    <a href='{resetLink}' 
       style='display:inline-block; padding:10px 20px; background-color:#007bff; color:#fff; border-radius:5px; text-decoration:none;'>
       Đặt mật khẩu và đăng nhập
    </a>
    <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
    ";

            await SendEmailAsync(toEmail, subject, body);
        }
        public async Task SendCompanyRejectedEmailAsync(string toEmail, string fullName, string companyName, string rejectReason)
        {
            string subject = "Công ty của bạn đã bị từ chối - JobMatching System";

            string body = $@"
        <h2>Chào {WebUtility.HtmlEncode(fullName)}</h2>
        <p>Rất tiếc! Công ty <strong>{WebUtility.HtmlEncode(companyName)}</strong> của bạn đã bị từ chối đăng ký.</p>
        <p>Lý do từ chối: {WebUtility.HtmlEncode(rejectReason)}</p>
        <p>Vui lòng liên hệ bộ phận hỗ trợ nếu bạn có thắc mắc.</p>
        <hr>
        <p>JobMatching System Team</p>
    ";

            await SendEmailAsync(toEmail, subject, body);
        }
        public async Task SendHmPasswordEmailAsync(string toEmail, string fullName, string password)
        {
            string subject = "Tài khoản Hiring Manager - JobMatching System";

            string body = $@"
    <h2>Chào {WebUtility.HtmlEncode(fullName)}</h2>
    <p>Tài khoản Hiring Manager của bạn đã được tạo thành công.</p>
    <p>Thông tin đăng nhập:</p>
    <ul>
        <li>Email: {WebUtility.HtmlEncode(toEmail)}</li>
        <li>Mật khẩu: <strong>{WebUtility.HtmlEncode(password)}</strong></li>
    </ul>
    <p>Vui lòng đăng nhập và thay đổi mật khẩu ngay sau lần đầu đăng nhập.</p>
    <hr>
    <p>JobMatching System Team</p>
    ";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendJobClosedNotificationAsync(string toEmail, string candidateName, string jobTitle, string companyName)
        {
            string subject = "Thông báo: Vị trí công việc đã bị đóng - JobMatching System";

            string body = $@"
    <h2>Chào {WebUtility.HtmlEncode(candidateName)}</h2>
    <p>Chúng tôi rất tiếc phải thông báo rằng vị trí công việc mà bạn đã ứng tuyển đã bị đóng.</p>
    <div style='background-color:#f8f9fa; padding:15px; border-left:4px solid #dc3545; margin:20px 0;'>
        <h3>Chi tiết vị trí:</h3>
        <p><strong>Tên công việc:</strong> {WebUtility.HtmlEncode(jobTitle)}</p>
        <p><strong>Công ty:</strong> {WebUtility.HtmlEncode(companyName)}</p>
        <p><strong>Trạng thái:</strong> Đã đóng</p>
    </div>
    <p>Lý do đóng: Nhà tuyển dụng phụ trách vị trí này đã ngừng hoạt động trên hệ thống.</p>
    <p>Chúng tôi khuyến khích bạn tiếp tục tìm kiếm các cơ hội việc làm khác trên JobMatching System.</p>
    <hr>
    <p>Cảm ơn bạn đã sử dụng JobMatching System!</p>
    <p>JobMatching System Team</p>
    ";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendCompanyClosedNotificationAsync(string toEmail, string candidateName, string jobTitle, string companyName)
        {
            string subject = "Thông báo: Công ty ngừng hoạt động - JobMatching System";

            string body = $@"
    <h2>Chào {WebUtility.HtmlEncode(candidateName)}</h2>
    <p>Chúng tôi rất tiếc phải thông báo rằng công ty mà bạn đã ứng tuyển đã ngừng hoạt động trên hệ thống.</p>
    <div style='background-color:#f8f9fa; padding:15px; border-left:4px solid:#dc3545; margin:20px 0;'>
        <h3>Chi tiết:</h3>
        <p><strong>Tên công việc:</strong> {WebUtility.HtmlEncode(jobTitle)}</p>
        <p><strong>Công ty:</strong> {WebUtility.HtmlEncode(companyName)}</p>
        <p><strong>Trạng thái:</strong> Công ty ngừng hoạt động</p>
    </div>
    <p>Do công ty này đã ngừng hoạt động trên hệ thống JobMatching, tất cả các vị trí tuyển dụng của họ đã được đóng.</p>
    <p>Chúng tôi khuyến khích bạn tiếp tục tìm kiếm các cơ hội việc làm khác từ những công ty đang hoạt động trên JobMatching System.</p>
    <p style='color:#28a745; font-weight:bold;'>💼 Hãy khám phá thêm nhiều cơ hội việc làm tuyệt vời khác trên hệ thống của chúng tôi!</p>
    <hr>
    <p>Cảm ơn bạn đã sử dụng JobMatching System!</p>
    <p>JobMatching System Team</p>
    ";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendJobDeletedNotificationAsync(string toEmail, string fullName, string jobTitle, string companyName)
        {
            string subject = "Thông báo: Vị trí tuyển dụng đã bị gỡ bỏ - JobMatching System";

            string body = $@"
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;'>
        <div style='background-color: #ffffff; padding: 30px; border-radius: 10px; border-left: 4px solid #dc3545;'>
            <div style='text-align: center; margin-bottom: 30px;'>
                <h1 style='color: #dc3545; margin: 0; font-size: 24px;'>Thông báo cập nhật vị trí tuyển dụng</h1>
            </div>
            
            <div style='color: #495057; line-height: 1.6;'>
                <p style='margin-bottom: 20px;'>Chào <strong>{WebUtility.HtmlEncode(fullName)}</strong>,</p>
                
                <p style='margin-bottom: 20px;'>Chúng tôi rất tiếc phải thông báo rằng vị trí tuyển dụng <strong>'{WebUtility.HtmlEncode(jobTitle)}'</strong> tại <strong>{WebUtility.HtmlEncode(companyName)}</strong> đã bị gỡ bỏ khỏi hệ thống.</p>
                
                <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;'>
                    <h3 style='color: #856404; margin: 0 0 10px 0; font-size: 16px;'>Ảnh hưởng đến đơn ứng tuyển của bạn:</h3>
                    <ul style='margin: 10px 0; padding-left: 20px; color: #6c757d;'>
                        <li>Trạng thái đơn ứng tuyển của bạn đã được cập nhật tương ứng</li>
                        <li>Không có xử lý thêm nào cho vị trí cụ thể này</li>
                        <li>Điều này không ảnh hưởng đến các đơn ứng tuyển khác hoặc tài khoản của bạn</li>
                    </ul>
                </div>
                
                <div style='background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;'>
                    <h3 style='color: #155724; margin: 0 0 10px 0; font-size: 16px;'>Bạn có thể làm gì tiếp theo:</h3>
                    <ul style='margin: 10px 0; padding-left: 20px; color: #155724;'>
                        <li>Duyệt qua các cơ hội việc làm tương tự trên nền tảng của chúng tôi</li>
                        <li>Kiểm tra các vị trí khác tại {WebUtility.HtmlEncode(companyName)}</li>
                        <li>Cập nhật sở thích công việc để nhận được những kết quả phù hợp hơn</li>
                        <li>Tiếp tục xây dựng hồ sơ của bạn cho các cơ hội trong tương lai</li>
                    </ul>
                </div>
                
                <p style='margin-bottom: 20px;'>Chúng tôi hiểu điều này có thể khiến bạn thất vọng, và chúng tôi cam kết giúp bạn tìm được cơ hội phù hợp.</p>
                
                <p style='margin-bottom: 20px;'>Nếu bạn có bất kỳ câu hỏi nào về đơn ứng tuyển của mình hoặc cần hỗ trợ, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
                
                <div style='background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;'>
                    <p style='margin: 0; color: #1565c0; font-weight: bold;'>💼 Hãy tiếp tục khám phá - công việc hoàn hảo đang chờ bạn!</p>
                </div>
            </div>
            
            <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;'>
                <p style='margin: 5px 0; color: #6c757d; font-size: 14px;'>Trân trọng,</p>
                <p style='margin: 5px 0; color: #495057; font-weight: bold;'>Đội ngũ JobMatching System</p>
                <p style='margin: 15px 0 5px 0; color: #6c757d; font-size: 12px;'>Đây là thông báo tự động, vui lòng không trả lời email này.</p>
            </div>
        </div>
    </div>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendFalseReportNotificationAsync(string toEmail, string fullName, string jobTitle, string companyName)
        {
            var subject = "Thông báo: Báo cáo không chính xác - JobMatching System";

            var body = $@"
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;'>
        <div style='background-color: #ffffff; padding: 30px; border-radius: 10px; border-left: 4px solid #dc3545;'>
            <div style='text-align: center; margin-bottom: 30px;'>
                <h1 style='color: #dc3545; margin: 0; font-size: 24px;'>⚠️ Thông báo về báo cáo không chính xác</h1>
            </div>
            
            <div style='color: #495057; line-height: 1.6;'>
                <p style='margin-bottom: 20px;'>Chào <strong>{WebUtility.HtmlEncode(fullName)}</strong>,</p>
                
                <p style='margin-bottom: 20px;'>Báo cáo của bạn về công việc <strong>'{WebUtility.HtmlEncode(jobTitle)}'</strong> tại <strong>{WebUtility.HtmlEncode(companyName)}</strong> đã được xem xét và <strong>bị từ chối</strong> do không có căn cứ.</p>
                
                <div style='background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;'>
                    <h3 style='color: #721c24; margin: 0 0 10px 0; font-size: 16px;'>Hậu quả của báo cáo sai:</h3>
                    <ul style='margin: 10px 0; padding-left: 20px; color: #721c24;'>
                        <li>Điểm tín nhiệm của bạn đã bị trừ do báo cáo không chính xác</li>
                        <li>Việc báo cáo sai có thể ảnh hưởng đến uy tín tài khoản</li>
                        <li>Nếu tiếp tục báo cáo sai, tài khoản có thể bị tạm khóa</li>
                    </ul>
                </div>
                
                <div style='background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;'>
                    <h3 style='color: #856404; margin: 0 0 10px 0; font-size: 16px;'>💡 Lưu ý khi báo cáo:</h3>
                    <ul style='margin: 10px 0; padding-left: 20px; color: #856404;'>
                        <li>Chỉ báo cáo khi có bằng chứng cụ thể về vi phạm</li>
                        <li>Đọc kỹ quy định cộng đồng trước khi báo cáo</li>
                        <li>Báo cáo sai sẽ bị trừ điểm và có thể bị xử lý kỷ luật</li>
                        <li>Sử dụng tính năng báo cáo một cách có trách nhiệm</li>
                    </ul>
                </div>
                
                <p style='margin-bottom: 20px;'>Chúng tôi khuyến khích việc báo cáo các vi phạm thực sự để duy trì môi trường làm việc an toàn, tuy nhiên việc báo cáo sai sẽ được xử lý nghiêm khắc.</p>
                
                <div style='background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;'>
                    <p style='margin: 0; color: #1565c0; font-weight: bold;'>Hãy sử dụng tính năng báo cáo một cách có trách nhiệm!</p>
                </div>
            </div>
            
            <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;'>
                <p style='margin: 5px 0; color: #6c757d; font-size: 14px;'>Trân trọng,</p>
                <p style='margin: 5px 0; color: #495057; font-weight: bold;'>Đội ngũ JobMatching System</p>
                <p style='margin: 15px 0 5px 0; color: #6c757d; font-size: 12px;'>Đây là thông báo tự động, vui lòng không trả lời email này.</p>
            </div>
        </div>
    </div>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendJobClosedDueToReportAsync(string toEmail, string fullName, string jobTitle, string companyName, string reason)
        {
            var subject = $"Thông báo: Công việc đã bị đóng do vi phạm - JobMatching System";

            var body = $@"
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;'>
        <div style='background-color: #ffffff; padding: 30px; border-radius: 10px; border-left: 4px solid #dc3545;'>
            <div style='text-align: center; margin-bottom: 30px;'>
                <h1 style='color: #dc3545; margin: 0; font-size: 24px;'>🚫 Thông báo đóng công việc do vi phạm</h1>
            </div>
            
            <div style='color: #495057; line-height: 1.6;'>
                <p style='margin-bottom: 20px;'>Chào <strong>{WebUtility.HtmlEncode(fullName)}</strong>,</p>
                
                <p style='margin-bottom: 20px;'>Công việc <strong>'{WebUtility.HtmlEncode(jobTitle)}'</strong> tại <strong>{WebUtility.HtmlEncode(companyName)}</strong> đã bị đóng do vi phạm quy định của hệ thống.</p>
                
                <div style='background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;'>
                    <h3 style='color: #721c24; margin: 0 0 10px 0; font-size: 16px;'>Lý do vi phạm:</h3>
                    <p style='margin: 0; color: #721c24; font-weight: bold;'>{WebUtility.HtmlEncode(reason)}</p>
                </div>
                
                <div style='background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;'>
                    <h3 style='color: #856404; margin: 0 0 10px 0; font-size: 16px;'>Ảnh hưởng đến bạn:</h3>
                    <ul style='margin: 10px 0; padding-left: 20px; color: #856404;'>
                        <li>Công việc này đã bị đóng và không còn nhận ứng tuyển</li>
                        <li>Điểm tín nhiệm của công ty đã bị trừ</li>
                        <li>Tất cả ứng viên đang ứng tuyển đã được thông báo</li>
                        <li>Vui lòng tuân thủ quy định để tránh vi phạm tương tự</li>
                    </ul>
                </div>
                
                <div style='background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;'>
                    <h3 style='color: #155724; margin: 0 0 10px 0; font-size: 16px;'>Bước tiếp theo:</h3>
                    <ul style='margin: 10px 0; padding-left: 20px; color: #155724;'>
                        <li>Xem xét và tuân thủ đúng quy định đăng tin tuyển dụng</li>
                        <li>Đảm bảo thông tin công việc chính xác và trung thực</li>
                        <li>Liên hệ hỗ trợ nếu cần làm rõ vi phạm: support@jobmatching.vn</li>
                        <li>Tạo tin tuyển dụng mới với nội dung phù hợp</li>
                    </ul>
                </div>
                
                <p style='margin-bottom: 20px;'>Chúng tôi cam kết duy trì một môi trường tuyển dụng an toàn và minh bạch cho tất cả người dùng.</p>
            </div>
            
            <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;'>
                <p style='margin: 5px 0; color: #6c757d; font-size: 14px;'>Trân trọng,</p>
                <p style='margin: 5px 0; color: #495057; font-weight: bold;'>Đội ngũ JobMatching System</p>
                <p style='margin: 15px 0 5px 0; color: #6c757d; font-size: 12px;'>Đây là thông báo tự động, vui lòng không trả lời email này.</p>
            </div>
        </div>
    </div>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendAccountSuspensionNotificationAsync(string toEmail, string fullName, string reason, bool isCompany)
        {
            var accountType = isCompany ? "công ty" : "ứng viên";
            var subject = $"Thông báo: Tạm khóa tài khoản {accountType} - JobMatching System";

            var body = $@"
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;'>
        <div style='background-color: #ffffff; padding: 30px; border-radius: 10px; border-left: 4px solid #dc3545;'>
            <div style='text-align: center; margin-bottom: 30px;'>
                <h1 style='color: #dc3545; margin: 0; font-size: 24px;'>⚠️ Thông báo tạm khóa tài khoản</h1>
            </div>
            
            <div style='color: #495057; line-height: 1.6;'>
                <p style='margin-bottom: 20px;'>Kính chào <strong>{WebUtility.HtmlEncode(fullName)}</strong>,</p>
                
                <p style='margin-bottom: 20px;'>Tài khoản {accountType} của bạn đã bị tạm khóa do vi phạm các quy định của hệ thống JobMatching.</p>
                
                <div style='background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;'>
                    <h3 style='color: #721c24; margin: 0 0 10px 0; font-size: 16px;'>Lý do tạm khóa:</h3>
                    <p style='margin: 0; color: #721c24; font-weight: bold;'>{WebUtility.HtmlEncode(reason)}</p>
                </div>
                
                <div style='background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;'>
                    <h3 style='color: #856404; margin: 0 0 10px 0; font-size: 16px;'>Hậu quả của việc tạm khóa:</h3>
                    <ul style='margin: 10px 0; padding-left: 20px; color: #856404;'>
                        <li>Tài khoản của bạn đã bị vô hiệu hóa tạm thời</li>
                        <li>Bạn không thể truy cập vào hệ thống</li>
                        <li>{(isCompany ? "Tất cả các tin tuyển dụng đã bị đóng" : "Tất cả các đơn ứng tuyển đang xử lý đã bị hủy")}</li>
                    </ul>
                </div>
                
                <div style='background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;'>
                    <h3 style='color: #155724; margin: 0 0 10px 0; font-size: 16px;'>Cách khôi phục tài khoản:</h3>
                    <p style='margin: 10px 0; color: #155724;'>Để khôi phục tài khoản, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi qua các kênh sau:</p>
                    <ul style='margin: 10px 0; padding-left: 20px; color: #155724;'>
                        <li><strong>Email hỗ trợ:</strong> support@jobmatching.vn</li>
                        <li><strong>Hotline:</strong> 1900-xxxx (8:00 - 17:00, T2-T6)</li>
                        <li><strong>Website:</strong> <a href='#' style='color: #007bff;'>jobmatching.vn/support</a></li>
                    </ul>
                    <p style='margin: 10px 0; color: #155724; font-style: italic;'>Vui lòng cung cấp thông tin tài khoản và giải trình về vấn đề vi phạm để được xem xét khôi phục.</p>
                </div>
                
                <div style='background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;'>
                    <h3 style='color: #0c5460; margin: 0 0 10px 0; font-size: 16px;'>💡 Lưu ý quan trọng:</h3>
                    <ul style='margin: 10px 0; padding-left: 20px; color: #0c5460;'>
                        <li>Tài khoản có thể được khôi phục sau khi giải trình thỏa đáng</li>
                        <li>Hãy đọc kỹ quy định sử dụng để tránh vi phạm trong tương lai</li>
                        <li>Thời gian xử lý khiếu nại: 3-5 ngày làm việc</li>
                    </ul>
                </div>
                
                <p style='margin-bottom: 20px;'>Chúng tôi rất tiếc về sự bất tiện này và hy vọng sớm được hỗ trợ bạn khôi phục tài khoản.</p>
            </div>
            
            <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;'>
                <p style='margin: 5px 0; color: #6c757d; font-size: 14px;'>Trân trọng,</p>
                <p style='margin: 5px 0; color: #495057; font-weight: bold;'>Đội ngũ JobMatching System</p>
                <p style='margin: 15px 0 5px 0; color: #6c757d; font-size: 12px;'>Đây là thông báo tự động, vui lòng không trả lời email này.</p>
            </div>
        </div>
    </div>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendInterviewScheduleNotificationAsync(string toEmail, string candidateName, string jobTitle, string companyName, DateTime interviewDate, TimeOnly? startTime, TimeOnly? endTime, string? location, string? googleMeetLink, int candidateStageId)
        {
            var subject = $"Thông báo lịch phỏng vấn - {jobTitle} tại {companyName}";

            var interviewDateStr = interviewDate.ToString("dd/MM/yyyy");
            var interviewTimeStr = startTime.HasValue && endTime.HasValue 
                ? $"{startTime.Value:HH:mm} - {endTime.Value:HH:mm}"
                : "Chưa xác định";

            var locationInfo = !string.IsNullOrEmpty(location) 
                ? $"<p><strong>📍 Địa điểm:</strong> {WebUtility.HtmlEncode(location)}</p>"
                : "";

            var meetingLinkInfo = !string.IsNullOrEmpty(googleMeetLink)
                ? $@"
                <div style='background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0;'>
                    <p style='margin: 0 0 10px 0; color: #2e7d32;'><strong>🎥 Link phỏng vấn online:</strong></p>
                    <a href='{WebUtility.HtmlEncode(googleMeetLink)}' style='color: #1976d2; text-decoration: none; word-break: break-all;'>{WebUtility.HtmlEncode(googleMeetLink)}</a>
                </div>"
                : "";

            // Generate confirm/reject URLs (frontend URLs)
            var confirmUrl = $"{_frontendBaseUrl}/candidate/interview/confirm/{candidateStageId}";
            var rejectUrl = $"{_frontendBaseUrl}/candidate/interview/reject/{candidateStageId}";

            var body = $@"
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;'>
        <div style='background-color: #ffffff; padding: 30px; border-radius: 10px; border-left: 4px solid #28a745;'>
            <div style='text-align: center; margin-bottom: 30px;'>
                <h1 style='color: #28a745; margin: 0; font-size: 24px;'>📅 Thông báo lịch phỏng vấn</h1>
            </div>
            
            <div style='color: #495057; line-height: 1.6;'>
                <p style='margin-bottom: 20px;'>Kính chào <strong>{WebUtility.HtmlEncode(candidateName)}</strong>,</p>
                
                <p style='margin-bottom: 20px;'>Chúc mừng! Bạn đã được mời tham gia phỏng vấn cho vị trí <strong>{WebUtility.HtmlEncode(jobTitle)}</strong> tại <strong>{WebUtility.HtmlEncode(companyName)}</strong>.</p>
                
                <div style='background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;'>
                    <h3 style='color: #1565c0; margin: 0 0 15px 0; font-size: 16px;'>📋 Thông tin chi tiết:</h3>
                    <p style='margin: 8px 0;'><strong>💼 Vị trí:</strong> {WebUtility.HtmlEncode(jobTitle)}</p>
                    <p style='margin: 8px 0;'><strong>🏢 Công ty:</strong> {WebUtility.HtmlEncode(companyName)}</p>
                    <p style='margin: 8px 0;'><strong>📆 Ngày phỏng vấn:</strong> {interviewDateStr}</p>
                    <p style='margin: 8px 0;'><strong>🕐 Thời gian:</strong> {interviewTimeStr}</p>
                    {locationInfo}
                </div>

                {meetingLinkInfo}
                
                <div style='background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;'>
                    <h3 style='color: #856404; margin: 0 0 10px 0; font-size: 16px;'>⚠️ Lưu ý quan trọng:</h3>
                    <ul style='margin: 10px 0; padding-left: 20px; color: #856404;'>
                        <li>Vui lòng xác nhận hoặc từ chối lịch phỏng vấn trong vòng 24 giờ</li>
                        <li>Đến đúng giờ và chuẩn bị đầy đủ tài liệu cần thiết</li>
                        <li>Mặc trang phục lịch sự, chuyên nghiệp</li>
                        <li>Kiểm tra kết nối internet và thiết bị nếu phỏng vấn online</li>
                    </ul>
                </div>

                <div style='background-color: #f1f1f1; padding: 20px; border-radius: 8px; margin: 25px 0;'>
                    <h3 style='color: #333; margin: 0 0 20px 0; font-size: 16px; text-align: center;'>Vui lòng xác nhận lịch phỏng vấn:</h3>
                    <div style='text-align: center;'>
                        <a href='{confirmUrl}' style='display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;'>✅ Xác nhận tham gia</a>
                        <a href='{rejectUrl}' style='display: inline-block; background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;'>❌ Từ chối</a>
                    </div>
                </div>

                <div style='background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;'>
                    <h3 style='color: #155724; margin: 0 0 10px 0; font-size: 16px;'>💡 Gợi ý chuẩn bị phỏng vấn:</h3>
                    <ul style='margin: 10px 0; padding-left: 20px; color: #155724;'>
                        <li>Tìm hiểu kỹ về công ty và vị trí ứng tuyển</li>
                        <li>Chuẩn bị câu trả lời cho các câu hỏi phổ biến</li>
                        <li>Chuẩn bị câu hỏi để hỏi nhà tuyển dụng</li>
                        <li>Kiểm tra và cập nhật CV nếu cần</li>
                    </ul>
                </div>
                
                <p style='margin-bottom: 20px;'>Chúc bạn may mắn và thành công trong buổi phỏng vấn!</p>
            </div>
            
            <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;'>
                <p style='margin: 5px 0; color: #6c757d; font-size: 14px;'>Trân trọng,</p>
                <p style='margin: 5px 0; color: #495057; font-weight: bold;'>Đội ngũ JobMatching System</p>
                <p style='margin: 15px 0 5px 0; color: #6c757d; font-size: 12px;'>Đây là email tự động, vui lòng không trả lời trực tiếp email này.</p>
                <p style='margin: 5px 0; color: #6c757d; font-size: 12px;'>Nếu có thắc mắc, vui lòng liên hệ: support@jobmatching.vn</p>
            </div>
        </div>
    </div>";

            await SendEmailAsync(toEmail, subject, body);
        }
    }
}
