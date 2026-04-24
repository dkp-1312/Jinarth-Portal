"use client"

import { useEffect, useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, CheckCircle2, AlertCircle, Clock, User, RefreshCw } from "lucide-react"
import Link from "next/link"

export function PortalLeave({ portalBase }: { portalBase: string }) {
  const { user, token } = useAuth()
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user && token) fetchMyLeaves()
  }, [user, token])

  const fetchMyLeaves = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/leaves/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setLeaves(data.data || [])
      } else {
        setError(data.message || "Failed to load leaves")
      }
    } catch {
      setError("An error occurred while fetching your leaves.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-200"
      case "Rejected": return "bg-red-100 text-red-800 border-red-200"
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "Sick": return "bg-orange-100 text-orange-700"
      case "Casual": return "bg-blue-100 text-blue-700"
      case "Annual": return "bg-purple-100 text-purple-700"
      default: return "bg-gray-100 text-gray-700"
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
                <BreadcrumbPage>Leave Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Leave Requests</h1>
              <p className="text-muted-foreground mt-1">Track and manage your leave applications</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchMyLeaves} disabled={loading} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Link href={`/${portalBase}/leave/request`}>
                <Button className="gap-2">
                  <Send className="h-4 w-4" /> Request Leave
                </Button>
              </Link>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Requests", value: leaves.length, color: "" },
              { label: "Pending", value: leaves.filter(l => l.status === "Pending").length, color: "text-yellow-600" },
              { label: "Approved", value: leaves.filter(l => l.status === "Approved").length, color: "text-green-600" },
              { label: "Rejected", value: leaves.filter(l => l.status === "Rejected").length, color: "text-red-600" },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Leave List */}
          {loading ? (
            <div className="text-center py-14">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
              <p className="text-muted-foreground">Loading your leave requests...</p>
            </div>
          ) : leaves.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CheckCircle2 className="h-14 w-14 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-600">No leave requests yet</p>
                <p className="text-muted-foreground text-sm mb-4">Submit your first leave request using the button above.</p>
                <Link href={`/${portalBase}/leave/request`}>
                  <Button className="gap-2">
                    <Send className="h-4 w-4" /> Request Leave
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leaves.map((leave) => (
                <Card key={leave._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getLeaveTypeColor(leave.leaveType)}>{leave.leaveType} Leave</Badge>
                          <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {leave.numberOfDays} day{leave.numberOfDays !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mt-2 text-gray-700 line-clamp-2">{leave.reason}</p>
                        {leave.status === "Approved" && leave.approvedBy && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Approved by {leave.approvedBy}
                          </p>
                        )}
                        {leave.status === "Rejected" && leave.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">
                            Reason: {leave.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
