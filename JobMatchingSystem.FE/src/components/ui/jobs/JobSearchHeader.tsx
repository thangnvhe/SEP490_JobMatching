import React, { useState, useEffect } from "react";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProvinceService, type Province } from "@/services/province.service";

interface JobSearchHeaderProps {
  keyword: string;
  location: string;
  onKeywordChange: (keyword: string) => void;
  onLocationChange: (location: string) => void;
  onSearch: () => void;
  onToggleFilter?: () => void;
  showFilterToggle?: boolean;
  className?: string;
}

const JobSearchHeader: React.FC<JobSearchHeaderProps> = ({
  keyword,
  location,
  onKeywordChange,
  onLocationChange,
  onSearch,
  onToggleFilter,
  showFilterToggle = false,
  className = "",
}) => {
  const [localKeyword, setLocalKeyword] = useState(keyword);
  const [localLocation, setLocalLocation] = useState(location);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const provinceList = await ProvinceService.getProvinces();
        setProvinces(provinceList);
      } catch (error) {
        console.error('Error loading provinces:', error);
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  const handleSearch = () => {
    onKeywordChange(localKeyword);
    onLocationChange(localLocation === 'all' ? '' : localLocation);
    onSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div
      className={`bg-gradient-to-r from-emerald-600 to-emerald-700 ${className}`}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Tiêu đề */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">
              Tìm kiếm công việc mơ ước
            </h1>
            <p className="text-emerald-100 text-lg">
              Khám phá hàng ngàn cơ hội việc làm phù hợp với bạn
            </p>
          </div>

          {/* Form tìm kiếm */}
          <Card className="p-2 bg-white shadow-lg">
            <div className="flex flex-col md:flex-row gap-2">
              {/* Keyword Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nhập vị trí công việc, kỹ năng..."
                  value={localKeyword}
                  onChange={(e) => setLocalKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-4 py-3 border-0 focus-visible:ring-0 text-base"
                />
              </div>

              {/* Divider - ẩn trên mobile */}
              <div className="hidden md:block w-px bg-gray-200 my-2"></div>

              {/* Location Search */}
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select
                  value={localLocation || "all"}
                  onValueChange={setLocalLocation}
                  disabled={loadingProvinces}
                >
                  <SelectTrigger className="pl-10 pr-4 py-3 border-0 focus-visible:ring-0 text-base h-auto w-full">
                    <SelectValue
                      placeholder={
                        loadingProvinces ? "Đang tải..." : "Chọn tỉnh thành..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tỉnh thành</SelectItem>
                    {provinces.map((province) => (
                      <SelectItem key={province.id} value={province.name}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="flex gap-2">
                {showFilterToggle && (
                  <Button
                    variant="outline"
                    onClick={onToggleFilter}
                    className="px-4 py-3 md:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium min-w-fit"
                >
                  <Search className="h-4 w-4 mr-2 md:hidden" />
                  <span className="hidden md:inline">Tìm kiếm</span>
                  <span className="md:hidden">Tìm</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Từ khóa phổ biến */}
          <div className="space-y-3">
            <p className="text-emerald-100 text-sm">Từ khóa phổ biến:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Frontend Developer",
                "Backend Developer",
                "UI/UX Designer",
                "Product Manager",
                "Data Analyst",
                "Marketing",
              ].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalKeyword(tag);
                    onKeywordChange(tag);
                    onSearch();
                  }}
                  className="text-emerald-700 border-emerald-200 bg-white/90 hover:bg-white hover:border-emerald-300 text-xs px-3 py-1"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearchHeader;