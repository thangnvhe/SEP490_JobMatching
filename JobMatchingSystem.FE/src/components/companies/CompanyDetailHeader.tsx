import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Globe, 
  Users, 
  Calendar,
  Heart,
  Share2,
  ExternalLink,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import type { Company } from '@/models/company';
import { toast } from 'sonner';

interface CompanyDetailHeaderProps {
  company: Company;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export const CompanyDetailHeader: React.FC<CompanyDetailHeaderProps> = ({
  company,
  isFollowing = false,
  onFollow,
  onUnfollow
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    setIsLoading(true);
    try {
      if (following) {
        await onUnfollow?.();
        setFollowing(false);
        toast.success('Đã bỏ theo dõi công ty');
      } else {
        await onFollow?.();
        setFollowing(true);
        toast.success('Đã theo dõi công ty');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: company.name,
          text: company.description,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Đã sao chép link');
      }
    } catch (error) {
      toast.error('Không thể chia sẻ');
    }
  };

  const handleVisitWebsite = () => {
    if (company.website) {
      window.open(company.website, '_blank');
    }
  };

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Company Name & Status */}
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    {company.name}
                  </h1>
                  <Badge 
                    variant={company.status.ACTIVE === 'active' ? 'default' : 'secondary'}
                    className="flex-shrink-0"
                  >
                    {company.status.ACTIVE === 'active' ? 'Đang tuyển dụng' : 'Tạm dừng'}
                  </Badge>
                </div>

                {/* Location */}
                {company.address && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm lg:text-base truncate">{company.address}</span>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-600 text-sm lg:text-base line-clamp-2 mb-4">
                  {company.description}
                </p>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-900">500+</div>
                    <div className="text-xs text-gray-500">Nhân viên</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-900">IT</div>
                    <div className="text-xs text-gray-500">Ngành nghề</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(company.createdAt).getFullYear()}
                    </div>
                    <div className="text-xs text-gray-500">Thành lập</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Heart className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-900">1.2k</div>
                    <div className="text-xs text-gray-500">Theo dõi</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {company.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>{new URL(company.website).hostname}</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{company.email}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex lg:flex-col gap-2 lg:w-40">
                <Button
                  onClick={handleFollowToggle}
                  disabled={isLoading}
                  variant={following ? 'outline' : 'default'}
                  className="flex-1 lg:w-full"
                >
                  <Heart className={`w-4 h-4 mr-2 ${following ? 'fill-current text-red-500' : ''}`} />
                  {isLoading ? 'Đang xử lý...' : following ? 'Đã theo dõi' : 'Theo dõi'}
                </Button>

                <div className="flex gap-2 lg:w-full">
                  {company.website && (
                    <Button
                      onClick={handleVisitWebsite}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Website
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Chia sẻ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};