"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, LogOut, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-provider"; // Use the correct hook
import { useNotificationStore } from "@/lib/notification-store";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth(); // Use the correct useAuth hook
  const { notifications, markAllAsRead, unreadCount } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Use user.email for initials since Firebase user doesn't have a username
  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center w-full justify-between">
          <div className="md:hidden">
            <h2 className="text-lg font-semibold">WMS</h2>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex md:w-1/3 lg:w-1/2 mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products/transactions..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-4">
            {/* Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
                      Mark all as read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                      <div className={cn("text-sm", !notification.read && "font-medium")}>{notification.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">No notifications</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt={user?.email || "User"} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer flex items-center">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}