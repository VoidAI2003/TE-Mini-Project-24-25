"use client";
import React from "react";
import { usePathname } from "next/navigation";
import {
  Package,
  ShoppingCart,
  History,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

export default function SupplierLayout({ children }) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/supplier/dashboard",
      icon: BarChart3,
    },
    {
      name: "Items",
      href: "/supplier/items",
      icon: Package,
    },
    {
      name: "Requests",
      href: "/supplier/requests",
      icon: ShoppingCart,
    },
    {
      name: "Transactions",
      href: "/supplier/transactions",
      icon: History,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">Supplier</h1>
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
    </div>
  );
}
