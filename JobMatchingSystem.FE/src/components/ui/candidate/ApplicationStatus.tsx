import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IconExternalLink, IconBuilding, IconCalendar } from "@tabler/icons-react";

const applicationData = [
  {
    id: 1,
    jobTitle: "Senior Frontend Developer",
    company: "Tech Innovate Inc.",
    appliedDate: "2024-10-20",
    status: "interview",
    stage: 3,
    totalStages: 4,
    nextStep: "Final Interview",
    nextStepDate: "2024-10-28",
  },
  {
    id: 2,
    jobTitle: "UX Designer",
    company: "Design Studio Pro",
    appliedDate: "2024-10-18",
    status: "reviewing",
    stage: 2,
    totalStages: 3,
    nextStep: "Technical Review",
    nextStepDate: "2024-10-26",
  },
  {
    id: 3,
    jobTitle: "Full Stack Developer",
    company: "StartupXYZ",
    appliedDate: "2024-10-15",
    status: "pending",
    stage: 1,
    totalStages: 4,
    nextStep: "HR Screening",
    nextStepDate: "2024-10-25",
  },
  {
    id: 4,
    jobTitle: "Product Manager",
    company: "Innovation Labs",
    appliedDate: "2024-10-12",
    status: "rejected",
    stage: 2,
    totalStages: 3,
    nextStep: "Application Closed",
    nextStepDate: null,
  },
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { variant: "secondary" as const, label: "Pending" },
    reviewing: { variant: "default" as const, label: "Under Review" },
    interview: { variant: "outline" as const, label: "Interview Stage" },
    rejected: { variant: "destructive" as const, label: "Not Selected" },
    accepted: { variant: "default" as const, label: "Accepted" },
  };
  
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
};

export function ApplicationStatus() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>
            Track the progress of your job applications
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <IconExternalLink className="w-4 h-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applicationData.map((application) => {
            const statusConfig = getStatusBadge(application.status);
            const progressPercentage = (application.stage / application.totalStages) * 100;
            
            return (
              <div
                key={application.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{application.jobTitle}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <IconBuilding className="w-4 h-4" />
                      <span>{application.company}</span>
                    </div>
                  </div>
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        Stage {application.stage} of {application.totalStages}
                      </span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>Next: {application.nextStep}</span>
                    </div>
                    {application.nextStepDate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <IconCalendar className="w-4 h-4" />
                        <span>
                          {new Date(application.nextStepDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Applied on {new Date(application.appliedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}