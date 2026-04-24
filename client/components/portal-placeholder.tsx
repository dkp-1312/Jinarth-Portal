"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function PortalPlaceholder({ title, role }: { title: string; role: string }) {
  const isStudent = role === 'Student';
  const rolePrefix = isStudent ? 'student' : 'intern';

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-white">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${rolePrefix}-portal`}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-8">
        <Card className="max-w-3xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>{title} ({role} Portal)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">This page is under development. Functionality for this section will be available soon.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
