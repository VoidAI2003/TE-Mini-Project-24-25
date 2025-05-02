"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotificationStore } from "@/lib/notification-store";
import { cn } from "@/lib/utils";
import { BarChartIcon, Package, TrendingUp, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useAuth } from "@/lib/auth-provider";

// Mock data for stats
const statsData = {
  totalSales: "2,345",
  pendingRequests: "18",
  inventoryItems: "1,245",
};

export default function DashboardPage() {
  const { user } = useAuth(); // Access the authenticated user
  const { fetchNotifications, notifications, unreadCount, markAsRead } = useNotificationStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    fetchNotifications();
    setIsClient(true);
  }, [fetchNotifications]);

  // Get only unread notifications
  const unreadNotifications = notifications.filter((notification) => !notification.read).slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {user && (
          <p className="text-sm text-muted-foreground">
            Welcome, {user.email}!
          </p>
        )}

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Sales"
            value={statsData.totalSales}
            description="+12.3% from last month"
            icon={TrendingUp}
          />
          <StatsCard
            title="Pending Requests"
            value={statsData.pendingRequests}
            description="+2 new since yesterday"
            icon={Package}
            iconColor="text-yellow-500"
          />
          <StatsCard
            title="Inventory Items"
            value={statsData.inventoryItems}
            description="87 items low in stock"
            icon={BarChartIcon}
          />
        </div>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Notifications</CardTitle>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/notifications">View All</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {unreadNotifications.length > 0 ? (
              <div className="space-y-4">
                {unreadNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-4 p-4 rounded-lg border bg-muted">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="h-8">
                      Mark as read
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No unread notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts Section */}
        {isClient && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ChartCard title="Request Status" type="pie" />
            <ChartCard title="Weekly Sales" type="bar" />
            <ChartCard title="Monthly Sales Trend" type="line" className="col-span-1 lg:col-span-1 md:col-span-2" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Stats card component
function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  iconColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Chart card component
function ChartCard({
  title,
  type,
  className,
}: {
  title: string;
  type: "pie" | "bar" | "line";
  className?: string;
}) {
  return (
    <Card className={cn("col-span-1", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-80 flex items-center justify-center">
        <div className="text-muted-foreground">
          {type === "pie" && <div className="text-center">Pie Chart Placeholder</div>}
          {type === "bar" && <div className="text-center">Bar Chart Placeholder</div>}
          {type === "line" && <div className="text-center">Line Chart Placeholder</div>}
        </div>
      </CardContent>
    </Card>
  );
}