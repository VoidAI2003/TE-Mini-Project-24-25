"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Bell,
  Settings,
  ChevronRight,
  Menu,
  Truck,
  BarChart,
  Sparkles,
  Package2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useNotificationStore } from "@/lib/notification-store";

// Sidebar state management with Zustand
type SidebarState = {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
};

export const useSidebarStore = create(
  persist<SidebarState>(
    (set) => ({
      expanded: false,
      setExpanded: (expanded) => set({ expanded }),
      toggleExpanded: () => set((state) => ({ expanded: !state.expanded })),
    }),
    {
      name: "sidebar-storage",
    }
  )
);

// Navigation items
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Restock Requests",
    href: "/transactions",
    icon: Package,
  },
  {
    title: "Confirmed Transactions",
    href: "/transactions/confirmed",
    icon: Truck,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package2,
  },
  {
    title: "Sales Reports",
    href: "/reports",
    icon: BarChart,
  },
  {
    title: "Demand Prediction",
    href: "/demand-prediction",
    icon: Sparkles,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: true,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { expanded, setExpanded, toggleExpanded } = useSidebarStore();
  const { unreadCount } = useNotificationStore();
  const [isMounted, setIsMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle click outside to collapse sidebar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && expanded) {
        setExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded, setExpanded]);

  // Ensure hydration is complete before rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Warehouse Management</h2>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      {item.badge && unreadCount > 0 && (
                        <Badge className="ml-auto bg-destructive text-destructive-foreground">{unreadCount}</Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        ref={sidebarRef}
        className="hidden md:flex flex-col h-screen border-r transition-all duration-300 ease-in-out"
        style={{ width: expanded ? "240px" : "64px" }}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {expanded && <h2 className="text-lg font-semibold">Warehouse</h2>}
          <Button
            variant="ghost"
            size="icon"
            className={cn("transition-transform", expanded ? "rotate-180" : "")}
            onClick={toggleExpanded}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  aria-label={!expanded ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  {expanded && <span>{item.title}</span>}
                  {item.badge && unreadCount > 0 && (
                    <Badge
                      className={cn(
                        "bg-destructive text-destructive-foreground",
                        expanded ? "ml-auto" : "absolute top-1 right-1 h-2 w-2 p-0"
                      )}
                    >
                      {expanded ? unreadCount : ""}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}