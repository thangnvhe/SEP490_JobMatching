import { useState } from "react";
import { FavouriteJobsHeader } from "@/components/ui/candidate/FavouriteJobsHeader";
import { FavouriteJobsFilters } from "@/components/ui/candidate/FavouriteJobsFilters";
import { FavouriteJobsList } from "@/components/ui/candidate/FavouriteJobsList";
import { FavouriteJobsStats } from "@/components/ui/candidate/FavouriteJobsStats";

export default function FavouriteJobsPage() {
  const [selectedFilters, setSelectedFilters] = useState({
    jobType: "all",
    location: "all",
    salary: "all",
    dateAdded: "all",
    company: "all",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <FavouriteJobsHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Stats */}
          <FavouriteJobsStats />

          {/* Main content area */}
          <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-4 lg:px-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <FavouriteJobsFilters 
                filters={selectedFilters}
                onFiltersChange={setSelectedFilters}
              />
            </div>

            {/* Jobs List */}
            <div className="lg:col-span-3">
              <FavouriteJobsList 
                searchQuery={searchQuery}
                filters={selectedFilters}
                sortBy={sortBy}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}