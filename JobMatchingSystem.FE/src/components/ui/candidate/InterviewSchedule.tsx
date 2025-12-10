import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconCalendar, IconClock, IconVideo, IconMapPin } from "@tabler/icons-react";

const upcomingInterviews = [
  {
    id: 1,
    jobTitle: "Senior Frontend Developer",
    company: "Tech Innovate Inc.",
    date: "2024-10-26",
    time: "10:00 AM",
    duration: "1 hour",
    type: "video",
    interviewer: "Sarah Johnson - Engineering Manager",
    platform: "Google Meet",
    status: "confirmed",
  },
  {
    id: 2,
    jobTitle: "UX Designer",
    company: "Design Studio Pro",
    date: "2024-10-28",
    time: "2:30 PM",
    duration: "45 minutes",
    type: "onsite",
    interviewer: "Mark Chen - Design Director",
    location: "123 Design Street, District 1, HCMC",
    status: "confirmed",
  },
  {
    id: 3,
    jobTitle: "Product Manager",
    company: "Innovation Labs",
    date: "2024-10-30",
    time: "11:00 AM",
    duration: "1.5 hours",
    type: "video",
    interviewer: "Lisa Wong - VP Product",
    platform: "Zoom",
    status: "pending",
  },
];

const getInterviewTypeIcon = (type: string) => {
  return type === "video" ? IconVideo : IconMapPin;
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    confirmed: { variant: "default" as const, label: "Confirmed" },
    pending: { variant: "secondary" as const, label: "Pending" },
    cancelled: { variant: "destructive" as const, label: "Cancelled" },
  };
  
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
};

const isToday = (dateString: string) => {
  const today = new Date().toDateString();
  const checkDate = new Date(dateString).toDateString();
  return today === checkDate;
};

const isTomorrow = (dateString: string) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkDate = new Date(dateString).toDateString();
  return tomorrow.toDateString() === checkDate;
};

const formatDate = (dateString: string) => {
  if (isToday(dateString)) return "Today";
  if (isTomorrow(dateString)) return "Tomorrow";
  return new Date(dateString).toLocaleDateString();
};

export function InterviewSchedule() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Interviews</CardTitle>
          <CardDescription>
            Your scheduled interviews and meetings
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <IconCalendar className="w-4 h-4 mr-2" />
          View Calendar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingInterviews.map((interview) => {
            const statusConfig = getStatusBadge(interview.status);
            const TypeIcon = getInterviewTypeIcon(interview.type);
            
            return (
              <div
                key={interview.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isToday(interview.date)
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                    : "bg-card hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{interview.jobTitle}</h4>
                      {isToday(interview.date) && (
                        <Badge variant="default" className="bg-blue-600">
                          Today
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {interview.company}
                    </p>
                  </div>
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <IconCalendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(interview.date)}</span>
                    <IconClock className="w-4 h-4 text-muted-foreground ml-2" />
                    <span>{interview.time} ({interview.duration})</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <TypeIcon className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {interview.type === "video" 
                        ? `${interview.platform} Call` 
                        : interview.location
                      }
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <strong>Interviewer:</strong> {interview.interviewer}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    {interview.type === "video" ? "Join Call" : "Get Directions"}
                  </Button>
                  <Button size="sm" variant="ghost">
                    Reschedule
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {upcomingInterviews.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <IconCalendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming interviews scheduled</p>
            <p className="text-sm">Keep applying to jobs to get interview invitations!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}