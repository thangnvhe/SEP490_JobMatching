import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconMapPin, IconClock, IconCurrencyDollar, IconBookmark, IconExternalLink } from "@tabler/icons-react";

const jobRecommendations = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Tech Innovate Inc.",
    location: "Ho Chi Minh City",
    salary: "$2,000 - $3,500",
    type: "Full-time",
    postedTime: "2 hours ago",
    matchScore: 95,
    isRemote: true,
    skills: ["React", "TypeScript", "Node.js"],
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "Design Studio Pro",
    location: "Hanoi",
    salary: "$1,500 - $2,800",
    type: "Full-time",
    postedTime: "5 hours ago",
    matchScore: 87,
    isRemote: false,
    skills: ["Figma", "Adobe XD", "Sketch"],
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "StartupXYZ",
    location: "Da Nang",
    salary: "$1,800 - $3,200",
    type: "Contract",
    postedTime: "1 day ago",
    matchScore: 82,
    isRemote: true,
    skills: ["Vue.js", "Python", "PostgreSQL"],
  },
];

const getMatchScoreColor = (score: number) => {
  if (score >= 90) return "bg-green-500";
  if (score >= 80) return "bg-blue-500";
  if (score >= 70) return "bg-yellow-500";
  return "bg-gray-500";
};

export function JobRecommendations() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recommended Jobs</CardTitle>
          <CardDescription>
            Jobs that match your skills and preferences
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <IconExternalLink className="w-4 h-4 mr-2" />
          View All Jobs
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobRecommendations.map((job) => (
            <div
              key={job.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{job.title}</h4>
                    <div className={`w-2 h-2 rounded-full ${getMatchScoreColor(job.matchScore)}`} />
                    <span className="text-xs text-muted-foreground">{job.matchScore}% match</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <IconMapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                      {job.isRemote && <Badge variant="secondary" className="ml-1 text-xs">Remote</Badge>}
                    </div>
                    <div className="flex items-center gap-1">
                      <IconCurrencyDollar className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconClock className="w-4 h-4" />
                      <span>{job.postedTime}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <Button size="sm">
                    Apply Now
                  </Button>
                  <Button variant="outline" size="sm">
                    <IconBookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="secondary">{job.type}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}