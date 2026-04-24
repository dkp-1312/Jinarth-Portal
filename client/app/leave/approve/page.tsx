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
import { CheckCircle2, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function ApproveLeavePage() {
  const router = useRouter()
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = useState<{ id: string; open: boolean }>({ id: "", open: false })
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchPendingLeaves()
  }, [])

  const fetchPendingLeaves = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/leaves/pending", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch pending leaves")
      }

      const data = await response.json()
      setLeaves(data.data || [])
      setError("")
    } catch (err) {
      console.error("Error fetching leaves:", err)
      setError("Failed to load pending leave requests")
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this leave request?")) return

    setActionLoading(id)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/leaves/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to approve leave")
      }

      setLeaves(leaves.filter((leave) => leave._id !== id))
      setError("")
    } catch (err) {
      console.error("Error approving leave:", err)
      setError("Failed to approve leave request")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectClick = (id: string) => {
    setRejectDialog({ id, open: true })
    setRejectionReason("")
  }

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required")
      return
    }

    setActionLoading(rejectDialog.id)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/leaves/${rejectDialog.id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject leave")
      }

      setLeaves(leaves.filter((leave) => leave._id !== rejectDialog.id))
      setRejectDialog({ id: "", open: false })
      setRejectionReason("")
      setError("")
    } catch (err) {
      console.error("Error rejecting leave:", err)
      setError("Failed to reject leave request")
    } finally {
      setActionLoading(null)
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
                <BreadcrumbPage>Approve Leave</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Approve Leave Requests</h1>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Requests ({leaves.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading requests...</p>
                </div>
              ) : leaves.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending leave requests</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaves.map((leave) => {
                        const urlParams = new URLSearchParams(window.location.search);
                        const highlightedId = urlParams.get('leaveId');
                        const isHighlighted = leave._id === highlightedId;
                        
                        return (
                          <TableRow 
                            key={leave._id}
                            className={isHighlighted ? "bg-blue-50 border-blue-300 animate-pulse" : ""}
                            id={`leave-${leave._id}`}
                          >
                            <TableCell className="font-medium">
                              {leave.fullName}
                            </TableCell>
                            <TableCell>{leave.email}</TableCell>
                            <TableCell>{leave.leaveType}</TableCell>
                            <TableCell>
                              {new Date(leave.startDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(leave.endDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{leave.numberOfDays}</TableCell>
                            <TableCell className="max-w-xs truncate text-sm">
                              {leave.reason}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(leave.status)}>
                                {leave.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2 text-green-600"
                                  onClick={() => handleApprove(leave._id)}
                                  disabled={actionLoading === leave._id}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2 text-red-600"
                                  onClick={() => handleRejectClick(leave._id)}
                                  disabled={actionLoading === leave._id}
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Leave Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this leave request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
              />
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setRejectDialog({ id: "", open: false })}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectConfirm}
                  disabled={actionLoading !== null}
                >
                  {actionLoading ? "Processing..." : "Reject"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </> 
   )
}
    
    
