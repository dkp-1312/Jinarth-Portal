"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react"

export default function EmployeeAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/dashboard/analytics", {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      setAnalytics(data.data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
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
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Task Success Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.taskSuccessRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">+2.3% this week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Tasks/Day</CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.avgTasksPerDay || 0}</div>
                    <p className="text-xs text-muted-foreground">Per team member</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.activeUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">Last 24 hours</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.avgResponseTime || 0}h</div>
                    <p className="text-xs text-muted-foreground">Per request</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance by Department</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.departmentPerformance?.map((dept: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{dept.name}</span>
                            <span className="text-sm font-bold">{dept.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${dept.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Platform Usage</span>
                        <span className="font-bold">{analytics?.platformUsage || 0}%</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">User Retention</span>
                        <span className="font-bold">{analytics?.userRetention || 0}%</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Module Adoption</span>
                        <span className="font-bold">{analytics?.moduleAdoption || 0}%</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg Session Duration</span>
                        <span className="font-bold">{analytics?.avgSessionDuration || 0}m</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Trends Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-3">User Growth</h4>
                      <div className="space-y-2">
                        {analytics?.userGrowth?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span>{item.month}</span>
                            <span className="font-bold">{item.value} users</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
    
  )
}
