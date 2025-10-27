import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Globe, 
  MapPin,
  Calendar,
  Target,
  Eye,
  Award,
  Briefcase
} from 'lucide-react';
import type { Company } from '@/models/company';

interface CompanyAboutProps {
  company: Company;
}

export const CompanyAbout: React.FC<CompanyAboutProps> = ({ company }) => {
  // Mock additional data - in real app this would come from API
  const companyDetails = {
    industry: 'Công nghệ thông tin',
    companySize: '500-1000 nhân viên',
    foundedYear: new Date(company.createdAt).getFullYear(),
    workingDays: 'Thứ 2 - Thứ 6',
    workingHours: '8:00 - 17:30',
    benefits: [
      'Bảo hiểm sức khỏe toàn diện',
      'Thưởng hiệu suất hàng tháng',
      'Đào tạo và phát triển nghề nghiệp',
      'Môi trường làm việc năng động',
      'Team building hàng quý',
      'Flexible working time'
    ],
    mission: 'Cung cấp các giải pháp công nghệ tiên tiến, giúp doanh nghiệp chuyển đổi số thành công và phát triển bền vững trong kỷ nguyên số.',
    vision: 'Trở thành công ty công nghệ hàng đầu Việt Nam, đồng hành cùng khách hàng trong hành trình chuyển đổi số và phát triển kinh doanh.',
    values: [
      'Đổi mới sáng tao',
      'Chất lượng đầu tiên', 
      'Khách hàng là trung tâm',
      'Làm việc nhóm hiệu quả',
      'Phát triển bền vững'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Tổng quan công ty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            {company.description}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Ngành nghề</div>
                <div className="font-semibold text-gray-900">{companyDetails.industry}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Quy mô</div>
                <div className="font-semibold text-gray-900">{companyDetails.companySize}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Thành lập</div>
                <div className="font-semibold text-gray-900">{companyDetails.foundedYear}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Địa điểm</div>
                <div className="font-semibold text-gray-900">TP. Hồ Chí Minh</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Website</div>
                <div className="font-semibold text-gray-900 truncate">
                  {company.website ? new URL(company.website).hostname : 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Giờ làm việc</div>
                <div className="font-semibold text-gray-900">{companyDetails.workingHours}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Sứ mệnh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              {companyDetails.mission}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Tầm nhìn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              {companyDetails.vision}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Giá trị cốt lõi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {companyDetails.values.map((value, index) => (
              <Badge key={index} variant="secondary" className="justify-center py-2 px-3">
                {value}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits & Perks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-600" />
            Quyền lợi & Phúc lợi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {companyDetails.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Working Environment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Môi trường làm việc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Thời gian làm việc</h4>
              <p className="text-gray-600">{companyDetails.workingDays}</p>
              <p className="text-gray-600">{companyDetails.workingHours}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Văn hóa công ty</h4>
              <p className="text-gray-600">
                Môi trường làm việc thân thiện, cởi mở và khuyến khích sự sáng tạo. 
                Công ty luôn tạo điều kiện để nhân viên phát triển và thăng tiến trong sự nghiệp.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};