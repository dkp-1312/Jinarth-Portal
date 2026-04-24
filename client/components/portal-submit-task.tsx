"use client"

import { useEffect, useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Send, AlertCircle, Clock, ArrowLeft } from "lucide-react"

interface Task {
  _id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  assignedToType: string
}

const MAX_FILES = 3
const MAX_TOTAL_SIZE_BYTES = 15 * 1024 * 1024

export function PortalSubmitTask({ portalBase }: { portalBase: string }) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [solutionText, setSolutionText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    if (user && token) fetchPendingTasks()
  }, [user, token])

  const fetchPendingTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks/assignee`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      // Show only tasks that are not yet submitted or completed
      const submittable = (data.data || []).filter(
        (t: Task) => !["Submitted", "Completed", "Cancelled"].includes(t.status)
      )
      setTasks(submittable)
    } catch (err) {
      console.error("Error fetching tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedTask) return
    if (!solutionText.trim()) {
      setError("Please write your solution before submitting.")
      return
    }
    setError("")
    if (files.length > MAX_FILES) {
      setError("You can upload a maximum of 3 files.")
      return
    }
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
      setError("Total selected file size must be less than or equal to 15MB.")
      return
    }
    setSubmitting(true)
    try {
      const uploadedAttachments = await uploadFilesToCloudinary()

      // Step 1: Save submission content
      const submitRes = await fetch(`/api/tasks/${selectedTask._id}/submit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: solutionText,
          attachments: uploadedAttachments,
        }),
      })

      if (!submitRes.ok) {
        const errData = await submitRes.json()
        setError(errData.message || "Failed to submit solution.")
        return
      }

      setSuccessMsg(`Solution submitted for "${selectedTask.title}". Status changed to Submitted.`)
      setSolutionText("")
      setFiles([])
      setSelectedTask(null)
      fetchPendingTasks()
      router.refresh()
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const uploadFilesToCloudinary = async (): Promise<{ fileName: string; fileUrl: string }[]> => {
    if (!files.length) return []

    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))

    const response = await fetch("/api/uploads/solution", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || "Failed to upload files")
    }

    return (data.data || []).map((item: any) => ({
      fileName: item.fileName,
      fileUrl: item.fileUrl,
    }))
  }

  const getPortalLabel = () => {
    if (user?.role === "Student") return "Student Portal"
    if (user?.role === "Intern") return "Intern Portal"
    return "Employee Portal"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "Submitted": return "bg-blue-100 text-blue-800"
      case "In Progress": return "bg-purple-100 text-purple-800"
      case "Pending": return "bg-yellow-100 text-yellow-800"
      case "On Hold": return "bg-orange-100 text-orange-800"
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

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${portalBase}`}>{getPortalLabel()}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${portalBase}/tasks`}>My Tasks</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Submit Solution</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push(`/${portalBase}/tasks`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Tasks
            </Button>
            <h1 className="text-3xl font-bold">Submit Task Solution</h1>
          </div>

          {successMsg && (
            <Alert className="border-green-300 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMsg}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Task Selection */}
          {!selectedTask ? (
            <Card>
              <CardHeader>
                <CardTitle>Select a Task to Submit</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-muted-foreground">Loading your tasks...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="text-muted-foreground">No pending tasks to submit a solution for.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {tasks.map((task) => (
                      <button
                        key={task._id}
                        onClick={() => { setSelectedTask(task); setSuccessMsg(""); setError("") }}
                        className="w-full text-left p-4 border rounded-lg hover:bg-accent hover:border-primary transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base group-hover:text-primary">{task.title}</p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 items-end shrink-0">
                            <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                            <Badge className={getPriorityColor(task.priority || "Medium")}>{task.priority || "Medium"}</Badge>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Solution Form */
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedTask.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <Badge className={getStatusColor(selectedTask.status)}>{selectedTask.status}</Badge>
                      <Badge className={getPriorityColor(selectedTask.priority || "Medium")}>
                        {selectedTask.priority || "Medium"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Due: {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "N/A"}
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Solution</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Describe what you did, the approach you used, and key findings. Once submitted, the task status will change to <strong>Submitted</strong> and the assigner can verify and mark it as Completed.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Attach files (optional)</label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || [])
                        const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0)
                        if (selectedFiles.length > MAX_FILES) {
                          setError("You can upload a maximum of 3 files.")
                          return
                        }
                        if (totalSize > MAX_TOTAL_SIZE_BYTES) {
                          setError("Total selected file size must be less than or equal to 15MB.")
                          return
                        }
                        setError("")
                        setFiles(selectedFiles)
                      }}
                      disabled={submitting}
                      className="block w-full text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Max 3 files, total size up to 15MB. All file types are allowed.
                    </p>
                    {!!files.length && (
                      <p className="text-xs text-muted-foreground">{files.length} file(s) selected</p>
                    )}
                  </div>
                  <textarea
                    className="w-full min-h-[200px] px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-y text-sm"
                    placeholder="Describe your solution, approach, and findings here..."
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    disabled={submitting}
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !solutionText.trim()}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {submitting ? "Submitting..." : "Submit Solution"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setSelectedTask(null); setSolutionText(""); setFiles([]); setError("") }}
                      disabled={submitting}
                    >
                      Choose Different Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
