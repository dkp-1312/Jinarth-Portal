"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/app/providers/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Camera, User, Mail, Phone, Building, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function ProfilePage() {
  const { user, token, logout } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profileImage: ""
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        profileImage: user.profileImage || ""
      })
    }
  }, [user])

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "U"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB")
      return
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, JPEG, and WEBP formats are supported")
      e.target.value = ""
      return
    }

    try {
      setUploading(true)
      const data = new FormData()
      data.append('file', file)

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      })

      const result = await response.json()
      if (result.success) {
        setFormData(prev => ({ ...prev, profileImage: result.url }))
        alert("Image uploaded successfully. Don't forget to save changes!")
      } else {
        alert(result.message || "Failed to upload image")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("An error occurred during upload")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.success) {
        alert("Profile updated successfully")
        // Update local storage so auth provider picking it up on reload or next mount
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = { ...storedUser, ...formData }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        window.location.reload()
      } else {
        alert(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("An error occurred during update")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
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
                <BreadcrumbPage>Profile Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your personal information and profile picture.</p>
            </div>
            <Badge variant="outline" className="px-4 py-1.5 bg-white shadow-sm border-blue-200 text-blue-700 font-bold uppercase tracking-wider text-xs">
              {user.role} Account
            </Badge>
          </div>

          <div className="grid gap-8 md:grid-cols-12">
            {/* Left Column: Avatar and Quick Stats */}
            <div className="md:col-span-4 space-y-6">
              <Card className="border-none shadow-md overflow-hidden">
                <CardContent className="pt-10 pb-8 text-center bg-gradient-to-b from-blue-50 to-white">
                  <div className="relative inline-block group">
                    <Avatar className="h-32 w-32 rounded-2xl shadow-xl border-4 border-white transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage src={formData.profileImage} />
                      <AvatarFallback className="rounded-2xl bg-blue-600 text-white text-4xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button 
                      onClick={handleImageClick}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-xl shadow-lg border-2 border-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png,image/jpg,image/jpeg,image/webp"
                      onChange={handleFileChange}
                    />
                  </div>
                  <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </CardContent>
                <Separator />
                <CardContent className="py-6 space-y-4">
                   <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Role</span>
                      <span className="font-medium">{user.role}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Status</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0 h-5">
                        {user.status || 'Active'}
                      </Badge>
                   </div>
                   <div className="flex items-center justify-between text-sm pt-4">
                      <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 h-9" onClick={logout}>
                        Log Out
                      </Button>
                   </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">Need Help?</h3>
                  </div>
                  <p className="text-sm opacity-90 leading-relaxed">
                    If you notice any incorrect information that you cannot edit, please contact the HR department or your administrator.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Edit Form */}
            <div className="md:col-span-8">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>Update your personal information to keep your profile current.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                       <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="name" 
                              name="name" 
                              value={formData.name} 
                              onChange={handleInputChange} 
                              className="pl-10 h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-50"
                              placeholder="Your full name"
                            />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground">Email Address (Read-only)</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="email" 
                              value={user.email} 
                              disabled 
                              className="pl-10 h-10 bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed"
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">Email cannot be changed through the portal.</p>
                       </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                       <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="phone" 
                              name="phone" 
                              value={formData.phone} 
                              onChange={handleInputChange} 
                              className="pl-10 h-10 border-gray-200 focus:border-blue-300 focus:ring-blue-50"
                              placeholder="+91 00000 00000"
                            />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="department" className="text-sm font-semibold text-muted-foreground">Department / Role (Read-only)</Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="department" 
                              value={user.department || user.role} 
                              disabled 
                              className="pl-10 h-10 bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed"
                            />
                          </div>
                       </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50/50 border-t px-6 py-4 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[120px]" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              <Card className="mt-8 border-none shadow-sm border-l-4 border-l-blue-600">
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Security Preference</CardTitle>
                </CardHeader>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Update Password</p>
                    <p className="text-xs text-muted-foreground">For better security, we recommend changing your password regularly.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const base = user.role.toLowerCase() === 'admin' ? '' : `/${user.role.toLowerCase()}-portal`
                      router.push(`${base}/settings/password`)
                    }}
                  >
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
