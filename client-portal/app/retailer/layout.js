"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RetailerLayout({ children }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/retailer/dashboard" },
    { name: "Browse Suppliers", href: "/retailer/suppliers" },
    { name: "Orders", href: "/retailer/orders" },
    { name: "Inventory", href: "/retailer/inventory" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/retailer/dashboard"
                className="text-xl font-bold text-foreground"
              >
                Retailer Portal
              </Link>
            </div>
            <div className="flex space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto py-6">{children}</main>
    </div>
  );
}
