"use client"

import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function AppHeader() {
  const pathname = usePathname()

  // Generate breadcrumb items from pathname
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs = [
      {
        label: "Home",
        href: "/",
        icon: Home,
      },
    ]

    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/")
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ")
      breadcrumbs.push({
        label,
        href,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className="border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jinarth Portal</h1>
        </div>
      </div>
      <div className="border-t px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={breadcrumb.href} className="flex items-center gap-2">
                {index > 0 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={breadcrumb.href}>
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  )
}
