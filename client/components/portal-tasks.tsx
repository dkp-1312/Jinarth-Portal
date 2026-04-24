"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/app/providers/auth-provider"
import { useRouter } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
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
import { Send, CheckCircle2, RefreshCw } from "lucide-react"

export function PortalTasks() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)

  useEffect(() => {
    if (user && token) {
      fetchAssignedTasks()
    }
  }, [user, token])

  const fetchAssignedTasks = async () => {
    try {
      if (!user || (!['Student', 'Intern', 'Employee'].includes(user.role))) return;
      
      const response = await fetch(`/api/tasks/assignee`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      let allTasks = data.data || []
      
      // Filter by status if provided in URL
      const urlParams = new URLSearchParams(window.location.search);
      const statusFilter = urlParams.get('status');
      if (statusFilter) {
        allTasks = allTasks.filter((t: any) => t.status === statusFilter);
      }
      
      setTasks(allTasks)

      // Check for taskId in URL to automatically open modal
      const taskId = urlParams.get('taskId');
      if (taskId) {
        const taskToShow = allTasks.find((t: any) => t._id === taskId);
        if (taskToShow) {
          setSelectedTask(taskToShow);
          setShowTaskModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching assigned tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPortalBase = () => {
    if (user?.role === 'Student') return 'student-portal'
    if (user?.role === 'Intern') return 'intern-portal'
    return 'employee-portal'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800"
      case "Submitted": return "bg-blue-100 text-blue-800"
      case "Pending": return "bg-yellow-100 text-yellow-800"
      case "In Progress": return "bg-purple-100 text-purple-800"
      case "On Hold": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
      case "High": return "bg-red-100 text-red-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "Low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const portalBase = getPortalBase()

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-white">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${portalBase}`}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>My Tasks</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Assigned Tasks</h1>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={fetchAssignedTasks} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button
                className="gap-2"
                onClick={() => router.push(`/${portalBase}/tasks/submit`)}
              >
                <Send className="h-4 w-4" /> Submit Solution
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {tasks.filter((t) => t.status === "Submitted").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {tasks.filter((t) => t.status === "Completed").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {tasks.filter((t) => t.status === "Pending").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Tasks List</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                  <p className="text-gray-500">Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No tasks assigned yet</p>
                  <p className="text-gray-400 text-sm mt-1">New tasks will appear here once assigned to you.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Assigned By</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow 
                          key={task._id} 
                          className="cursor-pointer hover:bg-gray-50/50"
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTaskModal(true);
                          }}
                        >
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell className="max-w-xs truncate text-sm">
                            {task.description}
                          </TableCell>
                          <TableCell className="text-sm">
                            {task.assignedBy?.name || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(task.priority || "Medium")}>
                              {task.priority || "Medium"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {!["Submitted", "Completed", "Cancelled"].includes(task.status) ? (
                              <Button
                                size="sm"
                                className="gap-2"
                                onClick={() => router.push(`/${portalBase}/tasks/submit`)}
                              >
                                <Send className="h-3 w-3" />
                                Submit
                              </Button>
                            ) : task.status === "Submitted" ? (
                              <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Awaiting Review
                              </span>
                            ) : task.status === "Completed" ? (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Completed
                              </span>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          <TaskDetailDialog 
            task={selectedTask} 
            open={showTaskModal} 
            onOpenChange={setShowTaskModal} 
          />
        </div>
      </main>
    </>
  )
}

function TaskDetailDialog({ task, open, onOpenChange }: { task: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            Assigned by {task.assignedBy?.name || "Admin"} on {new Date(task.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <h4 className="text-sm font-semibold mb-1 uppercase tracking-wider text-muted-foreground">Description</h4>
            <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap">{task.description}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">Priority</h4>
              <Badge className={task.priority === 'High' || task.priority === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                {task.priority || 'Medium'}
              </Badge>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">Status</h4>
              <Badge className="bg-yellow-100 text-yellow-800">
                {task.status}
              </Badge>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">Due Date</h4>
              <p className="text-sm font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            {task.estimatedHours && (
              <div>
                <h4 className="text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">Estimated Hours</h4>
                <p className="text-sm font-medium">{task.estimatedHours}h</p>
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">Tags</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {task.tags.map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

