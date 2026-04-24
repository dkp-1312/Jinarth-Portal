'use client';

import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { NotificationBell } from '@/components/notification-bell';
import { useAuth } from '@/app/providers/auth-provider';
import { usePathname } from 'next/navigation';

export function ClientLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Pages that should not show sidebar
  const publicPages = ['/login', '/'];

  // Check if current page is public
  const isPublicPage = publicPages.includes(pathname);

  // Show loader while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show sidebar for authenticated users or portal paths (to prevent context errors)
  const isPortalPage = pathname.includes('-portal') || pathname.startsWith('/task-management') || pathname.startsWith('/intern') || pathname.startsWith('/student') || pathname.startsWith('/employee') || pathname.startsWith('/dashboard') || pathname.startsWith('/leave') || pathname.startsWith('/calendar');

  if ((isAuthenticated && !isPublicPage) || isPortalPage) {
    // If it's a portal page but not authenticated (and not loading), let the page-level layout handle the redirect
    // but we still provide the SidebarProvider to prevent "useSidebar must be used within SidebarProvider" errors
    return (
      <SidebarProvider>
        {isAuthenticated && !isPublicPage && <AppSidebar />}
        <SidebarInset>
          {isAuthenticated && !isPublicPage ? <NotificationBell /> : null}
          {children}
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // For public pages or unauthenticated non-portal users, show without sidebar
  return <>{children}</>;
}
