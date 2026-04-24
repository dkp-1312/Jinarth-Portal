"use client"

import { useEffect, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function CalendarViewPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [holidays, setHolidays] = useState<any[]>([])

  useEffect(() => {
    fetchEventsAndHolidays()
  }, [])

  const fetchEventsAndHolidays = async () => {
    try {
      const [eventsRes, holidaysRes] = await Promise.all([
        fetch("/api/calendar/events"),
        fetch("/api/calendar/holidays"),
      ])
      const eventsData = await eventsRes.json()
      const holidaysData = await holidaysRes.json()
      setEvents(eventsData.data || [])
      setHolidays(holidaysData.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split("T")[0]
    return events.filter((e) => e.date.split("T")[0] === dateStr)
  }

  const getHolidaysForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split("T")[0]
    return holidays.filter((h) => h.date.split("T")[0] === dateStr)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Calendar View</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Calendar</h1>
            <div className="flex gap-2">
              <Link href="/calendar/events">
                <Button variant="outline">Events List</Button>
              </Link>
              <Link href="/calendar/holidays">
                <Button variant="outline">Holidays</Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle>{monthName}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-bold p-2 text-gray-600">
                    {day}
                  </div>
                ))}
                {emptyDays.map((i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day)
                  const dayHolidays = getHolidaysForDay(day)
                  const isToday =
                    new Date().toDateString() ===
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day
                    ).toDateString()

                  return (
                    <div
                      key={day}
                      className={`p-2 border rounded-lg min-h-24 ${
                        isToday ? "bg-blue-100 border-blue-500" : "border-gray-200"
                      }`}
                    >
                      <p className="font-bold">{day}</p>
                      <div className="mt-1 space-y-1">
                        {dayHolidays.map((h) => (
                          <Badge
                            key={h._id}
                            className="text-xs bg-green-600 hover:bg-green-700 cursor-default"
                          >
                            Holiday
                          </Badge>
                        ))}
                        {dayEvents.map((e) => (
                          <Badge
                            key={e._id}
                            className="text-xs bg-blue-600 hover:bg-blue-700 cursor-default block"
                          >
                            {e.title.slice(0, 10)}...
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
    </>
  )
}
