import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IconTrendingUp, IconUsers, IconEye, IconExternalLink } from "@tabler/icons-react";

const topJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    department: "Engineering",
    postedDate: "5 days ago",
    applications: 342,
    views: 1250,
    conversionRate: 27.4,
    status: "active",
    urgency: "high",
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    postedDate: "1 week ago",
    applications: 189,
    views: 890,
    conversionRate: 21.2,
    status: "active",
    urgency: "medium",
  },
  {
    id: 3,
    title: "UX Designer",
    department: "Design",
    postedDate: "3 days ago",
    applications: 156,
    views: 720,
    conversionRate: 21.7,
    status: "active",
    urgency: "low",
  },
  {
    id: 4,
    title: "Backend Developer",
    department: "Engineering",
    postedDate: "1 week ago",
    applications: 298,
    views: 1100,
    conversionRate: 27.1,
    status: "active",
    urgency: "high",
  },
];

const getUrgencyBadge = (urgency: string) => {
  const urgencyConfig = {
    high: { variant: "destructive" as const, label: "High Priority" },
    medium: { variant: "secondary" as const, label: "Medium Priority" },
    low: { variant: "outline" as const, label: "Low Priority" },
  };
  
  return urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.medium;
};

export function TopPerformingJobs() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Top Performing Jobs</CardTitle>
          <CardDescription>
            Jobs with the highest engagement and application rates
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <IconExternalLink className="w-4 h-4 mr-2" />
          Manage Jobs
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topJobs.map((job) => {
            const urgencyConfig = getUrgencyBadge(job.urgency);
            return (
              <div key={job.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{job.title}</h4>
                      <Badge variant={urgencyConfig.variant} className="text-xs">
                        {urgencyConfig.label}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {job.department} • Posted {job.postedDate}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <IconUsers className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{job.applications}</div>
                      <div className="text-xs text-muted-foreground">Applications</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconEye className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{job.views}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconTrendingUp className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{job.conversionRate}%</div>
                      <div className="text-xs text-muted-foreground">Conversion</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conversion Rate</span>
                    <span>{job.conversionRate}%</span>
                  </div>
                  <Progress value={job.conversionRate} className="h-1.5" />
                </div>
                
                {job.id !== topJobs[topJobs.length - 1].id && (
                  <hr className="border-border" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}