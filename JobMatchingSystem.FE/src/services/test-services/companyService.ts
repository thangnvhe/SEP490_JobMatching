import type { Company } from '@/models/company';
import type { JobTest } from '@/models/job';

// Mock companies data
const MOCK_COMPANIES: Company[] = [
  {
    id: 'company-1',
    name: 'TechCorp Vietnam',
    description: 'Leading technology company specializing in software development, AI solutions, and digital transformation. We help businesses modernize their operations with cutting-edge technology.',
    website: 'https://techcorp.vn',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
    address: 'Lầu 10, Tòa nhà ABC, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    phone: '+84 28 3825 6789',
    email: 'contact@techcorp.vn',
    status: { ACTIVE: 'active', INACTIVE: 'inactive', PENDING: 'pending' },
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z'
  },
  {
    id: 'company-2', 
    name: 'Green Energy Solutions',
    description: 'Pioneering renewable energy solutions across Vietnam. We develop and implement sustainable energy projects including solar, wind, and hydroelectric power systems.',
    website: 'https://greenenergy.com.vn',
    logo: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=200',
    address: '45 Lê Lợi, Quận 3, TP. Hồ Chí Minh',
    phone: '+84 28 3827 4567',
    email: 'info@greenenergy.com.vn',
    status: { ACTIVE: 'active', INACTIVE: 'inactive', PENDING: 'pending' },
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2024-10-18T00:00:00Z'
  },
  {
    id: 'company-3',
    name: 'FinanceMax Co., Ltd',
    description: 'Premier financial services provider offering comprehensive banking solutions, investment advisory, and fintech innovations for both individuals and businesses.',
    website: 'https://financemax.vn',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92157aa?w=200',
    address: '78 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh',
    phone: '+84 28 3829 1234',
    email: 'hello@financemax.vn',
    status: { ACTIVE: 'active', INACTIVE: 'inactive', PENDING: 'pending' },
    createdAt: '2022-11-10T00:00:00Z',
    updatedAt: '2024-10-22T00:00:00Z'
  }
];

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

  async getCompanyById(id: string): Promise<Company | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const company = MOCK_COMPANIES.find(c => c.id === id);
    return company || null;
  }

  async getAllCompanies(): Promise<Company[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    return MOCK_COMPANIES;
  }

  async getSimilarCompanies(companyId: string, limit: number = 3): Promise<Company[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return MOCK_COMPANIES
      .filter(company => company.id !== companyId)
      .slice(0, limit);
  }

  async getCompanyJobs(companyId: string): Promise<JobTest[]> {
    // Import jobs from jobService to avoid circular dependency
    const { jobService } = await import('./jobService');
    const allJobs = await jobService.searchJobs({ keyword: '', page: 1, limit: 100, sortBy: 'latest' });
    
    const companyName = MOCK_COMPANIES.find(c => c.id === companyId)?.name;
    if (!companyName) return [];
    
    // Filter jobs by company (in real implementation, this would be done on backend)
    return allJobs.jobs.filter(job => 
      job.company.name.toLowerCase().includes(companyName.toLowerCase())
    ).slice(0, 6);
  }

  async followCompany(_companyId: string): Promise<{ success: boolean; message: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Đã theo dõi công ty thành công!'
    };
  }

  async unfollowCompany(_companyId: string): Promise<{ success: boolean; message: string }> {
    // Simulate API call  
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Đã bỏ theo dõi công ty!'
    };
  }
}

export const companyService = new CompanyService();