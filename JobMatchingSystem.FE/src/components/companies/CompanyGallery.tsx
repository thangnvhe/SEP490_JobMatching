import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  MapPin
} from 'lucide-react';

interface CompanyGalleryProps {
  companyName: string;
}

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: 'office' | 'team' | 'event' | 'product';
  description?: string;
}

export const CompanyGallery: React.FC<CompanyGalleryProps> = ({ companyName }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock gallery images - in real app this would come from API
  const galleryImages: GalleryImage[] = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500',
      title: 'Văn phòng làm việc chính',
      category: 'office',
      description: 'Không gian làm việc hiện đại và thoáng mát'
    },
    {
      id: '2', 
      url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500',
      title: 'Khu vực nghỉ ngơi',
      category: 'office',
      description: 'Không gian thư giãn cho nhân viên'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500',
      title: 'Đội ngũ phát triển',
      category: 'team',
      description: 'Team developers năng động và sáng tạo'
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500',
      title: 'Phòng họp Executive',
      category: 'office',
      description: 'Phòng họp hiện đại với đầy đủ tiện nghi'
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500',
      title: 'Team Building 2024',
      category: 'event',
      description: 'Hoạt động team building hàng năm'
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500',
      title: 'Khu vực làm việc mở',
      category: 'office',
      description: 'Open workspace khuyến khích collaboration'
    },
    {
      id: '7',
      url: 'https://images.unsplash.com/photo-1553028826-f4804151e0d2?w=500',
      title: 'Sản phẩm công nghệ',
      category: 'product',
      description: 'Demo sản phẩm AI solution mới nhất'
    },
    {
      id: '8',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      title: 'All-hands meeting',
      category: 'event',
      description: 'Cuộc họp toàn công ty hàng quý'
    }
  ];

  const categories = [
    { key: 'all', label: 'Tất cả', count: galleryImages.length },
    { key: 'office', label: 'Văn phòng', count: galleryImages.filter(img => img.category === 'office').length },
    { key: 'team', label: 'Đội ngũ', count: galleryImages.filter(img => img.category === 'team').length },
    { key: 'event', label: 'Sự kiện', count: galleryImages.filter(img => img.category === 'event').length },
    { key: 'product', label: 'Sản phẩm', count: galleryImages.filter(img => img.category === 'product').length }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'office': return <Building2 className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      case 'event': return <Camera className="w-4 h-4" />;
      case 'product': return <MapPin className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  const openImageModal = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    } else {
      newIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(filteredImages[newIndex]);
  };

  if (galleryImages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            Hình ảnh công ty
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có hình ảnh
            </h3>
            <p className="text-gray-500">
              {companyName} chưa cập nhật hình ảnh về công ty.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-600" />
              Hình ảnh công ty
              <Badge variant="secondary" className="ml-2">
                {galleryImages.length} ảnh
              </Badge>
            </CardTitle>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
                className="flex items-center gap-2"
              >
                {getCategoryIcon(category.key)}
                {category.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 aspect-square"
                onClick={() => openImageModal(image)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-sm font-medium truncate">{image.title}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có ảnh nào trong danh mục này</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            {filteredImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Image */}
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <h3 className="text-white text-xl font-semibold mb-2">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-white/80 text-sm">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};