"use client"

import { useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function RequestLeavePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    leaveType: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
    contactNumber: "",
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
    setLoading(true)
    const days = calculateDays()
    if (days < 1) {
      setError("End date cannot be before start date.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          numberOfDays: calculateDays(),
          status: "Pending",
        }),
      })

      if (response.ok) {
        router.push("/leave/history")
      } else {
        setError("Error submitting leave request. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting leave:", error)
      setError("Error submitting leave request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-white">
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
                <BreadcrumbPage>Leave Request</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Request Leave</h1>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Leave Request Form</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Number</label>
                    <Input
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Leave Type *</label>
                    <select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date *</label>
                    <Input
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date *</label>
                    <Input
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Number of Days</label>
                    <Input
                      value={calculateDays()}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Reason for Leave *</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Enter reason for leave"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Link href="/leave/history">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
