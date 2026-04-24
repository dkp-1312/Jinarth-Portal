'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user: authUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated && authUser) {
      if (authUser.role === 'Student') {
        router.push('/student-portal');
      } else if (authUser.role === 'Intern') {
        router.push('/intern-portal');
      } else if (authUser.role === 'Employee') {
        router.push('/employee-portal');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, authUser, router]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use AuthProvider's login function
      const user = await login(email, password);
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        if (user.role === 'Student') {
          router.push('/student-portal');
        } else if (user.role === 'Intern') {
          router.push('/intern-portal');
        } else if (user.role === 'Employee') {
          router.push('/employee-portal');
        } else {
          router.push('/dashboard');
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-4xl font-bold tracking-tight">Jinarth Portal</CardTitle>
          <CardDescription className="text-lg">Access your dashboard</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@jinarth.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500 text-center">
              Demo Credentials:
              <br />
              Email: admin@jinarth.com
              <br />
              Password: admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
