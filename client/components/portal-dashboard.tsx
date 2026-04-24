"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/app/providers/auth-provider"
import { useRouter } from "next/navigation"
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle2, Clock, AlertCircle, Calendar, 
  ArrowRight, FileText, LayoutDashboard, RefreshCw
} from "lucide-react"

interface DashboardData {
  tasks: { total: number; pending: number; completed: number; urgent: number }
  leaves: { total: number; pending: number; approved: number }
  activity: { title: string; status: string; time: string }[]
}

export default function PortalDashboardOverview({ portalBase }: { portalBase: string }) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && token) fetchStats()
  }, [user, token])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/dashboard/portal-stats", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (err) {
      console.error("Error fetching stats:", err)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
           <div className="h-64 bg-gray-100 rounded-xl"></div>
           <div className="h-64 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50/50 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {user?.name}!</h1>
            <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-100 font-semibold h-fit">
              {user?.role}
            </Badge>
          </div>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account today.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchStats} className="rounded-full shadow-sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          onClick={() => router.push(`/${portalBase}/tasks`)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 text-white">Total Assigned Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.tasks.total || 0}</div>
            <p className="text-xs mt-1 opacity-70">Across all categories</p>
          </CardContent>
        </Card>

        <Card 
          className="border-none shadow-sm bg-white cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          onClick={() => router.push(`/${portalBase}/tasks?status=Pending`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.tasks.pending || 0}</div>
            {data?.tasks.urgent ? (
              <Badge variant="destructive" className="mt-2 text-[10px] items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {data.tasks.urgent} Urgent
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">No urgent tasks</p>
            )}
          </CardContent>
        </Card>

        <Card 
          className="border-none shadow-sm bg-white cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          onClick={() => router.push(`/${portalBase}/tasks?status=Completed`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.tasks.completed || 0}</div>
            <p className="text-xs text-green-600 font-medium mt-2">Well done!</p>
          </CardContent>
        </Card>

        <Card 
          className="border-none shadow-sm bg-white cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          onClick={() => router.push(`/${portalBase}/leave`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leave Status</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.leaves.approved || 0} / {data?.leaves.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {data?.leaves.pending ? `${data.leaves.pending} pending approvals` : "All requests processed"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your latest task updates and assignments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.activity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <LayoutDashboard className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No recent activity found.</p>
                </div>
              ) : (
                data?.activity.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${item.status === 'Completed' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {item.status === 'Completed' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium group-hover:text-blue-600 transition-colors">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.time).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'} className="text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => router.push(`/${portalBase}/tasks`)}>
              View All Tasks <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Commonly used portal features.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start gap-3 h-12 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50" onClick={() => router.push(`/${portalBase}/tasks/submit`)}>
              <div className="bg-blue-100 p-1.5 rounded-md"><FileText className="h-4 w-4 text-blue-600" /></div>
              Submit Task Solution
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-12 border-gray-100 hover:border-purple-200 hover:bg-purple-50/50" onClick={() => router.push(`/${portalBase}/leave/request`)}>
              <div className="bg-purple-100 p-1.5 rounded-md"><Calendar className="h-4 w-4 text-purple-600" /></div>
              Request Leave
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-12 border-gray-100 hover:border-orange-200 hover:bg-orange-50/50" onClick={() => router.push(`/${portalBase}/calendar`)}>
               <div className="bg-orange-100 p-1.5 rounded-md"><Calendar className="h-4 w-4 text-orange-600" /></div>
               My Calendar
            </Button>

            <Separator className="my-2" />
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Role</p>
               <p className="text-sm font-medium text-gray-900">{user?.role} Portal</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
