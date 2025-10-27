import type { Company } from '@/models/company';

// Mock data - trong thực tế sẽ call API
export interface CompanyContactForm {
  name: string;
  description: string;
  website: string;
  address: string;
  phone: string;
  email: string;
  contactPersonName: string;
  contactPersonEmail: string;
  message?: string;
}

export interface CompanySubmissionResponse {
  success: boolean;
  message: string;
  companyId?: string;
}

class CompanyService {
  async submitCompanyContact(formData: CompanyContactForm): Promise<CompanySubmissionResponse> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email) || !emailRegex.test(formData.contactPersonEmail)) {
        throw new Error('Email không hợp lệ');
      }

      // Validate phone format
      const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Số điện thoại không hợp lệ');
      }

      // Simulate success response
      const companyId = `company_${Date.now()}`;
      
      console.log('Company submitted with draft status:', {
        ...formData,
        id: companyId,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Thông tin công ty đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
        companyId
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại'
      };
    }
  }

  async getCompanyByEmail(_email: string): Promise<Company | null> {
    // Simulate API call to check if company already exists
    await new Promise(resolve => setTimeout(resolve, 500));
    return null; // In real implementation, return existing company if found
  }
}

export const companyService = new CompanyService();