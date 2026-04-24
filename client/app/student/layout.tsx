'use client';

import { useAuth } from '@/app/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppHeader } from '@/components/app-header';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    // Only allow admins and employees
    if (!isLoading && isAuthenticated && !['Admin', 'Employee'].includes(user?.role || '')) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

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

  if (!isAuthenticated || !['Admin', 'Employee'].includes(user?.role || '')) {
    return null;
  }

  return (
    <>
      <AppHeader />
      <main>{children}</main>
    </>
  );
}
