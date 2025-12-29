import { useState } from "react";
import { FavouriteJobsHeader } from "@/components/ui/candidate/FavouriteJobsHeader";
import { FavouriteJobsStats } from "@/components/ui/candidate/FavouriteJobsStats";

export default function FavouriteJobsPage() {
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

          {/* Main content area - TODO: Implement new job list component */}
          <div className="px-4 lg:px-6">
            <p className="text-muted-foreground">Job list will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
}