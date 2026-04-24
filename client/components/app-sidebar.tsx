"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  LayoutDashboard,
  User,
  CheckSquare,
  Calendar,
  Clock,
  Cog,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useAuth } from "@/app/providers/auth-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  },
  teams: [
    {
      name: "Jinarth Infotech",
      logo: GalleryVerticalEnd,
      plan: "",
    }
  ],
}

const adminNav = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard/overview",
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
        {
          title: "Reports",
          url: "/dashboard/reports",
        },
      ],
    },
    {
      title: "Employee",
      url: "/employee",
      icon: Users,
      items: [
        {
          title: "List",
          url: "/employee/list",
        },
        {
          title: "Add Employee",
          url: "/employee/add",
        },
      ],
    },
    {
      title: "Intern",
      url: "/intern",
      icon: Users,
      items: [
        {
          title: "List",
          url: "/intern/list",
        },
        {
          title: "Add Intern",
          url: "/intern/add",
        },
      ],
    },
    {
      title: "Student",
      url: "/student",
      icon: User,
      items: [
        {
          title: "List",
          url: "/student/list",
        },
        {
          title: "Add Student",
          url: "/student/add",
        },
      ],
    },
    {
      title: "Task Management",
      url: "/task-management",
      icon: CheckSquare,
      items: [
        {
          title: "All Tasks",
          url: "/task-management/all",
        },
        {
          title: "Create Task",
          url: "/task-management/create",
        },
        {
          title: "Assigned Tasks",
          url: "/task-management/assigned",
        },
      ],
    },
    {
      title: "Leave",
      url: "/leave",
      icon: Clock,
      items: [
        {
          title: "Leave Request",
          url: "/leave/request",
        },
        {
          title: "Approve Leave",
          url: "/leave/approve",
        },
        {
          title: "Leave History",
          url: "/leave/history",
        },
      ],
    },
    {
      title: "Multi View Calendar",
      url: "/calendar",
      icon: Calendar,
      items: [
        {
          title: "Full Calendar",
          url: "/calendar",
        },
        {
          title: "Events",
          url: "/calendar/events",
        },
        {
          title: "Holidays",
          url: "/calendar/holidays",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Cog,
      items: [
        {
          title: "Profile",
          url: "/settings/profile",
        },
        {
          title: "Change Password",
          url: "/settings/password",
        },
      ],
    },
]

const studentNav = [
  {
    title: "Dashboard",
    url: "/student-portal",
    icon: LayoutDashboard,
    isActive: true,
    items: [],
  },
  {
    title: "Tasks",
    url: "/student-portal/tasks",
    icon: CheckSquare,
    items: [
      { title: "My Tasks", url: "/student-portal/tasks" },
      { title: "Submit Solution", url: "/student-portal/tasks/submit" },
    ],
  },
  {
    title: "Calendar",
    url: "/student-portal/calendar",
    icon: Calendar,
    items: [
      { title: "My Calendar", url: "/student-portal/calendar" },
      { title: "Events", url: "/student-portal/events" },
      { title: "Holidays", url: "/student-portal/holidays" },
    ],
  },
  {
    title: "Leave",
    url: "/student-portal/leave",
    icon: Clock,
    items: [
      { title: "My Leaves", url: "/student-portal/leave" },
      { title: "Request Leave", url: "/student-portal/leave/request" },
    ],
  },
  {
    title: "Settings",
    url: "/student-portal/settings",
    icon: Settings2,
    items: [
      { title: "Profile", url: "/settings/profile" },
      { title: "Change Password", url: "/student-portal/settings/password" },
    ],
  },
]

const internNav = [
  {
    title: "Dashboard",
    url: "/intern-portal",
    icon: LayoutDashboard,
    isActive: true,
    items: [],
  },
  {
    title: "Tasks",
    url: "/intern-portal/tasks",
    icon: CheckSquare,
    items: [
      { title: "My Tasks", url: "/intern-portal/tasks" },
      { title: "Submit Solution", url: "/intern-portal/tasks/submit" },
    ],
  },
  {
    title: "Calendar",
    url: "/intern-portal/calendar",
    icon: Calendar,
    items: [
      { title: "My Calendar", url: "/intern-portal/calendar" },
      { title: "Events", url: "/intern-portal/events" },
      { title: "Holidays", url: "/intern-portal/holidays" },
    ],
  },
  {
    title: "Leave",
    url: "/intern-portal/leave",
    icon: Clock,
    items: [
      { title: "My Leaves", url: "/intern-portal/leave" },
      { title: "Request Leave", url: "/intern-portal/leave/request" },
    ],
  },
  {
    title: "Settings",
    url: "/intern-portal/settings",
    icon: Settings2,
    items: [
      { title: "Profile", url: "/settings/profile" },
      { title: "Change Password", url: "/intern-portal/settings/password" },
    ],
  },
]

const employeeNav = [
  {
    title: "Dashboard",
    url: "/employee-portal",
    icon: LayoutDashboard,
    isActive: true,
    items: [],
  },
  {
    title: "Tasks",
    url: "/employee-portal/tasks",
    icon: CheckSquare,
    items: [
      { title: "My Tasks", url: "/employee-portal/tasks" },
      { title: "Assigned Tasks", url: "/task-management/assigned" },
      { title: "Create Task", url: "/task-management/create" },
      { title: "Submit Solution", url: "/employee-portal/tasks/submit" },
    ],
  },
  {
    title: "Manage Staff",
    url: "/employee", // Assuming Employee can access /employee paths or similar
    icon: Users,
    items: [
      { title: "Students", url: "/student/list" },
      { title: "Interns", url: "/intern/list" },
    ],
  },
  {
    title: "Leave",
    url: "/employee-portal/leave",
    icon: Clock,
    items: [
      { title: "My Leaves", url: "/employee-portal/leave" },
      { title: "Request Leave", url: "/employee-portal/leave/request" },
      { title: "Approve Leaves", url: "/leave/approve" },
    ],
  },
  {
    title: "Calendar",
    url: "/employee-portal/calendar",
    icon: Calendar,
    items: [
      { title: "My Calendar", url: "/employee-portal/calendar" },
    ],
  },
  {
    title: "Settings",
    url: "/employee-portal/settings",
    icon: Settings2,
    items: [
      { title: "Profile", url: "/settings/profile" },
      { title: "Change Password", url: "/employee-portal/settings/password" },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  
  let currentNav = adminNav;
  const role = user?.role as string;
  
  if (role === 'Student') {
    currentNav = studentNav;
  } else if (role === 'Intern') {
    currentNav = internNav;
  } else if (role === 'Employee') {
    currentNav = employeeNav;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={currentNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
