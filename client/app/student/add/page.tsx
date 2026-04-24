"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

const COURSES = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Data Science",
  "Artificial Intelligence",
  "Cybersecurity",
  "Business Administration",
  "Finance",
  "Marketing",
  "Human Resources",
  "Law",
  "Medicine",
  "Nursing",
  "Architecture",
  "Design",
  "Other"
]

export default function AddStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [credentials, setCredentials] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    enrollmentDate: "",
    expectedGraduationDate: "",
    gpa: "",
    academicAdvisor: "",
    address: "",
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

      const response = await fetch("http://localhost:5000/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          course: formData.course,
          enrollmentDate: formData.enrollmentDate,
          expectedGraduationDate: formData.expectedGraduationDate || null,
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          academicAdvisor: formData.academicAdvisor || null,
          address: formData.address || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add student")
      }

      setSuccess(true)
      setCredentials(data.data.credentials)
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        course: "",
        enrollmentDate: "",
        expectedGraduationDate: "",
        gpa: "",
        academicAdvisor: "",
        address: "",
      })

      // Redirect after 5 seconds
      setTimeout(() => {
        router.push("/student/list")
      }, 5000)
    } catch (err: any) {
      setError(err.message || "Error adding student")
      console.error("Error adding student:", err)
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
            <AlertTitle>Student Added Successfully!</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <div>
                <p className="text-sm mb-2">Credentials have been sent to the student&apos;s email. Share these details:</p>
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
                  The student should change their password immediately after the first login.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => router.push("/student/list")}>
                  Go to Students List
                </Button>
                <Button variant="outline" onClick={() => {
                  setSuccess(false)
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    course: "",
                    enrollmentDate: "",
                    expectedGraduationDate: "",
                    gpa: "",
                    academicAdvisor: "",
                    address: "",
                  })
                }}>
                  Add Another Student
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
      <h1 className="text-3xl font-bold">Add New Student</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
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
                  placeholder="Enter student name"
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
                  placeholder="Enter phone number"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Course *</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select course</option>
                  {COURSES.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Enrollment Date *</label>
                <Input
                  name="enrollmentDate"
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Graduation Date</label>
                <Input
                  name="expectedGraduationDate"
                  type="date"
                  value={formData.expectedGraduationDate}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">GPA</label>
                <Input
                  name="gpa"
                  type="number"
                  step="0.1"
                  min="0"
                  max="4.0"
                  value={formData.gpa}
                  onChange={handleChange}
                  placeholder="e.g., 3.5"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Advisor</label>
                <Input
                  name="academicAdvisor"
                  value={formData.academicAdvisor}
                  onChange={handleChange}
                  placeholder="Advisor name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Student"}
              </Button>
              <Link href="/student/list" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
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
