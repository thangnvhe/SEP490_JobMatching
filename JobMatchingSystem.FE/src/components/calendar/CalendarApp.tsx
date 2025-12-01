import { useState, useRef, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import type { EventClickArg, DateSelectArg, EventDropArg } from "@fullcalendar/core"
import type { EventResizeDoneArg } from "@fullcalendar/interaction"
import { CalendarHeader, type CalendarView } from "./CalendarHeader"
import { EventDialog } from "./EventDialog"
import  { CalendarEvent, CalendarEventInput } from "./calendar-types"

interface CalendarAppProps {
  events?: CalendarEvent[]
  onEventCreate?: (event: CalendarEventInput) => void
  onEventUpdate?: (id: string, event: CalendarEventInput) => void
  onEventDelete?: (id: string) => void
  onEventClick?: (event: CalendarEvent) => void
  className?: string
  /** Chế độ chỉ xem - không thể kéo thả, không thể tạo mới event */
  readonly?: boolean
}

// Initial sample events for demo
const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Họp nhóm buổi sáng",
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(9, 45, 0, 0)),
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Gặp khách hàng",
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    allDay: true,
    color: "#22c55e",
  },
  {
    id: "3",
    title: "Review dự án",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 30, 0, 0)),
    color: "#f59e0b",
  },
]

export function CalendarApp({ 
  events: externalEvents, 
  onEventCreate, 
  onEventUpdate, 
  onEventDelete,
  onEventClick,
  className,
  readonly = false
}: CalendarAppProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const [events, setEvents] = useState<CalendarEvent[]>(externalEvents || initialEvents)
  const [currentView, setCurrentView] = useState<CalendarView>("timeGridWeek")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date; end: Date } | null>(null)

  // Sync external events
  useEffect(() => {
    if (externalEvents) {
      setEvents(externalEvents)
    }
  }, [externalEvents])

  // Change view when currentView changes
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      calendarApi.changeView(currentView)
    }
  }, [currentView])

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDateRange({ start: selectInfo.start, end: selectInfo.end })
    setSelectedEvent(null)
    setDialogOpen(true)
    selectInfo.view.calendar.unselect()
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find((e) => e.id === clickInfo.event.id)
    if (event) {
      // If custom onEventClick is provided, use it instead of default dialog
      if (onEventClick) {
        onEventClick(event)
        return
      }
      setSelectedEvent(event)
      setSelectedDateRange(null)
      setDialogOpen(true)
    }
  }

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const updatedEvent = {
      start: dropInfo.event.start!,
      end: dropInfo.event.end || dropInfo.event.start!,
    }
    
    setEvents((prev) =>
      prev.map((event) =>
        event.id === dropInfo.event.id
          ? { ...event, ...updatedEvent }
          : event
      )
    )
    
    if (onEventUpdate) {
      const event = events.find(e => e.id === dropInfo.event.id)
      if (event) {
        onEventUpdate(dropInfo.event.id, { ...event, ...updatedEvent })
      }
    }
  }

  const handleEventResize = (resizeInfo: EventResizeDoneArg) => {
    const updatedEvent = {
      start: resizeInfo.event.start!,
      end: resizeInfo.event.end!,
    }
    
    setEvents((prev) =>
      prev.map((event) =>
        event.id === resizeInfo.event.id
          ? { ...event, ...updatedEvent }
          : event
      )
    )
    
    if (onEventUpdate) {
      const event = events.find(e => e.id === resizeInfo.event.id)
      if (event) {
        onEventUpdate(resizeInfo.event.id, { ...event, ...updatedEvent })
      }
    }
  }

  const handleSaveEvent = (eventData: CalendarEventInput) => {
    if (selectedEvent) {
      // Update existing event
      setEvents((prev) => 
        prev.map((event) => 
          event.id === selectedEvent.id ? { ...event, ...eventData } : event
        )
      )
      if (onEventUpdate) {
        onEventUpdate(selectedEvent.id, eventData)
      }
    } else {
      // Create new event
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Date.now().toString(),
      }
      setEvents((prev) => [...prev, newEvent])
      if (onEventCreate) {
        onEventCreate(eventData)
      }
    }
    setDialogOpen(false)
    setSelectedEvent(null)
    setSelectedDateRange(null)
  }

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents((prev) => prev.filter((event) => event.id !== selectedEvent.id))
      if (onEventDelete) {
        onEventDelete(selectedEvent.id)
      }
      setDialogOpen(false)
      setSelectedEvent(null)
    }
  }

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      if (direction === "prev") calendarApi.prev()
      else if (direction === "next") calendarApi.next()
      else calendarApi.today()
      setCurrentDate(calendarApi.getDate())
    }
  }

  const handleMonthChange = (month: number) => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      const newDate = new Date(currentDate)
      newDate.setMonth(month)
      calendarApi.gotoDate(newDate)
      setCurrentDate(newDate)
    }
  }

  const handleYearChange = (year: number) => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      const newDate = new Date(currentDate)
      newDate.setFullYear(year)
      calendarApi.gotoDate(newDate)
      setCurrentDate(newDate)
    }
  }

  const handleDatesSet = (arg: { start: Date; end: Date; view: { type: string } }) => {
    const viewStart = arg.start
    const viewEnd = arg.end
    const midDate = new Date((viewStart.getTime() + viewEnd.getTime()) / 2)
    setCurrentDate(midDate)
  }

  return (
    <div className={className}>
      <CalendarHeader
        currentDate={currentDate}
        currentView={currentView}
        onNavigate={handleNavigate}
        onViewChange={setCurrentView}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        onAddEvent={() => {
          setSelectedEvent(null)
          setSelectedDateRange({ start: new Date(), end: new Date() })
          setDialogOpen(true)
        }}
        readonly={readonly}
      />

      <div className="calendar-container bg-card">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          headerToolbar={false}
          events={events.map((e) => ({
            ...e,
            backgroundColor: e.color,
            borderColor: e.color,
          }))}
          editable={!readonly}
          selectable={!readonly}
          selectMirror={!readonly}
          dayMaxEvents={true}
          weekends={true}
          firstDay={1}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={true}
          nowIndicator={true}
          select={readonly ? undefined : handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={readonly ? undefined : handleEventDrop}
          eventResize={readonly ? undefined : handleEventResize}
          datesSet={handleDatesSet}
          height="auto"
          contentHeight={1000}
          locale="vi"
          buttonText={{
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
          }}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
        />
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        dateRange={selectedDateRange}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}

