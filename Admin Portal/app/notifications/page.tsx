"use client"

import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNotificationStore } from "@/lib/notification-store"
import { formatDistanceToNow } from "date-fns"
import { Bell, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, fetchNotifications, unreadCount } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn("flex items-start gap-4 p-4 rounded-lg border", !notification.read && "bg-muted")}
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm", !notification.read && "font-medium")}>{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="h-8">
                        Mark as read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You don&apos;t have any notifications at the moment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

