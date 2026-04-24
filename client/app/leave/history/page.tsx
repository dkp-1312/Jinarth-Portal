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
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react"

export default function LeaveHistoryPage() {
  const router = useRouter()
  const [leaves, setLeaves] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("All")

  useEffect(() => {
    fetchLeaveHistory()
    fetchStats()
  }, [])

  const fetchLeaveHistory = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/leaves", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch leave history")
      }

      const data = await response.json()
      setLeaves(data.data || [])
      setError("")
    } catch (err) {
      console.error("Error fetching leaves:", err)
      setError("Failed to load leave history")
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/leaves/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data || data)
      }
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredLeaves = leaves.filter((leave) => {
    if (filterStatus === "All") return true
    return leave.status === filterStatus
  })

  const leaveStats = {
    total: leaves.length,
    approved: leaves.filter((l) => l.status === "Approved").length,
    pending: leaves.filter((l) => l.status === "Pending").length,
    rejected: leaves.filter((l) => l.status === "Rejected").length,
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
                <BreadcrumbPage>Leave History</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Leave History</h1>
            <Link href="/leave/request">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Request Leave
              </Button>
            </Link>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {leaveStats.total}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All leave requests
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {leaveStats.approved}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {leaveStats.total > 0
                    ? ((leaveStats.approved / leaveStats.total) * 100).toFixed(0)
                    : 0}
                  % approval rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {leaveStats.pending}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {leaveStats.rejected}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Not approved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Leave History Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Leave Request History</CardTitle>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 border border-input rounded-md text-sm"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading history...</p>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    {filterStatus === "All"
                      ? "No leave requests yet"
                      : `No ${filterStatus.toLowerCase()} leave requests`}
                  </p>
                  <Link href="/leave/request">
                    <Button>Request Leave</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Approval Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaves.map((leave) => (
                        <TableRow key={leave._id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {leave.leaveType}
                          </TableCell>
                          <TableCell>
                            {new Date(leave.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(leave.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{leave.numberOfDays}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm">
                            {leave.reason}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(leave.status)}>
                              {leave.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(leave.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {leave.approvalDate
                              ? new Date(leave.approvalDate).toLocaleDateString()
                              : "-"}
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
      </main>
    </>
  )
}
