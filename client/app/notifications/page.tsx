'use client';

import { useEffect, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  expiresAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setNotifications(data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Notifications</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold">All Notifications</h1>
            <Button variant="outline" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">No notifications found.</Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`p-4 ${notification.isRead ? 'bg-white' : 'border-blue-300 bg-blue-50'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()} • Expires {new Date(notification.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.isRead ? (
                      <Button size="sm" variant="outline" onClick={() => markAsRead(notification._id)}>
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
