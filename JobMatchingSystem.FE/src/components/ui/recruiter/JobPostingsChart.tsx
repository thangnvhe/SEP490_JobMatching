import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartData = [
  { month: "Jan", applications: 186, jobViews: 420 },
  { month: "Feb", applications: 305, jobViews: 380 },
  { month: "Mar", applications: 237, jobViews: 520 },
  { month: "Apr", applications: 273, jobViews: 490 },
  { month: "May", applications: 209, jobViews: 380 },
  { month: "Jun", applications: 214, jobViews: 440 },
];

const chartConfig = {
  applications: {
    label: "Applications",
    color: "hsl(var(--chart-1))",
  },
  jobViews: {
    label: "Job Views",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function JobPostingsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Performance Analytics</CardTitle>
        <CardDescription>
          Applications and views over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillApplications" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-applications)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-applications)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillJobViews" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-jobViews)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-jobViews)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="jobViews"
              type="natural"
              fill="url(#fillJobViews)"
              fillOpacity={0.4}
              stroke="var(--color-jobViews)"
              stackId="a"
            />
            <Area
              dataKey="applications"
              type="natural"
              fill="url(#fillApplications)"
              fillOpacity={0.4}
              stroke="var(--color-applications)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}