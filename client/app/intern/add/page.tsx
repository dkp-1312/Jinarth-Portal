"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

const DEPARTMENTS = [
  "Web Development",
  "Mobile Development",
  "Backend Development",
  "Frontend Development",
  "Full Stack Development",
  "UI/UX Design",
  "Graphic Design",
  "QA Testing",
  "DevOps",
  "Data Science",
  "Machine Learning",
  "Cloud Engineering",
  "Cybersecurity",
  "Database Administration",
  "System Administration",
  "Business Analysis",
  "Product Management",
  "Project Management",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Other"
]

export default function AddInternPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [credentials, setCredentials] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    skills: "",
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication token not found. Please login again.')
      }

      const response = await fetch("http://localhost:5000/api/interns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          skills: formData.skills.split(",").map((s) => s.trim()).filter(s => s),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add intern")
      }

      setSuccess(true)
      setCredentials(data.data.credentials)
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        department: "",
        skills: "",
      })

      // Redirect after 5 seconds
      setTimeout(() => {
        router.push("/intern/list")
      }, 5000)
    } catch (err: any) {
      setError(err.message || "Error adding intern")
      console.error("Error adding intern:", err)
    } finally {
      setLoading(false)
    }
  }

  if (success && credentials) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="max-w-2xl">
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Intern Added Successfully!</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <div>
                <p className="text-sm mb-2">Credentials have been sent to the intern&apos;s email. Share these details:</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium">EMAIL</p>
                  <p className="text-lg font-mono">{credentials.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">TEMPORARY PASSWORD</p>
                  <p className="text-lg font-mono">{credentials.tempPassword}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">LOGIN URL</p>
                  <p className="text-sm text-blue-600">{credentials.loginUrl}</p>
                </div>
              </div>

              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  The intern should change their password immediately after the first login.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => router.push("/intern/list")}>
                  Go to Interns List
                </Button>
                <Button variant="outline" onClick={() => {
                  setSuccess(false)
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    department: "",
                    skills: "",
                  })
                }}>
                  Add Another Intern
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center pt-2">
                Redirecting in 5 seconds...
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-3xl font-bold">Add New Intern</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Intern Information</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter intern name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select a department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Skills (comma-separated)</label>
              <Input
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g., React, Node.js, MongoDB"
                disabled={loading}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding Intern..." : "Add Intern"}
              </Button>
              <Link href="/intern/list">
                <Button variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
