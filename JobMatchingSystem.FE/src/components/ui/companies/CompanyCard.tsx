import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Users, 
  Building2,
  ExternalLink,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import type { Company } from '@/models/company';
import { getStatusString } from '@/models/company';
import { API_BASE_URL } from '../../../../env.ts';

interface CompanyCardProps {
  company: Company;
  onViewDetails?: (companyId: number) => void;
  className?: string;
}

// Helper function to get logo URL
const getLogoUrl = (logoPath?: string): string | undefined => {
  if (!logoPath) return undefined;
  
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
};

// Helper function to get status badge color
const getStatusBadgeColor = (status: number) => {
  switch (status) {
    case 0:
      return 'bg-yellow-100 text-yellow-800';
    case 1:
      return 'bg-green-100 text-green-800';
    case 3:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onViewDetails,
  className = ''
}) => {
  const handleViewDetails = () => {
    onViewDetails?.(company.id);
  };

  const statusLabel = getStatusString(company.status);

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 group cursor-pointer ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <Avatar className="w-16 h-16 rounded-xl">
              <AvatarImage 
                src={getLogoUrl(company.logo)} 
                alt={`${company.name} logo`}
                className="object-cover"
              />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold rounded-xl text-lg">
                {company.name?.charAt(0)?.toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Company Info */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {company.name}
                </h3>
                <Badge className={`mt-1 text-xs ${getStatusBadgeColor(company.status)}`}>
                  {statusLabel === 'Approved' ? 'Đang tuyển dụng' : 
                   statusLabel === 'Pending' ? 'Chờ duyệt' : 'Tạm dừng'}
                </Badge>
              </div>
            </div>

            {/* Location */}
            {company.address && (
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  {company.address}
                </span>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-1 mb-3">
              {company.email && (
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{company.email}</span>
                </div>
              )}
              {company.phoneContact && (
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span>{company.phoneContact}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {company.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {company.description}
              </p>
            )}

            {/* Stats - Mock data for now */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>100+ nhân viên</span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>Công nghệ</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="flex-1 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Button>
              
              {company.website && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(company.website, '_blank');
                  }}
                  className="flex-shrink-0"
                  title="Xem website"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};