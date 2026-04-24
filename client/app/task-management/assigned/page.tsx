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
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Trash2, AlertCircle, Eye } from "lucide-react"

export default function AssignedTasksPage() {
  const { user, token } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [feedback, setFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null)
  const [viewingSubmission, setViewingSubmission] = useState<any | null>(null)
  const [selectedSolution, setSelectedSolution] = useState<any | null>(null)
  const [reviewFeedback, setReviewFeedback] = useState("")

  useEffect(() => {
    if (user && token) fetchTasks()
  }, [user, token])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError("")

      // Employee sees tasks they assigned; Admin sees all tasks
      const url =
        user?.role === "Admin"
          ? "/api/tasks"
          : "/api/tasks/assigned-by-me"

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to load tasks.")
      } else {
        setTasks(data.data || [])
      }
    } catch (err) {
      setError("An error occurred while fetching tasks.")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkComplete = async (taskId: string, assigneeId?: string) => {
    if (!assigneeId) {
      setFeedback({ id: taskId, msg: "Please select a specific submission to review.", ok: false })
      return
    }
    try {
      const reviewRes = await fetch(`/api/tasks/${taskId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assigneeId, feedback: reviewFeedback }),
      })
      const reviewData = await reviewRes.json()
      if (!reviewRes.ok) {
        setFeedback({ id: taskId, msg: reviewData.message || "Failed to review submission.", ok: false })
        return
      }

      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Completed" }),
      })
      const data = await res.json()
      if (res.ok) {
        setFeedback({ id: taskId, msg: "Submission reviewed and task marked as Completed!", ok: true })
        setReviewFeedback("")
        fetchTasks()
      } else {
        setFeedback({ id: taskId, msg: data.message || "Failed to mark complete.", ok: false })
      }
    } catch {
      setFeedback({ id: taskId, msg: "An error occurred.", ok: false })
    }
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchTasks()
    } catch (err) {
      console.error("Error deleting task:", err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "Submitted": return "bg-blue-100 text-blue-800"
      case "Pending": return "bg-yellow-100 text-yellow-800"
      case "In Progress": return "bg-purple-100 text-purple-800"
      case "On Hold": return "bg-orange-100 text-orange-800"
      case "Cancelled": return "bg-gray-100 text-gray-500"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent": case "High": return "bg-red-100 text-red-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "Low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const pageTitle = user?.role === "Admin" ? "All Assigned Tasks" : "Tasks I Assigned"
  const dashboardHref = user?.role === "Admin" ? "/dashboard" : "/employee-portal"

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={dashboardHref}>Dashboard</BreadcrumbLink>
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
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>

          {feedback && (
            <Alert className={feedback.ok ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}>
              {feedback.ok
                ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                : <AlertCircle className="h-4 w-4 text-red-600" />}
              <AlertDescription className={feedback.ok ? "text-green-800" : "text-red-800"}>
                {feedback.msg}
              </AlertDescription>
            </Alert>
          )}

          {/* Submission Viewer Modal */}
          {viewingSubmission && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
                <CardHeader>
                  <CardTitle>Submitted Solution</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Task: <strong>{viewingSubmission.title}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {selectedSolution?.submittedAt
                      ? new Date(selectedSolution.submittedAt).toLocaleString()
                      : "—"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                    {selectedSolution?.content || "No text content provided."}
                  </div>
                  {selectedSolution?.attachments?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Attachments</p>
                      <div className="space-y-1">
                        {selectedSolution.attachments.map((attachment: any, index: number) => (
                          <a
                            key={`${attachment.fileUrl}-${index}`}
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-sm text-blue-600 underline"
                          >
                            {attachment.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Submissions</p>
                    <div className="space-y-2 max-h-40 overflow-auto">
                      {(viewingSubmission.taskSolutions || [])
                        .filter((solution: any) => solution.status === "Submitted" || solution.status === "Reviewed")
                        .map((solution: any, index: number) => (
                          <button
                            key={`${solution.assigneeId}-${index}`}
                            type="button"
                            className={`w-full text-left px-3 py-2 rounded border text-sm ${selectedSolution?.assigneeId === solution.assigneeId ? "border-primary bg-primary/5" : "border-input"}`}
                            onClick={() => setSelectedSolution(solution)}
                          >
                            <div className="font-medium">{solution.assigneeId}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(solution.submittedAt).toLocaleString()} • {solution.status}
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review Feedback (optional)</label>
                    <textarea
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      className="w-full min-h-[90px] px-3 py-2 border border-input rounded-md text-sm"
                      placeholder="Write feedback for this submission..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleMarkComplete(viewingSubmission._id, selectedSolution?.assigneeId)
                        setViewingSubmission(null)
                        setSelectedSolution(null)
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Verify & Mark Complete
                    </Button>
                    <Button variant="outline" onClick={() => { setViewingSubmission(null); setSelectedSolution(null) }}>
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            {[
              { label: "Total", value: tasks.length, color: "" },
              { label: "Pending", value: tasks.filter(t => t.status === "Pending").length, color: "text-yellow-600" },
              { label: "In Progress", value: tasks.filter(t => t.status === "In Progress").length, color: "text-purple-600" },
              { label: "Submitted", value: tasks.filter(t => t.status === "Submitted").length, color: "text-blue-600" },
              { label: "Completed", value: tasks.filter(t => t.status === "Completed").length, color: "text-green-600" },
            ].map(stat => (
              <Card key={stat.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task List</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                  <p className="text-muted-foreground">Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    {user?.role === "Admin"
                      ? "No tasks have been created yet."
                      : "You haven't assigned any tasks yet. Use Create Task to get started."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Type / Scope</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task._id}>
                          <TableCell className="font-medium max-w-[180px] truncate" title={task.title}>
                            {task.title}
                          </TableCell>
                          <TableCell className="text-sm">
                            {Array.isArray(task.assignedTo) ? `${task.assignedTo.length} users` : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{task.assignedToType}</Badge>
                            <Badge variant={task.assignmentScope === "All" ? "default" : "secondary"} className="ml-2">
                              {task.assignmentScope || "Selected"}
                            </Badge>
                            {task.roleFilter ? (
                              <Badge variant="secondary" className="ml-2">{task.roleFilter}</Badge>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(task.priority || "Medium")}>
                              {task.priority || "Medium"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {task.status === "Submitted" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title="View submission & mark complete"
                                  className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => {
                                    const firstSubmitted = (task.taskSolutions || []).find((s: any) => s.status === "Submitted")
                                    if (!firstSubmitted) {
                                      setFeedback({ id: task._id, msg: "No submitted solution found for review.", ok: false })
                                      setTimeout(() => setFeedback(null), 3000)
                                      return
                                    }
                                    setViewingSubmission(task)
                                    setSelectedSolution(firstSubmitted)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  Review
                                </Button>
                              )}
                              {task.status === "Submitted" && (
                                <Button
                                  size="sm"
                                  className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                                  title="Verify and mark as complete"
                                  onClick={() => {
                                    const firstSubmitted = (task.taskSolutions || []).find((s: any) => s.status === "Submitted")
                                    handleMarkComplete(task._id, firstSubmitted?.assigneeId)
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive hover:bg-red-50"
                                title="Delete task"
                                onClick={() => handleDelete(task._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
