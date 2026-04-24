"use client";

import { useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { HeartCrack, Key } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function PortalChangePassword() {
  const { user, token } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-white">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={
                  user?.role === 'Student' ? '/student-portal' : 
                  user?.role === 'Intern' ? '/intern-portal' : 
                  user?.role === 'Admin' ? '/dashboard' :
                  '/employee-portal'
                }>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Change Password</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-5 h-5 text-gray-500" />
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>
                Ensure your account is using a long, random password to stay secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <span className="font-semibold">✓ Success!</span> Your password has been successfully updated.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="pt-4">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Updating Password..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
