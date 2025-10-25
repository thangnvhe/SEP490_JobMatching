import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconCheck, IconAlertCircle, IconUser, IconFileText, IconCamera } from "@tabler/icons-react";

const profileTasks = [
  {
    id: 1,
    task: "Complete basic information",
    completed: true,
    icon: IconUser,
  },
  {
    id: 2,
    task: "Upload profile photo",
    completed: true,
    icon: IconCamera,
  },
  {
    id: 3,
    task: "Add work experience",
    completed: true,
    icon: IconFileText,
  },
  {
    id: 4,
    task: "Add education details",
    completed: false,
    icon: IconFileText,
  },
  {
    id: 5,
    task: "Add skills and certifications",
    completed: false,
    icon: IconFileText,
  },
];

export function ProfileCompleteness() {
  const completedTasks = profileTasks.filter(task => task.completed).length;
  const completionPercentage = (completedTasks / profileTasks.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completeness</CardTitle>
        <CardDescription>
          Complete your profile to get better job matches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {completedTasks} of {profileTasks.length} completed
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          <div className="space-y-3">
            {profileTasks.map((task) => {
              const IconComponent = task.icon;
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-2 rounded-lg border ${
                    task.completed
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                      : "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <IconComponent className="w-4 h-4" />
                    <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.task}
                    </span>
                  </div>
                  {task.completed ? (
                    <IconCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <IconAlertCircle className="w-4 h-4 text-orange-600" />
                  )}
                </div>
              );
            })}
          </div>

          <Button className="w-full" size="sm">
            Complete Profile
          </Button>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Complete profiles get 3x more views from recruiters!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}