'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: {
    _id: string;
    name: string;
  }[];
  assignedToType: 'Student' | 'Intern' | 'Employee';
  assignmentScope?: 'All' | 'Selected';
  roleFilter?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Submitted' | 'Completed' | 'On Hold' | 'Cancelled';
  dueDate: string;
  estimatedHours?: number;
  tags?: string[];
  createdAt: string;
}

interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate?: number | string;
}

const priorityColor: Record<string, string> = {
  Low: 'bg-blue-100 text-blue-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-red-100 text-red-800',
};

const statusColor: Record<string, string> = {
  Pending: 'bg-gray-100 text-gray-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Submitted: 'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function AllTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const json = await response.json();
      const allTasks = Array.isArray(json) ? json : json.data || [];
      setTasks(allTasks);

      // Check fortaskId/status in URL
      const urlParams = new URLSearchParams(window.location.search);
      const taskId = urlParams.get('taskId');
      const statusParam = urlParams.get('status');
      
      if (statusParam) {
        setFilterStatus(statusParam);
      }

      if (taskId) {
        const taskToShow = allTasks.find((t: Task) => t._id === taskId);
        if (taskToShow) {
          setSelectedTask(taskToShow);
          setShowTaskModal(true);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/tasks/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();
      console.log('Stats response:', data);
      
      // Backend returns { success: true, data: { totalTasks, ... } }
      const statsData = data.data || data.stats || data;
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(`Failed to load task statistics: ${err}`);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter((t) => t._id !== taskId));
      setDeleteConfirm(null);
      fetchStats();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const data = await response.json();
      const updatedTask = data.task || data;
      setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));
      fetchStats();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task status');
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filterStatus === 'All' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'All' || task.priority === filterPriority;
    const typeMatch = filterType === 'All' || task.assignedToType === filterType;
    return statusMatch && priorityMatch && typeMatch;
  });

  const isOverdue = (dueDate: string, status: string) => new Date(dueDate) < new Date() && !['Completed', 'Cancelled'].includes(status);

  if (loading) {
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
                  <BreadcrumbPage>Task Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </main>
      </>
    );
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
                <BreadcrumbPage>Task Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Task Management</h1>
            <Button onClick={() => router.push('/task-management/create')}>
              + Create Task
            </Button>
          </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Statistics Cards */}
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100">
                  <div className="text-3xl font-bold text-primary">{stats.totalTasks || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="text-3xl font-bold text-blue-600">{stats.pendingTasks || 0}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <div className="text-3xl font-bold text-yellow-600">{stats.inProgressTasks || 0}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                  <div className="text-3xl font-bold text-green-600">{stats.completedTasks || 0}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100">
                  <div className="text-3xl font-bold text-red-600">{stats.overdueTasks || 0}</div>
                  <div className="text-sm text-muted-foreground">Overdue</div>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-12 mb-2"></div>
                    <div className="h-4 bg-gray-250 rounded w-20"></div>
                  </Card>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
              <div>
                <label className="text-sm font-medium mr-2">Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 border border-input rounded-md text-sm"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mr-2">Priority:</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-1 border border-input rounded-md text-sm"
                >
                  <option value="All">All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mr-2">Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1 border border-input rounded-md text-sm"
                >
                  <option value="All">All</option>
                  <option value="Student">Student</option>
                  <option value="Intern">Intern</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
            </div>

            {/* Tasks Table */}
            {filteredTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted">
                      <th className="text-left p-4 font-medium">Title</th>
                      <th className="text-left p-4 font-medium">Assigned To</th>
                      <th className="text-left p-4 font-medium">Type / Scope</th>
                      <th className="text-left p-4 font-medium">Priority</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Due Date</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.description?.substring(0, 50)}...</div>
                        </td>
                        <td className="p-4">
                          {Array.isArray(task.assignedTo) ? `${task.assignedTo.length} users` : '—'}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{task.assignedToType}</Badge>
                          <Badge variant={task.assignmentScope === 'All' ? 'default' : 'secondary'} className="ml-2">
                            {task.assignmentScope || 'Selected'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${priorityColor[task.priority]}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${statusColor[task.status]}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{new Date(task.dueDate).toLocaleDateString()}</div>
                          {isOverdue(task.dueDate, task.status) && (
                            <div className="text-xs text-red-600 font-medium">Overdue</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTask(task)}
                            >
                              View
                            </Button>
                            {deleteConfirm === task._id ? (
                              <div className="flex gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(task._id)}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteConfirm(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirm(task._id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No tasks found</p>
                <Button onClick={() => router.push('/task-management/create')}>
                  Create First Task
                </Button>
              </div>
            )}
        </div>
      </main>

      {/* View Task Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
              <DialogDescription>
                Complete information about this task
              </DialogDescription>
            </DialogHeader>

            {selectedTask && (
              <div className="space-y-6">
                {/* Task Title */}
                <div>
                  <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
                </div>

                {/* Task Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Assigned To */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                    <p className="mt-1 font-medium">
                      {Array.isArray(selectedTask.assignedTo)
                        ? `${selectedTask.assignedTo.length} users`
                        : '—'}
                    </p>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <div className="mt-1">
                      <Badge variant="outline">{selectedTask.assignedToType}</Badge>
                      <Badge variant={selectedTask.assignmentScope === 'All' ? 'default' : 'secondary'} className="ml-2">
                        {selectedTask.assignmentScope || 'Selected'}
                      </Badge>
                    </div>
                  </div>

                  {selectedTask.roleFilter && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role Filter</label>
                      <p className="mt-1 font-medium">{selectedTask.roleFilter}</p>
                    </div>
                  )}

                  {/* Priority */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${priorityColor[selectedTask.priority]}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${statusColor[selectedTask.status]}`}>
                        {selectedTask.status}
                      </span>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                    <p className="mt-1 font-medium">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                    {isOverdue(selectedTask.dueDate, selectedTask.status) && (
                      <p className="text-xs text-red-600 font-medium mt-1">Overdue</p>
                    )}
                  </div>

                  {/* Estimated Hours */}
                  {selectedTask.estimatedHours && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estimated Hours</label>
                      <p className="mt-1 font-medium">{selectedTask.estimatedHours} hours</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {selectedTask.tags && selectedTask.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedTask.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-muted-foreground">Created On</label>
                  <p className="mt-1 text-sm">{new Date(selectedTask.createdAt).toLocaleString()}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowTaskModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </>
  );
}
       