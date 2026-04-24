"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/auth-provider";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  entityType?: 'Task' | 'Leave' | 'Holiday';
  entityId?: string;
  createdAt: string;
};

export function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const getPortalBase = () => {
    if (user?.role === 'Student') return 'student-portal';
    if (user?.role === 'Intern') return 'intern-portal';
    if (user?.role === 'Employee') return 'employee-portal';
    return 'dashboard';
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    const portalBase = getPortalBase();
    setOpen(false);

    // Mark as read if it's not
    if (!item.isRead) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await fetch(`/api/notifications/${item._id}/read`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          });
          setItems(prev => prev.map(i => i._id === item._id ? { ...i, isRead: true } : i));
          setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
          console.error("Failed to mark notification as read", err);
        }
      }
    }

    if (item.entityType === 'Task') {
      if (user?.role === 'Admin') {
        router.push(`/task-management/all?taskId=${item.entityId}`);
      } else {
        router.push(`/${portalBase}/tasks?taskId=${item.entityId}`);
      }
    } else if (item.entityType === 'Leave') {
      if (user?.role === 'Admin' || user?.role === 'Employee') {
        router.push(`/leave/approve?leaveId=${item.entityId}`);
      } else {
        router.push(`/${portalBase}/leave?leaveId=${item.entityId}`);
      }
    } else if (item.entityType === 'Holiday') {
       router.push(`/${portalBase}/calendar?holidayId=${item.entityId}`);
    } else {
      router.push("/notifications");
    }
  };

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUnreadCount(data.count || 0);
    } catch (error) {
      console.error("Failed to fetch unread notification count", error);
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setItems((data.data || []).slice(0, 7));
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="fixed right-4 top-4 z-50">
      <Button
        variant="outline"
        size="icon"
        className="relative bg-white shadow-sm"
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          if (!open) fetchNotifications();
        }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
        )}
      </Button>

      {open && (
        <Card className="mt-2 w-[340px] p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 ? (
              <button className="text-xs text-blue-600" onClick={markAllAsRead}>
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-80 space-y-2 overflow-auto">
            {items.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No notifications</p>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className={`rounded border p-2 cursor-pointer hover:shadow-sm transition-shadow ${item.isRead ? "bg-white" : "bg-blue-50 border-blue-100"}`}
                  onClick={() => handleNotificationClick(item)}
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 border-t pt-2">
            <button
              className="w-full text-sm font-medium text-blue-600"
              onClick={() => {
                setOpen(false);
                router.push("/notifications");
              }}
            >
              View all
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
