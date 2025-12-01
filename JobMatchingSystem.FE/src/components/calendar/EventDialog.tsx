import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { CalendarEvent, CalendarEventInput } from "./calendar-types"
import { eventColors } from "@/components/calendar/calendar-types"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  dateRange: { start: Date; end: Date } | null
  onSave: (event: CalendarEventInput) => void
  onDelete: () => void
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  dateRange,
  onSave,
  onDelete
}: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [allDay, setAllDay] = useState(false)
  const [color, setColor] = useState("#3b82f6")

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || "")
      setStartDate(new Date(event.start))
      setEndDate(new Date(event.end))
      const eventStartTime = format(new Date(event.start), "HH:mm")
      const eventEndTime = format(new Date(event.end), "HH:mm")
      // Đảm bảo thời gian trong khoảng 7h-19h
      const [startHour] = eventStartTime.split(":").map(Number)
      const [endHour] = eventEndTime.split(":").map(Number)
      setStartTime(startHour < 7 ? "07:00" : startHour >= 19 ? "18:00" : eventStartTime)
      setEndTime(endHour < 7 ? "08:00" : endHour >= 19 ? "19:00" : eventEndTime)
      setAllDay(event.allDay || false)
      setColor(event.color || "#3b82f6")
    } else if (dateRange) {
      setTitle("")
      setDescription("")
      setStartDate(dateRange.start)
      setEndDate(dateRange.end)
      const rangeStartTime = format(dateRange.start, "HH:mm")
      const rangeEndTime = format(dateRange.end, "HH:mm")
      // Đảm bảo thời gian mặc định trong khoảng 7h-19h
      const [startHour] = rangeStartTime.split(":").map(Number)
      const [endHour] = rangeEndTime.split(":").map(Number)
      setStartTime(startHour < 7 ? "09:00" : startHour >= 19 ? "18:00" : rangeStartTime)
      setEndTime(endHour < 7 ? "10:00" : endHour >= 19 ? "19:00" : rangeEndTime)
      setAllDay(false)
      setColor("#3b82f6")
    }
  }, [event, dateRange, open])

  const handleSave = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!allDay) {
      const [startHour, startMin] = startTime.split(":").map(Number)
      const [endHour, endMin] = endTime.split(":").map(Number)
      start.setHours(startHour, startMin, 0, 0)
      end.setHours(endHour, endMin, 0, 0)
    } else {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }

    onSave({
      title: title || "Sự kiện không có tiêu đề",
      description,
      start,
      end,
      allDay,
      color,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}</DialogTitle>
          <DialogDescription>
            {event ? "Thay đổi thông tin sự kiện của bạn." : "Tạo một sự kiện mới trên lịch."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề sự kiện"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả sự kiện (tùy chọn)"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch id="all-day" checked={allDay} onCheckedChange={setAllDay} />
            <Label htmlFor="all-day">Cả ngày</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Ngày bắt đầu</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {!allDay && (
              <div className="grid gap-2">
                <Label>Giờ bắt đầu</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min="07:00"
                  max="19:00"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Ngày kết thúc</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {!allDay && (
              <div className="grid gap-2">
                <Label>Giờ kết thúc</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min="07:00"
                  max="19:00"
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Màu sắc</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                    {eventColors.find((c) => c.value === color)?.label || "Chọn màu"}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {eventColors.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: c.value }}
                      />
                      {c.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {event && (
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Xóa
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {event ? "Lưu thay đổi" : "Tạo sự kiện"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

