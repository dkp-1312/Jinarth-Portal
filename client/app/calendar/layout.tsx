"use client"

import { useAuth } from "@/app/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AppHeader } from "@/components/app-header"

export default function AdminCalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user?.role !== "Admin") {
        // Redirect non-admins to their respective portals or dashboard
        if (user?.role === "Student") router.push("/student-portal")
        else if (user?.role === "Intern") router.push("/intern-portal")
        else if (user?.role === "Employee") router.push("/employee-portal")
        else router.push("/login")
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== "Admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
    </>
  )
}
