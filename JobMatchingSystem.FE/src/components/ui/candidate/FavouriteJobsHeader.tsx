import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconSearch, IconSortDescending, IconFilter } from "@tabler/icons-react";

interface FavouriteJobsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function FavouriteJobsHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: FavouriteJobsHeaderProps) {
  return (
    <div className="px-4 lg:px-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Favourite Jobs</h1>
        <p className="text-muted-foreground">
          Manage and track your saved job opportunities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, company..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-3">
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <IconSortDescending className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateAdded">Date Added</SelectItem>
              <SelectItem value="jobTitle">Job Title</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Filter Button */}
          <Button variant="outline" className="lg:hidden">
            <IconFilter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
}