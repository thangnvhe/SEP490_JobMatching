// Đặt file này tại: src/pages/Admin-Side/DashboardPage.tsx
import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Briefcase,
  User,
  Flag,
  UserRoundCog, // Icon cho Recruiter
} from "lucide-react";

// Import các components shadcn/ui của bạn
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator"; // <-- Thêm Separator
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"; // Import từ file chart.tsx của bạn

// ------------------------------------------------------------------
// PHẦN 1: DỮ LIỆU GIẢ (Bạn sẽ thay thế bằng API thật)
// ------------------------------------------------------------------

// Dữ liệu giả cho biểu đồ
const chartData = [
  { date: "Tuần 1", jobs: 20, candidates: 15, recruiters: 5, reports: 1 },
  { date: "Tuần 2", jobs: 35, candidates: 30, recruiters: 10, reports: 0 },
  { date: "Tuần 3", jobs: 40, candidates: 50, recruiters: 15, reports: 2 },
  { date: "Tuần 4", jobs: 30, candidates: 45, recruiters: 20, reports: 1 },
  { date: "Tuần 5", jobs: 50, candidates: 60, recruiters: 22, reports: 3 },
];

// Cấu hình màu sắc và tên cho biểu đồ
const chartConfig = {
  jobs: {
    label: "Tin tuyển dụng",
    color: "hsl(var(--chart-1))",
  },
  candidates: {
    label: "Candidates",
    color: "hsl(var(--chart-2))",
  },
  recruiters: {
    label: "Recruiters",
    color: "hsl(var(--chart-3))",
  },
  reports: {
    label: "Reports",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

// Dữ liệu giả cho 4 khối stats (sẽ thay đổi dựa trên combobox)
const mockStatsData = {
  "last-7-days": {
    jobs: 120,
    candidates: 300,
    recruiters: 50,
    reports: 5,
  },
  "last-30-days": {
    jobs: 450,
    candidates: 1200,
    recruiters: 200,
    reports: 20,
  },
  "all-time": {
    jobs: 2150,
    candidates: 5400,
    recruiters: 850,
    reports: 75,
  },
};

// ------------------------------------------------------------------
// PHẦN 2: COMPONENT CHÍNH CỦA TRANG (ĐÃ BỎ TABS)
// ------------------------------------------------------------------

export function DashboardPage() {
  // State cho combobox của 4 khối
  const [statsTimeRange, setStatsTimeRange] = React.useState("last-30-days");
  
  // State cho combobox của biểu đồ
  const [chartTimeRange, setChartTimeRange] = React.useState("last-30-days");

  // TODO: Dựa vào 'statsTimeRange', bạn sẽ gọi API để
  // lấy dữ liệu mới và cập nhật 'currentStats'
  const currentStats =
    mockStatsData[statsTimeRange as keyof typeof mockStatsData] ||
    mockStatsData["last-30-days"];

  // TODO: Dựa vào 'chartTimeRange', bạn sẽ gọi API
  // để lấy dữ liệu biểu đồ mới và cập nhật 'chartData'

  return (
    <div className="flex flex-col gap-8"> {/* Tăng gap một chút */}
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      {/* ------------------------------------------- */}
      {/* PHẦN 1: TỔNG QUAN (4 KHỐI)                 */}
      {/* ------------------------------------------- */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Tổng quan
          </h2>
          {/* Combobox cho 4 khối */}
          <TimeRangeSelect
            value={statsTimeRange}
            onValueChange={setStatsTimeRange}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Khối 1: Tin tuyển dụng */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tin tuyển dụng
              </CardTitle>
              <Briefcase className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats.jobs}</div>
              <p className="text-xs text-muted-foreground">
                Tin đã đăng
              </p>
            </CardContent>
          </Card>

          {/* Khối 2: Candidates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Candidates
              </CardTitle>
              <User className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentStats.candidates}
              </div>
              <p className="text-xs text-muted-foreground">
                Ứng viên đã đăng ký
              </p>
            </CardContent>
          </Card>

          {/* Khối 3: Recruiters */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recruiters
              </CardTitle>
              <UserRoundCog className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentStats.recruiters}
              </div>
              <p className="text-xs text-muted-foreground">
                Nhà tuyển dụng đã đăng ký
              </p>
            </CardContent>
          </Card>

          {/* Khối 4: Job bị report */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jobs bị Report
              </CardTitle>
              <Flag className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats.reports}</div>
              <p className="text-xs text-muted-foreground">
                Báo cáo vi phạm
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Đường kẻ ngang phân tách 2 phần */}
      <Separator />

      {/* ------------------------------------------- */}
      {/* PHẦN 2: BIỂU ĐỒ PHÂN TÍCH                  */}
      {/* ------------------------------------------- */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Phân tích dữ liệu</CardTitle>
            </div>
            {/* Combobox cho biểu đồ */}
            <TimeRangeSelect
              value={chartTimeRange}
              onValueChange={setChartTimeRange}
            />
          </CardHeader>
          <CardContent>
            {/* Chiều cao 400px, bạn có thể thay đổi */}
            <div className="h-[400px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData} // Dữ liệu của bạn ở đây
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <Tooltip
                      cursor={false}
                      content={<ChartTooltipContent hideIndicator />}
                    />
                    {/* Vẽ các đường line */}
                    <Line
                      dataKey="jobs"
                      type="monotone"
                      stroke={`var(--color-jobs)`}
                      strokeWidth={2}
                      dot={true}
                    />
                    <Line
                      dataKey="candidates"
                      type="monotone"
                      stroke={`var(--color-candidates)`}
                      strokeWidth={2}
                      dot={true}
                    />
                      <Line
                      dataKey="recruiters"
                      type="monotone"
                      stroke={`var(--color-recruiters)`}
                      strokeWidth={2}
                      dot={true}
                    />
                    <Line
                      dataKey="reports"
                      type="monotone"
                      stroke={`var(--color-reports)`}
                      strokeWidth={2}
                      dot={true}
                    />
                    <Legend content={<ChartLegendContent />} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

// ------------------------------------------------------------------
// PHẦN 3: COMPONENT CON TÁI SỬ DỤNG
// ------------------------------------------------------------------

/**
 * Component Select (Combobox) để chọn mốc thời gian
 */
function TimeRangeSelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-fit min-w-[180px]">
        <SelectValue placeholder="Chọn mốc thời gian" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="last-7-days">7 ngày qua</SelectItem>
        <SelectItem value="last-30-days">30 ngày qua</SelectItem>
        <SelectItem value="all-time">Tất cả thời gian</SelectItem>
      </SelectContent>
    </Select>
  );
}