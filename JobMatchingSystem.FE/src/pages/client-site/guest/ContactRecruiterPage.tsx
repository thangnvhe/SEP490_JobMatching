import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Clock, MapPin, Building2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { companyService, type CompanyContactForm } from '@/services/test-services/companyService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ContactSuccessModal } from '@/components/ui/ContactSuccessModal';

const ContactRecruiterPage: React.FC = () => {
  const [formData, setFormData] = useState<CompanyContactForm>({
    name: '',
    description: '',
    website: '',
    address: '',
    phone: '',
    email: '',
    contactPersonName: '',
    contactPersonEmail: '',
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitResult(null);

    try {
      const result = await companyService.submitCompanyContact(formData);
      setSubmitResult(result);
      
      if (result.success) {
        // Show success modal
        setShowSuccessModal(true);
        // Reset form on success
        setFormData({
          name: '',
          description: '',
          website: '',
          address: '',
          phone: '',
          email: '',
          contactPersonName: '',
          contactPersonEmail: '',
          message: ''
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Có lỗi xảy ra, vui lòng thử lại'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ContactSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        companyName={formData.name}
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Section - Information */}
          <div className="space-y-8">
            {/* Header Text */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Kết Nối Với Những Tài Năng Xuất Sắc
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Tham gia cùng chúng tôi để tìm kiếm và tuyển dụng những ứng viên tài năng nhất. 
                  Hệ thống matching thông minh giúp bạn tiết kiệm thời gian và chi phí tuyển dụng.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Hotline tư vấn</h3>
                    <p className="text-lg font-medium text-gray-700">+84 (28) 3822-6895</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Email hỗ trợ</h3>
                    <p className="text-lg font-medium text-gray-700">support@jobmatching.vn</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Giờ làm việc</h3>
                    <p className="text-lg font-medium text-gray-700">T2 - T6: 8:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Văn phòng</h3>
                    <p className="text-lg font-medium text-gray-700">
                      Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div>
            <Card className="bg-teal-50 border-0 shadow-lg">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Thông Tin Công Ty
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Vui lòng cung cấp thông tin về công ty của bạn
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {submitResult && (
                  <Alert className={submitResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    {submitResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={submitResult.success ? 'text-green-800' : 'text-red-800'}>
                      {submitResult.message}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Company Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Tên công ty <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Tên công ty của bạn"
                        required
                        className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-sm font-semibold text-gray-700">
                        Website
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://company.com"
                        className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Company Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email công ty <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contact@company.com"
                      required
                      className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  {/* Company Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Mô tả công ty <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả ngắn gọn về công ty, lĩnh vực hoạt động..."
                      required
                      rows={4}
                      className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        Số điện thoại <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+84 xxx xxx xxx"
                        required
                        className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPersonName" className="text-sm font-semibold text-gray-700">
                        Tên người liên hệ <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactPersonName"
                        name="contactPersonName"
                        value={formData.contactPersonName}
                        onChange={handleInputChange}
                        placeholder="Họ và tên"
                        required
                        className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Contact Person Email */}
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonEmail" className="text-sm font-semibold text-gray-700">
                      Email người liên hệ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactPersonEmail"
                      name="contactPersonEmail"
                      type="email"
                      value={formData.contactPersonEmail}
                      onChange={handleInputChange}
                      placeholder="your-email@company.com"
                      required
                      className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                      Địa chỉ công ty <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Địa chỉ chi tiết của công ty"
                      required
                      rows={3}
                      className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  {/* Additional Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700">
                      Thông tin bổ sung
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Thông tin thêm về nhu cầu tuyển dụng, số lượng nhân viên cần tuyển..."
                      rows={4}
                      className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang gửi...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Gửi Thông Tin</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ContactRecruiterPage;