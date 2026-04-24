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

export default function InternListPage() {
  const [interns, setInterns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchInterns()
  }, [])

  const fetchInterns = async () => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem('token')
      
      const response = await fetch("http://localhost:5000/api/interns", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch interns")
      }

      setInterns(data.data || [])
    } catch (err: any) {
      setError(err.message || "Error fetching interns")
      console.error("Error fetching interns:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:5000/api/interns/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setInterns(interns.filter(intern => intern._id !== id))
        } else {
          alert("Failed to delete intern")
        }
      } catch (error) {
        console.error("Error deleting intern:", error)
        alert("Error deleting intern")
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Completed":
        return "bg-blue-100 text-blue-800"
      case "On Leave":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Interns Management</h1>
        <Link href="/intern/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Intern
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Interns</CardTitle>
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
              <p className="text-gray-500">Loading interns...</p>
            </div>
          ) : interns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No interns found</p>
              <Link href="/intern/add">
                <Button>Add First Intern</Button>
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
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interns.map((intern) => (
                    <TableRow key={intern._id}>
                      <TableCell className="font-medium">{intern.name}</TableCell>
                      <TableCell>{intern.email}</TableCell>
                      <TableCell>{intern.phone}</TableCell>
                      <TableCell>{intern.department}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(intern.status)}>
                          {intern.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(intern.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(intern._id, intern.name)}
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
