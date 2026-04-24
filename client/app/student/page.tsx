"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function StudentPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/student/list")
  }, [router])

  return null
}
