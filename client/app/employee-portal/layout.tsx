'use client';

import { useAuth } from '@/app/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppHeader } from '@/components/app-header';

export default function EmployeePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only allow Employees to access employee portal
    if (!isLoading && isAuthenticated && user?.role !== 'Employee') {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading state
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

  // Prevent rendering if not authenticated or not Employee
  if (!isAuthenticated || user?.role !== 'Employee') {
    return null;
  }

  return (
    <>
      <main>{children}</main>
    </>
  );
}
