import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconFileText, IconEye, IconBookmark, IconCalendar, IconMessage } from "@tabler/icons-react";

const recentActivities = [
  {
    id: 1,
    type: "application",
    title: "Applied to Senior Frontend Developer",
    company: "Tech Innovate Inc.",
    timestamp: "2 hours ago",
    icon: IconFileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
  {
    id: 2,
    type: "view",
    title: "Profile viewed by HR Manager",
    company: "Design Studio Pro",
    timestamp: "4 hours ago",
    icon: IconEye,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900",
  },
  {
    id: 3,
    type: "save",
    title: "Saved UX Designer position",
    company: "Creative Agency",
    timestamp: "1 day ago",
    icon: IconBookmark,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900",
  },
  {
    id: 4,
    type: "interview",
    title: "Interview scheduled for Product Manager",
    company: "Innovation Labs",
    timestamp: "1 day ago",
    icon: IconCalendar,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900",
  },
  {
    id: 5,
    type: "message",
    title: "Message received from recruiter",
    company: "StartupXYZ",
    timestamp: "2 days ago",
    icon: IconMessage,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900",
  },
  {
    id: 6,
    type: "application",
    title: "Application status updated to 'Under Review'",
    company: "Tech Solutions Inc.",
    timestamp: "3 days ago",
    icon: IconFileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
];

const getActivityDescription = (activity: typeof recentActivities[0]) => {
  switch (activity.type) {
    case "application":
      return activity.title;
    case "view":
      return `${activity.title} at ${activity.company}`;
    case "save":
      return `${activity.title} at ${activity.company}`;
    case "interview":
      return `${activity.title} at ${activity.company}`;
    case "message":
      return `${activity.title} at ${activity.company}`;
    default:
      return activity.title;
  }
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your latest job search activities and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => {
            const IconComponent = activity.icon;
            
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${activity.bgColor}`}>
                  <IconComponent className={`w-4 h-4 ${activity.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Timeline line */}
                {index < recentActivities.length - 1 && (
                  <div 
                    className="absolute left-[22px] mt-8 w-px h-6 bg-border"
                    style={{ 
                      transform: 'translateX(-50%)',
                      position: 'relative',
                      left: '-32px',
                      top: '8px'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-center text-sm text-muted-foreground">
            That's all your recent activity. Keep up the great work! 🚀
          </p>
        </div>
      </CardContent>
    </Card>
  );
}