"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function StudentListPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem('token')
      
      const response = await fetch("http://localhost:5000/api/students", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch students")
      }

      setStudents(data.data || [])
    } catch (err: any) {
      setError(err.message || "Error fetching students")
      console.error("Error fetching students:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:5000/api/students/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setStudents(students.filter(student => student._id !== id))
        } else {
          alert("Failed to delete student")
        }
      } catch (error) {
        console.error("Error deleting student:", error)
        alert("Error deleting student")
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Inactive":
        return "bg-gray-100 text-gray-800"
      case "Graduated":
        return "bg-blue-100 text-blue-800"
      case "Suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students Management</h1>
        <Link href="/student/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No students found</p>
              <Link href="/student/add">
                <Button>Add First Student</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>
                        {new Date(student.enrollmentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{student.gpa || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(student._id, student.name)}
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
  )
}
