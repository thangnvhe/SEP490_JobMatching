import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Users, Globe, Calendar, ExternalLink } from 'lucide-react';
import type { JobTest } from '@/models/job';

interface CompanyInfoProps {
  job: JobTest;
  onViewAllJobs?: () => void;
  className?: string;
}

export const CompanyInfo: React.FC<CompanyInfoProps> = ({
  job,
  onViewAllJobs,
  className = '',
}) => {
  // Mock company data - in real app, this would come from API
  const companyData = {
    id: job.company.id,
    name: job.company.name,
    logo: job.company.logo,
    description: "We are a leading technology company focused on delivering innovative solutions that transform businesses and improve people's lives. Our team of experts works with cutting-edge technologies to create products that make a difference.",
    website: 'https://example.com',
    employees: '1000-5000',
    founded: '2010',
    industry: job.category.name,
    locations: [`${job.location.city}, ${job.location.country}`, 'Remote'],
    totalJobs: 25,
    culture: ['Innovation', 'Teamwork', 'Growth', 'Diversity'],
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Building className="h-5 w-5 text-emerald-600" />
          <span>About {job.company.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Header */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {job.company.logo ? (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-16 h-16 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-semibold text-xl">
                  {job.company.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {job.company.name}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {companyData.description}
            </p>
          </div>
        </div>

        {/* Company Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Company Size</p>
              <p className="font-medium text-gray-900">{companyData.employees}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Founded</p>
              <p className="font-medium text-gray-900">{companyData.founded}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Building className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Industry</p>
              <p className="font-medium text-gray-900">{companyData.industry}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Locations</p>
              <p className="font-medium text-gray-900">
                {companyData.locations.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Company Culture */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Company Culture</h4>
          <div className="flex flex-wrap gap-2">
            {companyData.culture.map((value, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                {value}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:text-gray-900"
            onClick={() => window.open(companyData.website, '_blank')}
          >
            <Globe className="h-4 w-4 mr-2" />
            Visit Website
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
          
          {onViewAllJobs && (
            <Button
              variant="outline"
              className="flex-1 border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
              onClick={onViewAllJobs}
            >
              <Building className="h-4 w-4 mr-2" />
              View All Jobs ({companyData.totalJobs})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};