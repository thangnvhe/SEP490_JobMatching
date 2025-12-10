import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconExternalLink } from "@tabler/icons-react";

const recentApplications = [
  {
    id: 1,
    candidateName: "Sarah Johnson",
    jobTitle: "Senior Frontend Developer",
    appliedAt: "2 hours ago",
    status: "new",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    experience: "5+ years",
  },
  {
    id: 2,
    candidateName: "Michael Chen",
    jobTitle: "UX Designer",
    appliedAt: "4 hours ago",
    status: "reviewed",
    avatar: "https://i.pravatar.cc/150?u=michael",
    experience: "3+ years",
  },
  {
    id: 3,
    candidateName: "Emily Rodriguez",
    jobTitle: "Backend Developer",
    appliedAt: "1 day ago",
    status: "shortlisted",
    avatar: "https://i.pravatar.cc/150?u=emily",
    experience: "4+ years",
  },
  {
    id: 4,
    candidateName: "David Kumar",
    jobTitle: "Product Manager",
    appliedAt: "2 days ago",
    status: "interviewed",
    avatar: "https://i.pravatar.cc/150?u=david",
    experience: "6+ years",
  },
  {
    id: 5,
    candidateName: "Lisa Wong",
    jobTitle: "Data Scientist",
    appliedAt: "3 days ago",
    status: "new",
    avatar: "https://i.pravatar.cc/150?u=lisa",
    experience: "2+ years",
  },
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    new: { variant: "default" as const, label: "New" },
    reviewed: { variant: "secondary" as const, label: "Reviewed" },
    shortlisted: { variant: "outline" as const, label: "Shortlisted" },
    interviewed: { variant: "destructive" as const, label: "Interviewed" },
  };
  
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
};

export function RecentApplications() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>
            Latest candidate applications across all job postings
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <IconExternalLink className="w-4 h-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentApplications.map((application) => {
            const statusConfig = getStatusBadge(application.status);
            return (
              <div
                key={application.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={application.avatar} />
                    <AvatarFallback>
                      {application.candidateName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{application.candidateName}</div>
                    <div className="text-sm text-muted-foreground">
                      {application.jobTitle} • {application.experience}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {application.appliedAt}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}