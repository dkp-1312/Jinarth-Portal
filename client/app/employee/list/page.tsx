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

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem('token')
      
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch employees")
      }

      setEmployees(data.data || [])
    } catch (err: any) {
      setError(err.message || "Error fetching employees")
      console.error("Error fetching employees:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setEmployees(employees.filter(emp => emp._id !== id))
        } else {
          alert("Failed to delete employee")
        }
      } catch (error) {
        console.error("Error deleting employee:", error)
        alert("Error deleting employee")
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      case "On Leave":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Employees Management</h1>
        <Link href="/employee/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
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
              <p className="text-gray-500">Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No employees found</p>
              <Link href="/employee/add">
                <Button>Add First Employee</Button>
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
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp._id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.phone}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.designation}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(emp.status)}>
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(emp.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(emp._id, emp.name)}
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
