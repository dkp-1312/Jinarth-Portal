"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TaskManagementPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/task-management/all")
  }, [router])

  return null
}
