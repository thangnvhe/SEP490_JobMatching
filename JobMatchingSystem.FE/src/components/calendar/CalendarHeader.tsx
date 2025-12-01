import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const months = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
]

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)

export type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay"

interface CalendarHeaderProps {
  currentDate: Date
  currentView: CalendarView
  onNavigate: (direction: "prev" | "next" | "today") => void
  onViewChange: (view: CalendarView) => void
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onAddEvent: () => void
  readonly?: boolean
}

export function CalendarHeader({
  currentDate,
  currentView,
  onNavigate,
  onViewChange,
  onMonthChange,
  onYearChange,
  onAddEvent,
  readonly = false,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-card">
      <Button variant="ghost" size="icon" onClick={() => onNavigate("prev")}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Select
        value={currentDate.getMonth().toString()}
        onValueChange={(value) => onMonthChange(Number.parseInt(value))}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map((month, index) => (
            <SelectItem key={month} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentDate.getFullYear().toString()}
        onValueChange={(value) => onYearChange(Number.parseInt(value))}
      >
        <SelectTrigger className="w-[90px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" onClick={() => onNavigate("next")}>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button variant="outline" onClick={() => onNavigate("today")}>
        Hôm nay
      </Button>

      <Tabs value={currentView} onValueChange={(value) => onViewChange(value as CalendarView)} className="w-auto">
        <TabsList className="h-10">
          <TabsTrigger value="timeGridDay" className="px-4">
            Ngày
          </TabsTrigger>
          <TabsTrigger value="timeGridWeek" className="px-4">
            Tuần
          </TabsTrigger>
          <TabsTrigger value="dayGridMonth" className="px-4">
            Tháng
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {!readonly && (
        <Button onClick={onAddEvent}>
          <Plus className="h-4 w-4 mr-1" />
          Thêm sự kiện
        </Button>
      )}
    </div>
  )
}

