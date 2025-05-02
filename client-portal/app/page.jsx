"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Package, ShoppingCart, TrendingUp, BarChart3 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Retailer</h1>
          <p className="text-xl text-gray-600">
            Choose your portal to start managing inventory operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Supplier Portal */}
          <div
            className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push("/supplier/dashboard")}
          >
            <div className="bg-blue-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Supplier Portal
            </h2>
            <ul className="space-y-3 text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                • Manage your inventory items
              </li>
              <li className="flex items-center gap-2">
                • Process and fulfill orders
              </li>
              <li className="flex items-center gap-2">
                • Track shipments and deliveries
              </li>
              <li className="flex items-center gap-2">
                • Monitor sales and performance
              </li>
            </ul>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Enter Supplier Portal
            </button>
          </div>

          {/* Retailer Portal */}
          <div
            className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push("/retailer/dashboard")}
          >
            <div className="bg-green-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Retailer Portal
            </h2>
            <ul className="space-y-3 text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                • Browse available items
              </li>
              <li className="flex items-center gap-2">
                • Place and track orders
              </li>
              <li className="flex items-center gap-2">
                • Manage invoices and payments
              </li>
              <li className="flex items-center gap-2">• View order history</li>
            </ul>
            <button className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Enter Retailer Portal
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Why Choose SmartChain?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">
                Real-time Updates
              </h4>
              <p className="text-gray-600 text-sm">
                Track inventory and orders in real-time
              </p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">
                Smart Analytics
              </h4>
              <p className="text-gray-600 text-sm">
                Make data-driven decisions
              </p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">
                Easy Management
              </h4>
              <p className="text-gray-600 text-sm">
                Streamlined inventory operations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
