import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Globe,
  Users,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  Award,
  Target,
  Eye,
  Calendar,
  Briefcase
} from "lucide-react";

// Services
import { CompanyServices } from "@/services/company.service";

// Types
import type { Company } from "@/models/company";
import { getStatusString } from "@/models/company";

// Utils
import { API_BASE_URL } from "../../../../env.ts";

// -----------------------------------------------------------------
// COMPONENT: CompanyDetailHeader
// -----------------------------------------------------------------

interface CompanyDetailHeaderProps {
  company: Company;
}

const CompanyDetailHeader: React.FC<CompanyDetailHeaderProps> = ({ company }) => {
  const navigate = useNavigate();

  // Helper function to get logo URL
  const getLogoUrl = (logoPath?: string): string | undefined => {
    if (!logoPath) return undefined;
    
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
  };

  const handleVisitWebsite = () => {
    if (company.website) {
      window.open(company.website, "_blank");
    }
  };

  const statusBadgeColor = company.status === 1 ? "default" : "secondary";
  const statusText = company.status === 1 ? "Đã được duyệt" : getStatusString(company.status);

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200">
              {company.logo ? (
                <img
                  src={getLogoUrl(company.logo)}
                  alt={`${company.name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${company.logo ? 'hidden' : ''}`}>
                <Building2 className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" />
              </div>
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
                  <Badge variant={statusBadgeColor} className="flex-shrink-0">
                    {statusText}
                  </Badge>
                </div>

                {/* Location */}
                {company.address && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm lg:text-base truncate">
                      {company.address}
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-600 text-sm lg:text-base line-clamp-3 mb-4">
                  {company.description}
                </p>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
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
                  {company.phoneContact && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{company.phoneContact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex lg:flex-col gap-2 lg:w-40">
                <Button
                  onClick={() => navigate('/companies')}
                  variant="outline"
                  className="flex-1 lg:w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>

                {company.website && (
                  <Button
                    onClick={handleVisitWebsite}
                    variant="default"
                    className="flex-1 lg:w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// -----------------------------------------------------------------
// COMPONENT: CompanyAbout
// -----------------------------------------------------------------

interface CompanyAboutProps {
  company: Company;
}

const CompanyAbout: React.FC<CompanyAboutProps> = ({ company }) => {
  // Mock additional data cho demo
  const companyDetails = {
    industry: "Công nghệ thông tin",
    companySize: "500-1000 nhân viên",
    foundedYear: "2010",
    workingDays: "Thứ 2 - Thứ 6",
    workingHours: "8:00 - 17:30",
    benefits: [
      "Bảo hiểm sức khỏe toàn diện",
      "Thưởng hiệu suất hàng tháng", 
      "Đào tạo và phát triển nghề nghiệp",
      "Môi trường làm việc năng động",
      "Team building hàng quý",
      "Flexible working time",
    ],
    mission: "Cung cấp các giải pháp công nghệ tiên tiến, giúp doanh nghiệp chuyển đổi số thành công và phát triển bền vững trong kỷ nguyên số.",
    vision: "Trở thành công ty công nghệ hàng đầu Việt Nam, đồng hành cùng khách hàng trong hành trình chuyển đổi số và phát triển kinh doanh.",
    values: [
      "Đổi mới sáng tạo",
      "Chất lượng đầu tiên", 
      "Khách hàng là trung tâm",
      "Làm việc nhóm hiệu quả",
      "Phát triển bền vững",
    ],
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
          <p className="text-gray-600 leading-relaxed">{company.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Ngành nghề</div>
                <div className="font-semibold text-gray-900">
                  {companyDetails.industry}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Quy mô</div>
                <div className="font-semibold text-gray-900">
                  {companyDetails.companySize}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Thành lập</div>
                <div className="font-semibold text-gray-900">
                  {companyDetails.foundedYear}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Địa điểm</div>
                <div className="font-semibold text-gray-900">
                  {company.address || "Chưa cập nhật"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Website</div>
                <div className="font-semibold text-gray-900 truncate">
                  {company.website
                    ? new URL(company.website).hostname
                    : "Chưa cập nhật"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Liên hệ</div>
                <div className="font-semibold text-gray-900">
                  {company.phoneContact || "Chưa cập nhật"}
                </div>
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
              <Badge
                key={index}
                variant="secondary"
                className="justify-center py-2 px-3"
              >
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
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
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
              <h4 className="font-semibold text-gray-900 mb-2">
                Thời gian làm việc
              </h4>
              <p className="text-gray-600">{companyDetails.workingDays}</p>
              <p className="text-gray-600">{companyDetails.workingHours}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Văn hóa công ty
              </h4>
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

// -----------------------------------------------------------------
// MAIN COMPONENT: CompanyDetailPage
// -----------------------------------------------------------------

const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      if (!id) {
        setError("ID công ty không hợp lệ");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await CompanyServices.getCompanyById(id);
        
        if (response?.isSuccess && response?.result) {
          setCompany(response.result);
        } else {
          setError("Không thể tải thông tin công ty");
        }
      } catch (err) {
        setError("Không thể tải thông tin công ty");
        console.error("Error fetching company details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyDetail();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Đang tải thông tin công ty...
              </h2>
              <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || "Không tìm thấy thông tin công ty"}
              </h2>
              <p className="text-gray-500 mb-6">
                Có lỗi xảy ra khi tải thông tin công ty hoặc công ty không tồn tại.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/companies')} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại danh sách
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Thử lại
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <CompanyDetailHeader company={company} />

        {/* Company Details Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 lg:w-auto lg:grid-cols-1 lg:flex lg:h-auto lg:bg-transparent lg:p-0 lg:space-x-2">
              <TabsTrigger value="about" className="lg:bg-white lg:border lg:border-gray-200 lg:shadow-sm lg:data-[state=active]:bg-blue-50 lg:data-[state=active]:text-blue-700 lg:data-[state=active]:border-blue-200">
                Về công ty
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <CompanyAbout company={company} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
//       description: "Hoạt động team building hàng năm",
//     },
//     {
//       id: "6",
//       url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500",
//       title: "Khu vực làm việc mở",
//       category: "office",
//       description: "Open workspace khuyến khích collaboration",
//     },
//     {
//       id: "7",
//       url: "https://images.unsplash.com/photo-1553028826-f4804151e0d2?w=500",
//       title: "Sản phẩm công nghệ",
//       category: "product",
//       description: "Demo sản phẩm AI solution mới nhất",
//     },
//     {
//       id: "8",
//       url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
//       title: "All-hands meeting",
//       category: "event",
//       description: "Cuộc họp toàn công ty hàng quý",
//     },
//   ];

//   const categories = [
//     { key: "all", label: "Tất cả", count: galleryImages.length },
//     {
//       key: "office",
//       label: "Văn phòng",
//       count: galleryImages.filter((img) => img.category === "office").length,
//     },
//     {
//       key: "team",
//       label: "Đội ngũ",
//       count: galleryImages.filter((img) => img.category === "team").length,
//     },
//     {
//       key: "event",
//       label: "Sự kiện",
//       count: galleryImages.filter((img) => img.category === "event").length,
//     },
//     {
//       key: "product",
//       label: "Sản phẩm",
//       count: galleryImages.filter((img) => img.category === "product").length,
//     },
//   ];

//   const filteredImages =
//     selectedCategory === "all"
//       ? galleryImages
//       : galleryImages.filter((img) => img.category === selectedCategory);

//   const getCategoryIcon = (category: string) => {
//     switch (category) {
//       case "office":
//         return <Building2 className="w-4 h-4" />;
//       case "team":
//         return <Users className="w-4 h-4" />;
//       case "event":
//         return <Camera className="w-4 h-4" />;
//       case "product":
//         return <MapPin className="w-4 h-4" />; // (Maybe a different icon? Using MapPin as per original)
//       default:
//         return <Camera className="w-4 h-4" />;
//     }
//   };

//   const openImageModal = (image: GalleryImage) => {
//     setSelectedImage(image);
//   };

//   const closeImageModal = () => {
//     setSelectedImage(null);
//   };

//   const navigateImage = (direction: "prev" | "next") => {
//     if (!selectedImage) return;

//     const currentIndex = filteredImages.findIndex(
//       (img) => img.id === selectedImage.id
//     );
//     let newIndex;

//     if (direction === "prev") {
//       newIndex =
//         currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
//     } else {
//       newIndex =
//         currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
//     }

//     setSelectedImage(filteredImages[newIndex]);
//   };

//   if (galleryImages.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Camera className="w-5 h-5 text-purple-600" />
//             Hình ảnh công ty
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-12">
//             <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//               Chưa có hình ảnh
//             </h3>
//             <p className="text-gray-500">
//               {companyName} chưa cập nhật hình ảnh về công ty.
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <>
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle className="flex items-center gap-2">
//               <Camera className="w-5 h-5 text-purple-600" />
//               Hình ảnh công ty
//               <Badge variant="secondary" className="ml-2">
//                 {galleryImages.length} ảnh
//               </Badge>
//             </CardTitle>
//           </div>

//           {/* Category Filter */}
//           <div className="flex flex-wrap gap-2 mt-4">
//             {categories.map((category) => (
//               <Button
//                 key={category.key}
//                 variant={
//                   selectedCategory === category.key ? "default" : "outline"
//                 }
//                 size="sm"
//                 onClick={() => setSelectedCategory(category.key)}
//                 className="flex items-center gap-2"
//               >
//                 {getCategoryIcon(category.key)}
//                 {category.label}
//                 <Badge variant="secondary" className="ml-1 text-xs">
//                   {category.count}
//                 </Badge>
//               </Button>
//             ))}
//           </div>
//         </CardHeader>

//         <CardContent>
//           {/* Image Grid */}
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {filteredImages.map((image) => (
//               <div
//                 key={image.id}
//                 className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 aspect-square"
//                 onClick={() => openImageModal(image)}
//               >
//                 <img
//                   src={image.url}
//                   alt={image.title}
//                   className="w-full h-full object-cover transition-transform group-hover:scale-105"
//                 />
//                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
//                   <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
//                 </div>
//                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
//                   <p className="text-white text-sm font-medium truncate">
//                     {image.title}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {filteredImages.length === 0 && (
//             <div className="text-center py-12">
//               <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500">
//                 Không có ảnh nào trong danh mục này
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Image Modal */}
//       {selectedImage && (
//         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
//           <div className="relative max-w-4xl max-h-full">
//             {/* Close Button */}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={closeImageModal}
//               className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
//             >
//               <X className="w-6 h-6" />
//             </Button>

//             {/* Navigation Buttons */}
//             {filteredImages.length > 1 && (
//               <>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => navigateImage("prev")}
//                   className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
//                 >
//                   <ChevronLeft className="w-8 h-8" />
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => navigateImage("next")}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
//                 >
//                   <ChevronRight className="w-8 h-8" />
//                 </Button>
//               </>
//             )}

//             {/* Image */}
//             <img
//               src={selectedImage.url}
//               alt={selectedImage.title}
//               className="max-w-full max-h-[80vh] object-contain rounded-lg"
//             />

//             {/* Image Info */}
//             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
//               <h3 className="text-white text-xl font-semibold mb-2">
//                 {selectedImage.title}
//               </h3>
//               {selectedImage.description && (
//                 <p className="text-white/80 text-sm">
//                   {selectedImage.description}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// // -----------------------------------------------------------------
// // COMPONENT 6: CompanyDetailPage (Component chính, có export default)
// // -----------------------------------------------------------------

// const CompanyDetailPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [company, setCompany] = useState<Company | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [activeTab, setActiveTab] = useState("about");

//   useEffect(() => {
//     const fetchCompany = async () => {
//       if (!id) {
//         setError("ID công ty không hợp lệ");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         setIsLoading(true);
//         setError(null);

//         const companyData = await companyService.getCompanyById(id);

//         if (!companyData) {
//           setError("Không tìm thấy công ty");
//           return;
//         }

//         setCompany(companyData);

//         // TODO: Check if user is following this company (would come from auth context)
//         // Giả sử API check follow trả về true/false
//         // const followStatus = await companyService.checkFollowStatus(id);
//         // setIsFollowing(followStatus);
//         setIsFollowing(false); // Tạm thời hardcode
//       } catch (err) {
//         console.error("Error fetching company:", err);
//         setError("Có lỗi xảy ra khi tải thông tin công ty");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCompany();
//   }, [id]); // Chạy lại khi ID thay đổi

//   const handleFollow = async () => {
//     if (!company) return;

//     try {
//       // Giả sử service trả về { success: boolean, message: string }
//       const result = await companyService.followCompany(company.id);
//       if (result.success) {
//         setIsFollowing(true);
//         toast.success(result.message);
//       } else {
//         toast.error("Không thể theo dõi công ty");
//       }
//     } catch (error) {
//       toast.error("Có lỗi xảy ra");
//     }
//   };

//   const handleUnfollow = async () => {
//     if (!company) return;

//     try {
//       const result = await companyService.unfollowCompany(company.id);
//       if (result.success) {
//         setIsFollowing(false);
//         toast.success(result.message);
//       } else {
//         toast.error("Không thể bỏ theo dõi công ty");
//       }
//     } catch (error) {
//       toast.error("Có lỗi xảy ra");
//     }
//   };

//   const handleGoBack = () => {
//     navigate(-1); // Quay lại trang trước đó
//   };

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="container mx-auto px-4 py-8">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <div className="text-center">
//               <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">
//                 Đang tải thông tin công ty...
//               </h2>
//               <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error || !company) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="container mx-auto px-4 py-8">
//           <div className="flex items-center justify-center min-h-[400px]">
//             <div className="text-center">
//               <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">
//                 {error || "Không tìm thấy công ty"}
//               </h2>
//               <p className="text-gray-500 mb-6">
//                 Công ty bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
//               </p>
//               <div className="flex gap-3 justify-center">
//                 <Button variant="outline" onClick={handleGoBack}>
//                   <ArrowLeft className="w-4 h-4 mr-2" />
//                   Quay lại
//                 </Button>
//                 <Button onClick={() => navigate("/companies")}>
//                   <Building2 className="w-4 h-4 mr-2" />
//                   Xem tất cả công ty
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // --- Render khi có dữ liệu ---
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-6">
//         {/* Breadcrumb/Back Button */}
//         <div className="mb-6">
//           <Button
//             variant="ghost"
//             onClick={handleGoBack}
//             className="text-gray-600 hover:text-gray-900"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Quay lại
//           </Button>
//         </div>

//         {/* Company Header */}
//         <div className="mb-8">
//           {/* Component 'CompanyDetailHeader' được gọi ở đây */}
//           <CompanyDetailHeader
//             company={company}
//             isFollowing={isFollowing}
//             onFollow={handleFollow}
//             onUnfollow={handleUnfollow}
//           />
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Main Content */}
//           <div className="lg:col-span-2 space-y-8">
//             <Tabs
//               value={activeTab}
//               onValueChange={setActiveTab}
//               className="w-full"
//             >
//               <TabsList className="grid w-full grid-cols-4">
//                 <TabsTrigger value="about" className="flex items-center gap-2">
//                   <Info className="w-4 h-4" />
//                   <span className="hidden sm:inline">Giới thiệu</span>
//                 </TabsTrigger>
//                 <TabsTrigger value="jobs" className="flex items-center gap-2">
//                   <Briefcase className="w-4 h-4" />
//                   <span className="hidden sm:inline">Việc làm</span>
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="gallery"
//                   className="flex items-center gap-2"
//                 >
//                   <Camera className="w-4 h-4" />
//                   <span className="hidden sm:inline">Hình ảnh</span>
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="similar"
//                   className="flex items-center gap-2"
//                 >
//                   <Building2 className="w-4 h-4" />
//                   <span className="hidden sm:inline">Tương tự</span>
//                 </TabsTrigger>
//               </TabsList>

//               <TabsContent value="about" className="mt-6">
//                 {/* Component 'CompanyAbout' được gọi ở đây */}
//                 <CompanyAbout company={company} />
//               </TabsContent>

//               <TabsContent value="jobs" className="mt-6">
//                 {/* Component 'CompanyJobs' được gọi ở đây */}
//                 <CompanyJobs
//                   companyId={company.id}
//                   companyName={company.name}
//                 />
//               </TabsContent>

//               <TabsContent value="gallery" className="mt-6">
//                 {/* Component 'CompanyGallery' được gọi ở đây */}
//                 <CompanyGallery companyName={company.name} />
//               </TabsContent>

//               <TabsContent value="similar" className="mt-6">
//                 {/* Component 'SimilarCompanies' được gọi ở đây */}
//                 <SimilarCompanies
//                   currentCompanyId={company.id}
//                   currentCompanyName={company.name}
//                 />
//               </TabsContent>
//             </Tabs>
//           </div>

//           {/* Right Column - Sidebar */}
//           <div className="space-y-6">
//             {/* Quick Actions */}
//             <div className="lg:sticky lg:top-6">
//               <div className="space-y-6">
//                 {/* Company Jobs (chỉ hiển thị trên mobile, ẩn trên desktop) */}
//                 <div className="lg:hidden">
//                   <CompanyJobs
//                     companyId={company.id}
//                     companyName={company.name}
//                   />
//                 </div>

//                 {/* Similar Companies (chỉ hiển thị trên desktop) */}
//                 <div className="lg:block hidden">
//                   <SimilarCompanies
//                     currentCompanyId={company.id}
//                     currentCompanyName={company.name}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CompanyDetailPage;
