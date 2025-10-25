import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { IconX, IconRefresh } from "@tabler/icons-react";

interface FavouriteJobsFiltersProps {
  filters: {
    jobType: string;
    location: string;
    salary: string;
    dateAdded: string;
    company: string;
  };
  onFiltersChange: (filters: any) => void;
}

const jobTypes = [
  { id: "full-time", label: "Full-time", count: 32 },
  { id: "part-time", label: "Part-time", count: 8 },
  { id: "contract", label: "Contract", count: 5 },
  { id: "remote", label: "Remote", count: 28 },
  { id: "hybrid", label: "Hybrid", count: 15 },
];

const locations = [
  { id: "ho-chi-minh", label: "Ho Chi Minh City", count: 18 },
  { id: "hanoi", label: "Hanoi", count: 15 },
  { id: "da-nang", label: "Da Nang", count: 7 },
  { id: "remote", label: "Remote", count: 12 },
  { id: "other", label: "Other Cities", count: 5 },
];

const companies = [
  { id: "tech-innovate", label: "Tech Innovate Inc.", count: 3 },
  { id: "design-studio", label: "Design Studio Pro", count: 2 },
  { id: "startup-xyz", label: "StartupXYZ", count: 4 },
  { id: "innovation-labs", label: "Innovation Labs", count: 2 },
  { id: "others", label: "Others", count: 36 },
];

export function FavouriteJobsFilters({ filters, onFiltersChange }: FavouriteJobsFiltersProps) {
  const clearAllFilters = () => {
    onFiltersChange({
      jobType: "all",
      location: "all",
      salary: "all",
      dateAdded: "all",
      company: "all",
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== "all").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <IconRefresh className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (value === "all") return null;
              return (
                <Badge key={key} variant="secondary" className="text-xs">
                  {value}
                  <IconX 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => onFiltersChange({ ...filters, [key]: "all" })}
                  />
                </Badge>
              );
            })}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Type */}
        <div>
          <h4 className="font-medium mb-3">Job Type</h4>
          <div className="space-y-2">
            {jobTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={type.id}
                    checked={filters.jobType === type.id}
                    onCheckedChange={(checked) => {
                      onFiltersChange({
                        ...filters,
                        jobType: checked ? type.id : "all"
                      });
                    }}
                  />
                  <label htmlFor={type.id} className="text-sm cursor-pointer">
                    {type.label}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground">({type.count})</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Location */}
        <div>
          <h4 className="font-medium mb-3">Location</h4>
          <div className="space-y-2">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={location.id}
                    checked={filters.location === location.id}
                    onCheckedChange={(checked) => {
                      onFiltersChange({
                        ...filters,
                        location: checked ? location.id : "all"
                      });
                    }}
                  />
                  <label htmlFor={location.id} className="text-sm cursor-pointer">
                    {location.label}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground">({location.count})</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Salary Range */}
        <div>
          <h4 className="font-medium mb-3">Salary Range</h4>
          <Select 
            value={filters.salary} 
            onValueChange={(value) => onFiltersChange({ ...filters, salary: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select salary range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ranges</SelectItem>
              <SelectItem value="under-1000">Under $1,000</SelectItem>
              <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
              <SelectItem value="2000-3000">$2,000 - $3,000</SelectItem>
              <SelectItem value="3000-4000">$3,000 - $4,000</SelectItem>
              <SelectItem value="above-4000">Above $4,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Added */}
        <div>
          <h4 className="font-medium mb-3">Date Added</h4>
          <Select 
            value={filters.dateAdded} 
            onValueChange={(value) => onFiltersChange({ ...filters, dateAdded: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Company */}
        <div>
          <h4 className="font-medium mb-3">Company</h4>
          <div className="space-y-2">
            {companies.map((company) => (
              <div key={company.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={company.id}
                    checked={filters.company === company.id}
                    onCheckedChange={(checked) => {
                      onFiltersChange({
                        ...filters,
                        company: checked ? company.id : "all"
                      });
                    }}
                  />
                  <label htmlFor={company.id} className="text-sm cursor-pointer">
                    {company.label}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground">({company.count})</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}