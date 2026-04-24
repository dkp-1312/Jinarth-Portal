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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2 } from "lucide-react"

export default function HolidaysPage() {
  const router = useRouter()
  const [holidays, setHolidays] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    country: "India",
    type: "National",
    description: "",
  })

  useEffect(() => {
    fetchHolidays()
  }, [])

  const fetchHolidays = async () => {
    try {
      const response = await fetch("/api/calendar/holidays")
      if (!response.ok) {
        throw new Error("Failed to fetch holidays")
      }
      const data = await response.json()
      setHolidays(data.data || [])
      setError("")
    } catch (err) {
      console.error("Error fetching holidays:", err)
      setError("Failed to load holidays")
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

  const handleAddHoliday = async (e: any) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/calendar/holidays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to add holiday")
      }

      setFormData({
        date: "",
        name: "",
        country: "India",
        type: "National",
        description: "",
      })
      setShowForm(false)
      fetchHolidays()
    } catch (err: any) {
      console.error("Error adding holiday:", err)
      setError(err.message || "Failed to add holiday")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this holiday?")) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/calendar/holidays/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to delete holiday")
      }

      fetchHolidays()
    } catch (err) {
      console.error("Error deleting holiday:", err)
      setError("Failed to delete holiday")
    }
  }

  const upcomingHolidays = holidays
    .filter((h) => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const pastHolidays = holidays
    .filter((h) => new Date(h.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
                <BreadcrumbPage>Holidays</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

        <div className="flex flex-1 flex-col gap-4 p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Holidays</h1>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Holiday
            </Button>
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
                <CardTitle>Add Holiday</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddHoliday} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Holiday Name *</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Independence Day"
                        required
                      />
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
                      <label className="text-sm font-medium">Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Holiday Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="National">National</option>
                        <option value="Regional">Regional</option>
                        <option value="Religious">Religious</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter holiday description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Adding..." : "Add Holiday"}
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

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Holidays ({upcomingHolidays.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading holidays...</p>
                  </div>
                ) : upcomingHolidays.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No upcoming holidays</div>
                ) : (
                  <div className="space-y-2">
                    {upcomingHolidays.map((holiday) => (
                      <div
                        key={holiday._id}
                        className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-green-900">{holiday.name}</p>
                          <p className="text-sm text-green-700">
                            {new Date(holiday.date).toLocaleDateString("en-IN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {holiday.description && (
                            <p className="text-xs text-green-600 mt-1">{holiday.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-100">
                            {holiday.type}
                          </Badge>
                          <Badge>{holiday.country}</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleDelete(holiday._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {pastHolidays.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-500">Past Holidays ({pastHolidays.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pastHolidays.map((holiday) => (
                      <div
                        key={holiday._id}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg opacity-60"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-600">{holiday.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(holiday.date).toLocaleDateString("en-IN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{holiday.type}</Badge>
                          <Badge>{holiday.country}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </>
  )
}
