"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Boxes,
  ShoppingCart,
  ShoppingBag,
  Puzzle,
  BarChart,
  Folder,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";

const menuItems = [
  { name: "Home", icon: Home, path: "/dashboard/home/overview" },
  {
    name: "Inventory",
    icon: Boxes,
    path: "/dashboard/inventory",
    submenu: [
      { name: "Items", path: "/dashboard/inventory/items" },
      {
        name: "Inventory Adjustments",
        path: "/dashboard/inventory/adjustments",
      },
    ],
  },
  {
    name: "Sales",
    icon: ShoppingCart,
    path: "/dashboard/sales",
    submenu: [
      { name: "Orders", path: "/dashboard/sales/orders" },
      { name: "Customers", path: "/dashboard/sales/customers" },
      { name: "Invoices", path: "/dashboard/sales/invoices" },
    ],
  },
  {
    name: "Purchases",
    icon: ShoppingBag,
    path: "/dashboard/purchases",
    submenu: [
      { name: "Orders", path: "/dashboard/purchases/orders" },
      { name: "Suppliers", path: "/dashboard/purchases/suppliers" },
      { name: "Returns", path: "/dashboard/purchases/returns" },
    ],
  },
  { name: "Integrations", icon: Puzzle, path: "/dashboard/integrations" },
  { name: "Reports", icon: BarChart, path: "/dashboard/reports" },
  { name: "Documents", icon: Folder, path: "/dashboard/documents" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const pathname = usePathname();

  const toggleSubmenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const isActive = (path) => pathname === path;

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-56"
      } min-h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col`}
    >
      {/* Logo Section */}
      <div className="h-14 flex items-center justify-center border-b border-gray-800">
        <Boxes className="w-8 h-8 text-blue-500" />
      </div>

      <div className="flex-1 py-4">
        {menuItems.map((item) => (
          <div key={item.name}>
            <Link
              href={item.path}
              onClick={() => {
                if (item.submenu) toggleSubmenu(item.name);
              }}
              className={`w-full flex items-center px-4 py-2 hover:bg-gray-800 transition-colors duration-200
                ${isActive(item.path) ? "bg-blue-600 hover:bg-blue-700" : ""}
                ${isCollapsed ? "justify-center" : "justify-between"}`}
              aria-label={isCollapsed ? item.name : undefined}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.name}</span>}
              </div>
              {!isCollapsed && item.submenu && (
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedMenus[item.name] ? "rotate-180" : ""
                  }`}
                />
              )}
            </Link>

            {!isCollapsed && item.submenu && expandedMenus[item.name] && (
              <div className="bg-gray-800 overflow-hidden transition-all duration-300 ease-in-out">
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.name}
                    href={subItem.path}
                    className={`w-full text-left px-12 py-2 hover:bg-gray-700 transition-colors duration-200 block
                      ${
                        isActive(subItem.path)
                          ? "text-white"
                          : "text-gray-300 hover:text-white"
                      }`}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          className={`w-5 h-5 transition-transform duration-200 ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}
