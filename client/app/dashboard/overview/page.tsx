"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Users, BookOpen, CheckSquare, AlertCircle } from "lucide-react"

export default function OverviewPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/dashboard/stats", {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      setStats(data.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all active:scale-95"
                  onClick={() => router.push("/intern/list")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalInterns || 0}</div>
                    <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-all active:scale-95"
                  onClick={() => router.push("/student/list")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                    <p className="text-xs text-muted-foreground">+5.1% from last month</p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-all active:scale-95"
                  onClick={() => router.push("/task-management/all")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.activeTasks || 0}</div>
                    <p className="text-xs text-muted-foreground">+12.3% from last month</p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-all active:scale-95"
                  onClick={() => router.push("/leave/approve")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
                    <p className="text-xs text-muted-foreground">Need immediate attention</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.recentActivity?.map((activity: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 border-b pb-4 last:border-0">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div 
                        className="flex items-center justify-between cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => router.push("/task-management/all?status=Completed")}
                      >
                        <span className="text-sm">Completed Tasks</span>
                        <span className="font-bold">{stats?.completedTasks || 0}</span>
                      </div>
                      <Separator />
                      <div 
                        className="flex items-center justify-between cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => router.push("/leave/approve")}
                      >
                        <span className="text-sm">Leave Requests (Pending)</span>
                        <span className="font-bold">{stats?.pendingLeaves || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg Task Completion</span>
                        <span className="font-bold">{stats?.avgCompletion || 0}%</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Team Members</span>
                        <span className="font-bold">{stats?.teamMembers || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
    
  )
}
