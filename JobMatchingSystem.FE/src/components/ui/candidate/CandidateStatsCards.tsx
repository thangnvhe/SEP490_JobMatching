import { IconTrendingDown, IconTrendingUp, IconFileText, IconEye, IconCalendar, IconBookmark } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CandidateStatsCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Applications Submitted */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Applications Submitted</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            23
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4 this week
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconFileText className="size-4" />
            5 pending responses
          </div>
          <div className="text-muted-foreground">
            Applications this month
          </div>
        </CardFooter>
      </Card>

      {/* Profile Views */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Profile Views</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            127
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +18.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconEye className="size-4" />
            12 views this week
          </div>
          <div className="text-muted-foreground">
            Compared to last month
          </div>
        </CardFooter>
      </Card>

      {/* Upcoming Interviews */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Upcoming Interviews</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            3
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCalendar />
              Next 7 days
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconCalendar className="size-4" />
            1 interview tomorrow
          </div>
          <div className="text-muted-foreground">
            Schedule managed
          </div>
        </CardFooter>
      </Card>

      {/* Saved Jobs */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Saved Jobs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            47
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -2 this week
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconBookmark className="size-4" />
            8 new matches
          </div>
          <div className="text-muted-foreground">
            Based on your profile
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}