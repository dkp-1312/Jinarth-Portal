"use client"

import { useEffect, useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
} from "lucide-react"

export default function InternPerformancePage() {
  const [performance, setPerformance] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformance()
  }, [])

  const fetchPerformance = async () => {
    try {
      const response = await fetch("/api/interns/performance")
      const data = await response.json()
      setPerformance(data.data)
    } catch (error) {
      console.error("Error fetching performance:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
   

      <div className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="text-3xl font-bold">Intern Performance</h1>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-4">
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
              {/* KPI Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Interns
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performance?.totalInterns || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active interns
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg Performance
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performance?.avgPerformance || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Team average
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed Tasks
                    </CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performance?.completedTasks || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Top Performer
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performance?.topPerformerScore || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Highest score
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Individual Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Individual Performance Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performance?.internPerformance?.map(
                      (intern: any, idx: number) => (
                        <div key={idx} className="space-y-2 pb-4 border-b last:border-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{intern.name}</span>
                            <Badge
                              className={
                                intern.rating >= 80
                                  ? "bg-green-100 text-green-800"
                                  : intern.rating >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {intern.rating}%
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={
                                intern.rating >= 80
                                  ? "bg-green-600"
                                  : intern.rating >= 60
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                              }
                              style={{ width: `${intern.rating}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Department: {intern.department} | Tasks Completed:{" "}
                            {intern.tasksCompleted}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {performance?.topPerformers?.map(
                        (intern: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="font-medium">{intern.name}</span>
                            <Badge className="bg-green-100 text-green-800">
                              {intern.rating}%
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Excellent (80-100%)</span>
                        <span className="font-bold">
                          {performance?.excellentCount || 0}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Good (60-79%)</span>
                        <span className="font-bold">
                          {performance?.goodCount || 0}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average (40-59%)</span>
                        <span className="font-bold">
                          {performance?.averageCount || 0}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Below Average (&lt;40%)</span>
                        <span className="font-bold">
                          {performance?.belowAverageCount || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    )
}
