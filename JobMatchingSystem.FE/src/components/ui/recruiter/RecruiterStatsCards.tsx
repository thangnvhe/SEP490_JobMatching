import { IconTrendingDown, IconTrendingUp, IconUsers, IconBriefcase, IconCalendar, IconEye } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RecruiterStatsCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Active Job Postings */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Job Postings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            24
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +8.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconBriefcase className="size-4" />
            3 new jobs this week
          </div>
          <div className="text-muted-foreground">
            Compared to last month
          </div>
        </CardFooter>
      </Card>

      {/* Total Applications */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Applications</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,847
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +15.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconUsers className="size-4" />
            234 new applications
          </div>
          <div className="text-muted-foreground">
            This week vs last week
          </div>
        </CardFooter>
      </Card>

      {/* Scheduled Interviews */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Scheduled Interviews</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            12
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -5.4%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconCalendar className="size-4" />
            Next 7 days
          </div>
          <div className="text-muted-foreground">
            4 interviews today
          </div>
        </CardFooter>
      </Card>

      {/* Profile Views */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Job Views</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            8,642
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +22.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconEye className="size-4" />
            Trending up this month
          </div>
          <div className="text-muted-foreground">
            Average 280 views per job
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}