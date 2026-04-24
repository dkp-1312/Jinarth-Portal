"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function InternPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/intern/list")
  }, [router])

  return null
}
