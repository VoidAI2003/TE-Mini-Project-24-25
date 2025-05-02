"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Store, ShoppingCart, BarChart3, Settings, LogOut } from "lucide-react";
import { Toaster } from "sonner";

export default function RetailerLayout({ children }) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/retailer/dashboard",
      icon: BarChart3,
    },
    {
      name: "Browse Items",
      href: "/retailer/browse",
      icon: Store,
    },
    {
      name: "Orders",
      href: "/retailer/orders",
      icon: ShoppingCart,
    },
    {
      name: "Sales Report",
      href: "/retailer/sales-report",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">Retailer</h1>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </a>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <a
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <Settings className="w-5 h-5" />
              Settings
            </a>
            <a
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">{children}</div>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
