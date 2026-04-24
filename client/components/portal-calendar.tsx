"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/app/providers/auth-provider"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar, Home, Briefcase, Sun } from "lucide-react"

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isSunday: boolean
  isHoliday: boolean
  isWFH: boolean
  isApprovedLeave: boolean
  isPendingLeave: boolean
  holidayName?: string
  wfhTitle?: string
  leaveNames?: string[]
  pendingLeaveNames?: string[]
}

interface Props {
  isAdmin?: boolean
  portalBase?: string
}

export function PortalCalendar({ isAdmin = false, portalBase }: Props) {
  const { user, token } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<any>({ holidays: [], wfhDays: [], approvedLeaves: [] })
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

  // Admin: Add holiday / WFH
  const [showAddHoliday, setShowAddHoliday] = useState(false)
  const [showAddWFH, setShowAddWFH] = useState(false)
  const [holidayForm, setHolidayForm] = useState({ name: "", date: "", type: "National", description: "" })
  const [wfhForm, setWfhForm] = useState({ date: "", title: "Work From Home", description: "", applicableTo: ["Student", "Intern", "Employee"] })
  const [actionMsg, setActionMsg] = useState("")

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const fetchCalendarData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const endpoint = isAdmin ? "/api/calendar-wfh/admin-data" : "/api/calendar-wfh/data"
      const res = await fetch(`${endpoint}?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) setCalendarData(data.data || { holidays: [], wfhDays: [], approvedLeaves: [] })
    } catch (err) {
      console.error("Failed to fetch calendar data:", err)
    } finally {
      setLoading(false)
    }
  }, [token, year, month, isAdmin])

  useEffect(() => { fetchCalendarData() }, [fetchCalendarData])

  const getCalendarDays = (): CalendarDay[] => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const startDayOfWeek = firstDay.getDay()
    const days: CalendarDay[] = []

    const toDateStr = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${day}`
    }

    const holidayDates = new Map<string, string>(
      calendarData.holidays.map((h: any) => [
        toDateStr(new Date(h.date)),
        h.name as string,
      ])
    )

    const wfhDates = new Map<string, string>(
      calendarData.wfhDays.map((w: any) => [
        toDateStr(new Date(w.date)),
        w.title as string,
      ])
    )

    // Approved leaves — expand date ranges into individual days
    const leaveDates = new Map<string, string[]>()
    const pendingLeaveDates = new Map<string, string[]>()
    
    calendarData.approvedLeaves.forEach((leave: any) => {
      const start = new Date(leave.startDate)
      const end = new Date(leave.endDate)
      const name = leave.fullName || "Someone"
      const role = leave.userRole || ""
      const status = leave.status // Approved or Pending
      
      const current = new Date(start)
      while (current <= end) {
        const ds = toDateStr(current)
        const label = role ? `${name} (${role})` : name
        
        if (status === 'Approved') {
          const existing = leaveDates.get(ds) || []
          if (!existing.includes(label)) {
            leaveDates.set(ds, [...existing, label])
          }
        } else {
          const existing = pendingLeaveDates.get(ds) || []
          if (!existing.includes(label)) {
            pendingLeaveDates.set(ds, [...existing, label])
          }
        }
        current.setDate(current.getDate() + 1)
      }
    })

    // Days from prev month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, -i)
      const ds = toDateStr(d)
      days.push({
        date: d,
        isCurrentMonth: false,
        isSunday: d.getDay() === 0,
        isHoliday: holidayDates.has(ds),
        isWFH: wfhDates.has(ds),
        isApprovedLeave: leaveDates.has(ds),
        isPendingLeave: pendingLeaveDates.has(ds),
        holidayName: holidayDates.get(ds),
        wfhTitle: wfhDates.get(ds),
        leaveNames: leaveDates.get(ds),
        pendingLeaveNames: pendingLeaveDates.get(ds),
      })
    }

    // Days of current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month - 1, d)
      const ds = toDateStr(date)
      days.push({
        date,
        isCurrentMonth: true,
        isSunday: date.getDay() === 0,
        isHoliday: holidayDates.has(ds),
        isWFH: wfhDates.has(ds),
        isApprovedLeave: leaveDates.has(ds),
        isPendingLeave: pendingLeaveDates.has(ds),
        holidayName: holidayDates.get(ds),
        wfhTitle: wfhDates.get(ds),
        leaveNames: leaveDates.get(ds),
        pendingLeaveNames: pendingLeaveDates.get(ds),
      })
    }

    // Fill remaining cells
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month, d)
      const ds = toDateStr(date)
      days.push({
        date,
        isCurrentMonth: false,
        isSunday: date.getDay() === 0,
        isHoliday: holidayDates.has(ds),
        isWFH: wfhDates.has(ds),
        isApprovedLeave: leaveDates.has(ds),
        isPendingLeave: pendingLeaveDates.has(ds),
        holidayName: holidayDates.get(ds),
        wfhTitle: wfhDates.get(ds),
        leaveNames: leaveDates.get(ds),
        pendingLeaveNames: pendingLeaveDates.get(ds),
      })
    }

    return days
  }

  const getDayBg = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return "bg-gray-50 text-gray-300"
    if (day.isApprovedLeave) return "bg-yellow-100 border border-yellow-300"
    if (day.isPendingLeave) return "bg-orange-50 border border-orange-200"
    if (day.isHoliday) return "bg-green-100 border border-green-300"
    if (day.isWFH) return "bg-blue-100 border border-blue-300"
    if (day.isSunday) return "bg-red-50 border border-red-200"
    return "bg-white border border-gray-100 hover:bg-gray-50"
  }

  const getDayTextColor = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return "text-gray-300"
    if (day.isApprovedLeave) return "text-yellow-700"
    if (day.isHoliday) return "text-green-700"
    if (day.isWFH) return "text-blue-700"
    if (day.isSunday) return "text-red-500"
    return "text-gray-900"
  }

  const handleAddHoliday = async () => {
    if (!holidayForm.name || !holidayForm.date) {
      setActionMsg("Name and date are required.")
      return
    }
    try {
      const res = await fetch("/api/calendar/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...holidayForm, country: "India" }),
      })
      if (res.ok) {
        setActionMsg("Holiday added!")
        setHolidayForm({ name: "", date: "", type: "National", description: "" })
        setShowAddHoliday(false)
        fetchCalendarData()
      } else {
        const d = await res.json()
        setActionMsg(d.message || "Failed to add holiday.")
      }
    } catch {
      setActionMsg("Network error.")
    }
  }

  const handleAddWFH = async () => {
    if (!wfhForm.date) {
      setActionMsg("Date is required.")
      return
    }
    try {
      const res = await fetch("/api/calendar-wfh/wfh", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(wfhForm),
      })
      if (res.ok) {
        setActionMsg("WFH day added!")
        setWfhForm({ date: "", title: "Work From Home", description: "", applicableTo: ["Student", "Intern", "Employee"] })
        setShowAddWFH(false)
        fetchCalendarData()
      } else {
        const d = await res.json()
        setActionMsg(d.message || "Failed to add WFH.")
      }
    } catch {
      setActionMsg("Network error.")
    }
  }

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm("Delete this holiday?")) return
    await fetch(`/api/calendar/holidays/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchCalendarData()
  }

  const handleDeleteWFH = async (id: string) => {
    if (!confirm("Delete this WFH day?")) return
    await fetch(`/api/calendar-wfh/wfh/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchCalendarData()
  }

  const days = getCalendarDays()
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const pageTitle = isAdmin ? "Calendar Management" : "My Calendar"
  const dashHref = isAdmin ? "/dashboard" : `/${portalBase}`

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={dashHref}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
            {isAdmin && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-2 border-green-400 text-green-700 hover:bg-green-50" onClick={() => { setShowAddHoliday(true); setActionMsg("") }}>
                  <Plus className="h-4 w-4" /> Add Holiday
                </Button>
                <Button size="sm" variant="outline" className="gap-2 border-blue-400 text-blue-700 hover:bg-blue-50" onClick={() => { setShowAddWFH(true); setActionMsg("") }}>
                  <Briefcase className="h-4 w-4" /> Mark WFH Day
                </Button>
              </div>
            )}
          </div>

          {actionMsg && (
            <Alert className="border-green-300 bg-green-50">
              <AlertDescription className="text-green-800">{actionMsg}</AlertDescription>
            </Alert>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <div className="w-3 h-3 rounded bg-red-200 border border-red-300" /> <span className="text-gray-600">Sunday</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <div className="w-3 h-3 rounded bg-green-200 border border-green-300" /> <span className="text-gray-600">Holiday</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <div className="w-3 h-3 rounded bg-blue-200 border border-blue-300" /> <span className="text-gray-600">Work From Home</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300" /> <span className="text-gray-600">Approved Leave</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <div className="w-3 h-3 rounded bg-orange-100 border border-orange-200" /> <span className="text-gray-600">Pending Request</span>
            </div>
          </div>

          {/* Navigation */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(year, month - 2, 1))}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold">{monthName}</h2>
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(year, month, 1))}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading calendar...</p>
                </div>
              ) : (
                <>
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                      <div key={d} className={`text-center text-xs font-semibold py-2 ${d === "Sun" ? "text-red-500" : "text-gray-500"}`}>
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDay(day)}
                        className={`min-h-[72px] p-1.5 rounded-lg text-left transition-all ${getDayBg(day)}`}
                      >
                        <div className={`text-sm font-semibold ${getDayTextColor(day)}`}>
                          {day.date.getDate()}
                        </div>
                        <div className="space-y-0.5 mt-0.5">
                          {day.isHoliday && (
                            <div className="text-[9px] leading-tight text-green-700 font-medium truncate">
                              🎉 {day.holidayName}
                            </div>
                          )}
                          {day.isWFH && (
                            <div className="text-[9px] leading-tight text-blue-700 font-medium truncate">
                              🏠 {day.wfhTitle}
                            </div>
                          )}
                          {day.isApprovedLeave && (
                            <div className="text-[9px] leading-tight text-yellow-700 font-medium overflow-hidden">
                              {isAdmin && day.leaveNames ? (
                                <div className="space-y-0.5">
                                  {day.leaveNames.slice(0, 3).map((n, i) => (
                                    <div key={i} className="truncate">🌴 {n}</div>
                                  ))}
                                  {day.leaveNames.length > 3 && <div className="pl-3">+{day.leaveNames.length - 3} more</div>}
                                </div>
                              ) : (
                                <div className="truncate">🌴 Approved</div>
                              )}
                            </div>
                          )}
                          {day.isPendingLeave && (
                            <div className="text-[9px] leading-tight text-orange-700 font-medium overflow-hidden italic">
                              {isAdmin && day.pendingLeaveNames ? (
                                <div className="space-y-0.5">
                                  {day.pendingLeaveNames.slice(0, 2).map((n, i) => (
                                    <div key={i} className="truncate">⌛ {n}</div>
                                  ))}
                                </div>
                              ) : (
                                <div className="truncate">⌛ Pending</div>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Admin Lists */}
          {isAdmin && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Holidays This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {calendarData.holidays.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No holidays this month.</p>
                  ) : (
                    <div className="space-y-2">
                      {calendarData.holidays.map((h: any) => (
                        <div key={h._id} className="flex items-center justify-between p-2 rounded bg-green-50">
                          <div>
                            <p className="text-sm font-medium text-green-800">{h.name}</p>
                            <p className="text-xs text-green-600">{new Date(h.date).toLocaleDateString()} · {h.type}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteHoliday(h._id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <Home className="h-4 w-4" /> WFH Days This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {calendarData.wfhDays.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No WFH days this month.</p>
                  ) : (
                    <div className="space-y-2">
                      {calendarData.wfhDays.map((w: any) => (
                        <div key={w._id} className="flex items-center justify-between p-2 rounded bg-blue-50">
                          <div>
                            <p className="text-sm font-medium text-blue-800">{w.title}</p>
                            <p className="text-xs text-blue-600">
                              {new Date(w.date).toLocaleDateString()} · For: {(w.applicableTo || []).join(", ")}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteWFH(w._id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {calendarData.approvedLeaves.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Leave Requests This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Approved Section */}
                      {calendarData.approvedLeaves.filter((l: any) => l.status === "Approved").length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-400" /> Approved Leaves
                          </h3>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {calendarData.approvedLeaves
                              .filter((l: any) => l.status === "Approved")
                              .map((l: any) => (
                                <div key={l._id} className="p-3 rounded-lg bg-yellow-50 border border-yellow-100 shadow-sm">
                                  <p className="text-sm font-bold text-yellow-900">{l.fullName}</p>
                                  <p className="text-xs text-yellow-700 font-medium">{l.userRole}</p>
                                  <p className="text-[11px] text-yellow-600 mt-1">
                                    {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Pending Section */}
                      {calendarData.approvedLeaves.filter((l: any) => l.status === "Pending").length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400" /> Pending Requests
                          </h3>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {calendarData.approvedLeaves
                              .filter((l: any) => l.status === "Pending")
                              .map((l: any) => (
                                <div key={l._id} className="p-3 rounded-lg bg-orange-50 border border-orange-100 shadow-sm border-dashed">
                                  <p className="text-sm font-bold text-orange-900">{l.fullName}</p>
                                  <p className="text-xs text-orange-700 font-medium">{l.userRole}</p>
                                  <p className="text-[11px] text-orange-600 mt-1">
                                    {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Day Detail Dialog */}
      {selectedDay && (
        <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedDay.date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              {selectedDay.isSunday && <Badge className="bg-red-100 text-red-700">Sunday — Weekend</Badge>}
              {selectedDay.isHoliday && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-semibold text-green-800">🎉 Holiday</p>
                  <p className="text-sm text-green-700">{selectedDay.holidayName}</p>
                </div>
              )}
              {selectedDay.isWFH && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800">🏠 Work From Home</p>
                  <p className="text-sm text-blue-700">{selectedDay.wfhTitle}</p>
                </div>
              )}
              {selectedDay.isApprovedLeave && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-800">🌴 Approved Leave{selectedDay.leaveNames && selectedDay.leaveNames.length > 1 ? "s" : ""}</p>
                  <div className="mt-1 space-y-1">
                    {selectedDay.leaveNames?.map((name, i) => (
                      <p key={i} className="text-sm text-yellow-700 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-yellow-400" /> {name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {selectedDay.isPendingLeave && (
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 border-dashed">
                  <p className="text-sm font-semibold text-orange-800">⌛ Pending Leave Request{selectedDay.pendingLeaveNames && selectedDay.pendingLeaveNames.length > 1 ? "s" : ""}</p>
                  <div className="mt-1 space-y-1">
                    {selectedDay.pendingLeaveNames?.map((name, i) => (
                      <p key={i} className="text-sm text-orange-700 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-orange-400" /> {name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {!selectedDay.isSunday && !selectedDay.isHoliday && !selectedDay.isWFH && !selectedDay.isApprovedLeave && (
                <p className="text-muted-foreground text-sm">A regular working day.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Holiday Dialog */}
      <Dialog open={showAddHoliday} onOpenChange={setShowAddHoliday}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Holiday</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-sm font-medium">Holiday Name *</label>
              <Input value={holidayForm.name} onChange={e => setHolidayForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Diwali" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input type="date" value={holidayForm.date} onChange={e => setHolidayForm(p => ({ ...p, date: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={holidayForm.type} onChange={e => setHolidayForm(p => ({ ...p, type: e.target.value }))} className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {["National", "Regional", "Religious", "Corporate", "Other"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={holidayForm.description} onChange={e => setHolidayForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" className="mt-1" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAddHoliday} className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" /> Add Holiday
              </Button>
              <Button variant="outline" onClick={() => setShowAddHoliday(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add WFH Dialog */}
      <Dialog open={showAddWFH} onOpenChange={setShowAddWFH}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark Work From Home Day</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input type="date" value={wfhForm.date} onChange={e => setWfhForm(p => ({ ...p, date: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={wfhForm.title} onChange={e => setWfhForm(p => ({ ...p, title: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={wfhForm.description} onChange={e => setWfhForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Applicable To</label>
              <div className="flex gap-3 mt-2">
                {["Student", "Intern", "Employee"].map(role => (
                  <label key={role} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wfhForm.applicableTo.includes(role)}
                      onChange={e => {
                        if (e.target.checked) {
                          setWfhForm(p => ({ ...p, applicableTo: [...p.applicableTo, role] }))
                        } else {
                          setWfhForm(p => ({ ...p, applicableTo: p.applicableTo.filter(r => r !== role) }))
                        }
                      }}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAddWFH} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" /> Mark WFH
              </Button>
              <Button variant="outline" onClick={() => setShowAddWFH(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
