"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

export default function RetailerDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total requests
        const requestsRef = collection(db, "restock_requests");
        const requestsSnapshot = await getDocs(requestsRef);
        const totalRequests = requestsSnapshot.size;

        // Fetch available items
        const itemsRef = collection(db, "items");
        const itemsSnapshot = await getDocs(itemsRef);
        const availableItems = itemsSnapshot.size;

        // Calculate request change (mock data for now)
        const requestChange = "+8%";

        // Set metrics
        setMetrics([
          {
            name: "Total Requests",
            value: totalRequests.toString(),
            change: requestChange,
            trend: "up",
            icon: ShoppingCart,
            color: "blue",
          },
          {
            name: "Available Items",
            value: availableItems.toString(),
            change: "+24",
            trend: "up",
            icon: Package,
            color: "purple",
          },
        ]);

        // Fetch recent requests
        const recentRequestsQuery = query(
          requestsRef,
          orderBy("dateOfRequest", "desc"),
          limit(5)
        );
        const recentRequestsSnapshot = await getDocs(recentRequestsQuery);
        const requestsData = recentRequestsSnapshot.docs.map((doc, index) => {
          const data = doc.data();
          return {
            id: doc.id,
            requestId: data.requestId || doc.id,
            item: {
              name: data.productName || "N/A"
            },
            status: data.states || "Under Review",
            createdAt: data.dateOfRequest,
            date: data.dateOfRequest ? new Date(data.dateOfRequest).toISOString().split("T")[0] : "No date",
            totalAmount: (data.price || 0) * (data.quantity || 0),
            ...data
          };
        });
        setRecentOrders(requestsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getColorClasses = (color) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-green-100 text-green-600";
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-8">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Welcome back to your retailer portal
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div
                className={`p-3 rounded-xl ${getColorClasses(metric.color)}`}
              >
                <metric.icon className="w-7 h-7" />
              </div>
              <span
                className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${
                  metric.trend === "up"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {metric.change}
                {metric.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 ml-1" />
                )}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              {metric.value}
            </h3>
            <p className="text-gray-600 text-base font-medium">{metric.name}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <button
          onClick={() => router.push("/retailer/browse")}
          className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group"
        >
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">
            Browse Items
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Explore available products from suppliers
          </p>
          <div className="flex items-center text-blue-600 text-sm font-medium">
            View catalog
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
        <button
          onClick={() => router.push("/retailer/orders")}
          className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group"
        >
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">
            Track Orders
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            View and manage your orders
          </p>
          <div className="flex items-center text-blue-600 text-sm font-medium">
            View orders
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
        <button
          onClick={() => router.push("/retailer/sales-report")}
          className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group"
        >
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">Reports</h3>
          <p className="text-gray-600 text-sm mb-4">
            View sales analytics and insights
          </p>
          <div className="flex items-center text-blue-600 text-sm font-medium">
            View reports
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Requests
          </h2>
          <button
            onClick={() => router.push("/retailer/requests")}
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((request) => (
                <tr
                  key={request.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/retailer/requests/${request.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.requestId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.itemName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ₹{request.price?.toFixed(2) || "0.00"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ₹{request.totalAmount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === "Processing"
                          ? "bg-blue-50 text-blue-600"
                          : request.status === "Shipped"
                          ? "bg-green-50 text-green-600"
                          : request.status === "Rejected"
                          ? "bg-red-50 text-red-600"
                          : request.status === "Under Review"
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.date}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
