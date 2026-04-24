"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LeavePage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/leave/request")
  }, [router])

  return null
}
