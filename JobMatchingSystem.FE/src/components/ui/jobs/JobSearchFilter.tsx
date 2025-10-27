import React, { useState } from 'react';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { JobSearchFilters } from '@/models/job';
import { 
  MOCK_CATEGORIES, 
  MOCK_JOB_TYPES, 
  MOCK_EXPERIENCE_LEVELS, 
  MOCK_DATE_POSTED_OPTIONS,
  MOCK_POPULAR_TAGS,
  MOCK_LOCATIONS
} from '@/models/job';

interface JobSearchFilterProps {
  filters: JobSearchFilters;
  onFiltersChange: (filters: JobSearchFilters) => void;
  className?: string;
}

export const JobSearchFilter: React.FC<JobSearchFilterProps> = ({
  filters,
  onFiltersChange,
  className = '',
}) => {
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [salaryRange] = useState({
    min: filters.salaryRange?.min || 0,
    max: filters.salaryRange?.max || 9999,
  });

  const handleInputChange = (field: keyof JobSearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handleArrayChange = (field: keyof JobSearchFilters, value: string, checked: boolean) => {
    const currentArray = (filters[field] as string[]) || [];
    let newArray: string[];

    if (checked) {
      newArray = [...currentArray, value];
    } else {
      newArray = currentArray.filter(item => item !== value);
    }

    onFiltersChange({
      ...filters,
      [field]: newArray,
    });
  };

  const handleSalaryRangeApply = () => {
    onFiltersChange({
      ...filters,
      salaryRange: salaryRange,
    });
  };

  const renderFilterSection = (
    title: string,
    options: Array<{ id: string; name: string; count?: number; value?: string }>,
    field: keyof JobSearchFilters,
    showMore?: boolean,
    onShowMoreToggle?: () => void
  ) => {
    const displayOptions = showMore ? options : options.slice(0, 5);
    const fieldValue = (filters[field] as string[]) || [];

    return (
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="space-y-3">
          {displayOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${field}-${option.id}`}
                  checked={fieldValue.includes(option.value || option.id)}
                  onCheckedChange={(checked) => 
                    handleArrayChange(field, option.value || option.id, checked as boolean)
                  }
                  className="border-gray-400"
                />
                <label
                  htmlFor={`${field}-${option.id}`}
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {option.name}
                </label>
              </div>
              {option.count && (
                <Badge variant="secondary" className="bg-white text-gray-600 border border-gray-200">
                  {option.count}
                </Badge>
              )}
            </div>
          ))}
          {options.length > 5 && onShowMoreToggle && (
            <Button
              variant="default"
              size="sm"
              onClick={onShowMoreToggle}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {showMore ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`bg-emerald-50 border-none shadow-sm ${className}`}>
      <CardContent className="p-6 space-y-8">
        {/* Search by Job Title */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-gray-900">Search by Job Title</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Job title or company"
              value={filters.keyword || ''}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
              className="pl-10 bg-white border-gray-200 h-12"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-gray-900">Location</h3>
          <Select value={filters.location || ''} onValueChange={(value) => handleInputChange('location', value)}>
            <SelectTrigger className="bg-white border-gray-200 h-12">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <SelectValue placeholder="Choose city" />
              </div>
              <ChevronDown className="h-4 w-4" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_LOCATIONS.map((location) => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}, {location.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        {renderFilterSection(
          'Category',
          MOCK_CATEGORIES,
          'categories',
          showMoreCategories,
          () => setShowMoreCategories(!showMoreCategories)
        )}

        {/* Job Type */}
        {renderFilterSection('Job Type', MOCK_JOB_TYPES, 'jobTypes')}

        {/* Experience Level */}
        {renderFilterSection('Experience Level', MOCK_EXPERIENCE_LEVELS, 'experienceLevels')}

        {/* Date Posted */}
        {renderFilterSection('Date Posted', MOCK_DATE_POSTED_OPTIONS, 'datePosted')}

        {/* Salary Range */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-gray-900">Salary</h3>
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg p-4 border border-gray-200">
              {/* Simple range visualization */}
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div 
                  className="absolute h-full bg-emerald-600 rounded-full"
                  style={{ 
                    left: `${(salaryRange.min / 100000) * 100}%`,
                    width: `${((salaryRange.max - salaryRange.min) / 100000) * 100}%` 
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span className="flex items-center">
                  <div className="w-5 h-5 bg-emerald-600 rounded-full mr-2"></div>
                  ${salaryRange.min.toLocaleString()}
                </span>
                <span className="flex items-center">
                  <div className="w-5 h-5 bg-emerald-600 rounded-full mr-2"></div>
                  ${salaryRange.max.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-gray-900">
                Salary: ${salaryRange.min.toLocaleString()} - ${salaryRange.max.toLocaleString()}
              </p>
              <Button
                size="sm"
                onClick={handleSalaryRangeApply}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
          <div className="flex flex-wrap gap-3">
            {MOCK_POPULAR_TAGS.map((tag) => {
              const isSelected = (filters.tags || []).includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleArrayChange('tags', tag, !isSelected)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};