"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EmployeePortalPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/employee-portal/overview")
  }, [router])

  return null
}
