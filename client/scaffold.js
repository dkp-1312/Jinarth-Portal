const fs = require('fs');
const path = require('path');

const routes = [
  '/student-portal/tasks/submit',
  '/intern-portal/tasks/submit',
  '/student-portal/leave/request',
  '/intern-portal/leave/request',
  '/student-portal/leave/history',
  '/intern-portal/leave/history',
  '/student-portal/calendar',
  '/intern-portal/calendar',
  '/student-portal/events',
  '/intern-portal/events',
  '/student-portal/holidays',
  '/intern-portal/holidays',
  '/student-portal/notifications',
  '/intern-portal/notifications',
];

routes.forEach(route => {
  const dirPath = path.join(__dirname, 'app', route);
  fs.mkdirSync(dirPath, { recursive: true });

  const title = route.split('/').pop().replace(/-/g, ' ');
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
  const isStudent = route.includes('student');
  const role = isStudent ? 'Student' : 'Intern';

  const content = `"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-white">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/${role.toLowerCase()}-portal">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>${capitalizedTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-8">
        <Card className="max-w-3xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>${capitalizedTitle} (${role} Portal)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">This page is under development. Functionality for ${capitalizedTitle} will be available soon.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
`;

  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
});

console.log('Scaffolded all empty pages!');
