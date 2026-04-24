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
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  BookOpen,
  Award,
  TrendingUp,
} from "lucide-react"

export default function StudentProgressPage() {
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/students/progress")
      const data = await response.json()
      setProgress(data.data)
    } catch (error) {
      console.error("Error fetching progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
      case "A+":
        return "bg-green-100 text-green-800"
      case "B":
      case "B+":
        return "bg-blue-100 text-blue-800"
      case "C":
      case "C+":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-red-100 text-red-800"
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
                <BreadcrumbLink href="/student">Students</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Progress</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <h1 className="text-3xl font-bold">Student Progress</h1>

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
                      Total Students
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {progress?.totalStudents || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active students
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg GPA
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {progress?.avgGPA || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Class average
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Graduation Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {progress?.graduationRate || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      On track
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Honors
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {progress?.honorsCount || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Top performers
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Student Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Individual Student Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progress?.studentProgress?.map(
                      (student: any, idx: number) => (
                        <div key={idx} className="space-y-2 pb-4 border-b last:border-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{student.name}</span>
                              <p className="text-xs text-gray-500">
                                {student.course}
                              </p>
                            </div>
                            <Badge className={getGradeColor(student.currentGrade)}>
                              {student.currentGrade}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>GPA: {student.gpa}</span>
                            <span>{student.completedCredits}/{student.totalCredits} Credits</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(student.completedCredits / student.totalCredits) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Course Performance */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Dean's List</span>
                        <span className="font-bold">
                          {progress?.deansListCount || 0}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Distinction (3.5+)</span>
                        <span className="font-bold">
                          {progress?.distinctionCount || 0}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average (2.5-3.5)</span>
                        <span className="font-bold">
                          {progress?.averageCount || 0}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Below Average (&lt;2.5)</span>
                        <span className="font-bold">
                          {progress?.belowAverageCount || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Completion Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">On Track</span>
                        <span className="font-bold text-green-600">
                          {progress?.onTrackCount || 0}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">At Risk</span>
                        <span className="font-bold text-yellow-600">
                          {progress?.atRiskCount || 0}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Graduated</span>
                        <span className="font-bold text-blue-600">
                          {progress?.graduatedCount || 0}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Inactive</span>
                        <span className="font-bold text-gray-600">
                          {progress?.inactiveCount || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
