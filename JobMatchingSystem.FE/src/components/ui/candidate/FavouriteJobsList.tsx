import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  IconMapPin, 
  IconClock, 
  IconCurrencyDollar, 
  IconBookmark, 
  IconBookmarkFilled,
  IconExternalLink,
  IconEye,
  IconBriefcase,
  IconBuilding
} from "@tabler/icons-react";

interface FavouriteJobsListProps {
  searchQuery: string;
  filters: any;
  sortBy: string;
}

const favouriteJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Tech Innovate Inc.",
    companyLogo: "https://i.pravatar.cc/150?u=tech-innovate",
    location: "Ho Chi Minh City",
    salary: "$2,500 - $3,500",
    jobType: "Full-time",
    isRemote: true,
    dateAdded: "2024-10-20",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    description: "We are looking for an experienced Frontend Developer to join our growing team...",
    matchScore: 95,
    isUrgent: false,
    applicationDeadline: "2024-11-15",
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "Design Studio Pro",
    companyLogo: "https://i.pravatar.cc/150?u=design-studio",
    location: "Hanoi",
    salary: "$1,800 - $2,800",
    jobType: "Full-time",
    isRemote: false,
    dateAdded: "2024-10-18",
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
    description: "Join our creative team and help design amazing user experiences...",
    matchScore: 87,
    isUrgent: true,
    applicationDeadline: "2024-10-30",
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "StartupXYZ",
    companyLogo: "https://i.pravatar.cc/150?u=startup-xyz",
    location: "Da Nang",
    salary: "$2,000 - $3,200",
    jobType: "Contract",
    isRemote: true,
    dateAdded: "2024-10-15",
    skills: ["Vue.js", "Python", "PostgreSQL", "Docker"],
    description: "Exciting opportunity to work with cutting-edge technologies...",
    matchScore: 82,
    isUrgent: false,
    applicationDeadline: "2024-11-20",
  },
  {
    id: 4,
    title: "Product Manager",
    company: "Innovation Labs",
    companyLogo: "https://i.pravatar.cc/150?u=innovation-labs",
    location: "Ho Chi Minh City",
    salary: "$3,000 - $4,500",
    jobType: "Full-time",
    isRemote: false,
    dateAdded: "2024-10-12",
    skills: ["Product Strategy", "Analytics", "Agile", "Leadership"],
    description: "Lead product development and drive strategic initiatives...",
    matchScore: 78,
    isUrgent: true,
    applicationDeadline: "2024-11-10",
  },
  {
    id: 5,
    title: "Data Scientist",
    company: "AI Solutions Co.",
    companyLogo: "https://i.pravatar.cc/150?u=ai-solutions",
    location: "Remote",
    salary: "$2,800 - $4,000",
    jobType: "Full-time",
    isRemote: true,
    dateAdded: "2024-10-10",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
    description: "Apply machine learning to solve real-world business problems...",
    matchScore: 90,
    isUrgent: false,
    applicationDeadline: "2024-11-25",
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company: "Cloud Tech Inc.",
    companyLogo: "https://i.pravatar.cc/150?u=cloud-tech",
    location: "Hanoi",
    salary: "$2,200 - $3,800",
    jobType: "Full-time",
    isRemote: true,
    dateAdded: "2024-10-08",
    skills: ["AWS", "Kubernetes", "Docker", "Terraform"],
    description: "Help build and maintain our cloud infrastructure...",
    matchScore: 85,
    isUrgent: false,
    applicationDeadline: "2024-11-18",
  },
];

const getMatchScoreColor = (score: number) => {
  if (score >= 90) return "bg-green-500";
  if (score >= 80) return "bg-blue-500";
  if (score >= 70) return "bg-yellow-500";
  return "bg-gray-500";
};

const isDeadlineSoon = (deadline: string) => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  return daysUntilDeadline <= 7;
};

export function FavouriteJobsList({ searchQuery, filters, sortBy }: FavouriteJobsListProps) {
  const [savedJobs, setSavedJobs] = useState(favouriteJobs.map(job => ({ ...job, isSaved: true })));

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
    ));
  };

  // Filter jobs based on search and filters
  const filteredJobs = savedJobs
    .filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Basic filtering - you can expand this based on your needs
      const matchesJobType = filters.jobType === "all" || job.jobType.toLowerCase().includes(filters.jobType);
      const matchesLocation = filters.location === "all" || job.location.toLowerCase().includes(filters.location);
      
      return matchesSearch && job.isSaved && matchesJobType && matchesLocation;
    })
    .sort((a, b) => {
      // Basic sorting implementation
      switch (sortBy) {
        case "dateAdded":
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case "jobTitle":
          return a.title.localeCompare(b.title);
        case "company":
          return a.company.localeCompare(b.company);
        case "salary":
          return b.matchScore - a.matchScore; // Sort by match score as proxy for salary
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {filteredJobs.length} Saved Jobs
        </h3>
        <div className="text-sm text-muted-foreground">
          Showing all saved positions
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={job.companyLogo} alt={job.company} />
                    <AvatarFallback>
                      <IconBuilding className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{job.title}</h4>
                        <p className="text-muted-foreground">{job.company}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {job.isUrgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getMatchScoreColor(job.matchScore)}`} />
                          <span className="text-xs text-muted-foreground">{job.matchScore}% match</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <IconMapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                        {job.isRemote && (
                          <Badge variant="secondary" className="ml-1 text-xs">Remote</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <IconCurrencyDollar className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconBriefcase className="w-4 h-4" />
                        <span>{job.jobType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconClock className="w-4 h-4" />
                        <span>Saved {new Date(job.dateAdded).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {job.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {isDeadlineSoon(job.applicationDeadline) && (
                    <Badge variant="destructive" className="text-xs">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <IconEye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm">
                    <IconExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSaveJob(job.id)}
                    className={job.isSaved ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}
                  >
                    {job.isSaved ? (
                      <IconBookmarkFilled className="w-4 h-4" />
                    ) : (
                      <IconBookmark className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconBookmark className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved jobs found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery ? "No jobs match your search criteria." : "You haven't saved any jobs yet."}
            </p>
            <Button>
              <IconExternalLink className="w-4 h-4 mr-2" />
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}