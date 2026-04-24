"use client"

import { useState } from "react"
import { useAuth } from "@/app/providers/auth-provider"
import { useRouter } from "next/navigation"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"

export function PortalLeaveRequest({ portalBase }: { portalBase: string }) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    leaveType: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
    contactNumber: user?.phone || "",
  })

  const handleChange = (e: any) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return Math.max(0, days)
    }
    return 0
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError("")

    const days = calculateDays()
    if (days < 1) {
      setError("End date cannot be before start date.")
      setLoading(false)
      return
    }
    if (formData.reason.trim().length < 10) {
      setError("Reason must be at least 10 characters.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: user.name,
          email: user.email,
          contactNumber: formData.contactNumber,
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          numberOfDays: days,
          reason: formData.reason,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/${portalBase}/leave`)
          router.refresh()
        }, 2000)
      } else {
        setError(data.message || "Failed to submit leave request.")
      }
    } catch {
      setError("A network error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const portalLabel = user?.role === "Student" ? "Student Portal"
    : user?.role === "Intern" ? "Intern Portal"
    : "Employee Portal"

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${portalBase}`}>{portalLabel}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${portalBase}/leave`}>Leave</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Request Leave</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push(`/${portalBase}/leave`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-3xl font-bold">Request Leave</h1>
          </div>

          {success && (
            <Alert className="border-green-300 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Leave request submitted successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Leave Request Form</CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitting as: <strong>{user?.name}</strong> ({user?.email})
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Contact Number</label>
                    <Input
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Leave Type *</label>
                    <select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      required
                    >
                      <option value="Casual">Casual Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Annual">Annual Leave</option>
                      <option value="Maternity">Maternity Leave</option>
                      <option value="Paternity">Paternity Leave</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Start Date *</label>
                    <Input
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">End Date *</label>
                    <Input
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-sm font-medium">Number of Days</label>
                    <div className="px-3 py-2 border rounded-md bg-muted text-sm font-medium">
                      {calculateDays()} {calculateDays() === 1 ? "day" : "days"}
                    </div>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-medium">Reason for Leave * (min 10 characters)</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Describe the reason for your leave..."
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-y"
                      rows={4}
                      required
                      minLength={10}
                    />
                    <p className="text-xs text-muted-foreground">{formData.reason.length}/10 minimum characters</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={loading || success} className="gap-2">
                    {loading ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push(`/${portalBase}/leave`)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
