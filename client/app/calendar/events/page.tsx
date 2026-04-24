"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    eventType: "Meeting",
    location: "",
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/calendar/events")
      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }
      const data = await response.json()
      setEvents(data.data || [])
      setError("")
    } catch (err) {
      console.error("Error fetching events:", err)
      setError("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddEvent = async (e: any) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      // Convert time input to HH:MM format
      let formattedTime = formData.time
      if (formData.time && formData.time.length === 5) {
        formattedTime = formData.time // Already in HH:MM format
      }

      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          time: formattedTime,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to add event")
      }

      setFormData({
        title: "",
        date: "",
        time: "",
        description: "",
        eventType: "Meeting",
        location: "",
      })
      setShowForm(false)
      fetchEvents()
    } catch (err: any) {
      console.error("Error adding event:", err)
      setError(err.message || "Failed to add event")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/calendar/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to delete event")
      }

      fetchEvents()
    } catch (err) {
      console.error("Error deleting event:", err)
      setError("Failed to delete event")
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Meeting":
        return "bg-blue-100 text-blue-800"
      case "Conference":
        return "bg-purple-100 text-purple-800"
      case "Training":
        return "bg-cyan-100 text-cyan-800"
      case "Workshop":
        return "bg-indigo-100 text-indigo-800"
      case "Seminar":
        return "bg-violet-100 text-violet-800"
      case "Holiday":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
                <BreadcrumbPage>Events</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

        <div className="flex flex-1 flex-col gap-4 p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Events</h1>
            <div className="flex gap-2">
              <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
              <Link href="/calendar/view">
                <Button variant="outline">Calendar View</Button>
              </Link>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Event</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Event Title *</label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter event title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Event Type *</label>
                      <select
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="Meeting">Meeting</option>
                        <option value="Conference">Conference</option>
                        <option value="Training">Training</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date *</label>
                      <Input
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time (HH:MM) *</label>
                      <Input
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Enter location"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter event description (min 10 characters)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={3}
                        required
                        minLength={10}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Adding..." : "Add Event"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Events ({events.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No events scheduled</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead>Title</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event._id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell>
                            <Badge className={getEventTypeColor(event.eventType)}>
                              {event.eventType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(event.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{event.time || "-"}</TableCell>
                          <TableCell>{event.location || "-"}</TableCell>
                          <TableCell className="max-w-xs truncate text-sm">
                            {event.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleDelete(event._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </>
  )
}

  