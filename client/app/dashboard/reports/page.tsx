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
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"

export default function ReportsPage() {
  const [reports, setReports] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/dashboard/reports")
      const data = await response.json()
      setReports(data.data)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (reportId: string, reportName: string) => {
    console.log(`Downloading ${reportName}...`)
    // Implement download logic here
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Reports</h1>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{reports?.totalReports || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generated This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{reports?.generatedThisMonth || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Last Generated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">{reports?.lastGenerated || "N/A"}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports?.performanceReports?.map((report: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{report.name}</h4>
                          <p className="text-xs text-muted-foreground">{report.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(report.id, report.name)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reports?.departmentReports?.map((report: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{report.name}</h4>
                          <p className="text-xs text-muted-foreground">{report.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Last updated: {report.lastUpdated}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(report.id, report.name)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Hours Logged</span>
                        <span className="font-bold">{reports?.totalHoursLogged || 0}h</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completed Tasks</span>
                        <span className="font-bold">{reports?.completedTasks || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pending Tasks</span>
                        <span className="font-bold">{reports?.pendingTasks || 0}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Avg Task Duration</span>
                        <span className="font-bold">{reports?.avgTaskDuration || 0}h</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Team Productivity</span>
                        <span className="font-bold">{reports?.teamProductivity || 0}%</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Quality Score</span>
                        <span className="font-bold">{reports?.qualityScore || 0}/100</span>
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
