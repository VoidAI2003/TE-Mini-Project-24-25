"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle,
  Truck,
  Package,
  Building,
  Calendar,
  ChevronRight,
  AlertCircle,
  Plus,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc } from "firebase/firestore";
import { doc as docRef } from "firebase/firestore";

export default function RetailerOrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [orders, setOrders] = useState({ retailerRequests: [], supplierOrders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const requestsRef = collection(db, "restock_requests");
        let q = query(requestsRef, orderBy("dateOfRequest", "desc"));

        // Add status filter if not "all"
        if (selectedStatus !== "all") {
          q = query(q, where("states", "==", selectedStatus));
        }

        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map((doc) => {
          const orderData = doc.data();
          return {
            id: doc.id, // Keep the document ID for routing
            requestId: orderData.requestId || orderData.id, // Use requestId if available, fallback to id
            ...orderData,
            item: { name: "N/A" }
          };
        });

        console.log("All requests:", ordersData);

        if (ordersData.length === 0) {
          throw new Error("No requests found in the database");
        }

        setOrders({
          retailerRequests: ordersData,
          supplierOrders: []
        });

        // Show all requests
        const retailerRequests = ordersData;
        const supplierOrders = [];

        console.log("All requests:", retailerRequests);

        if (retailerRequests.length === 0) {
          throw new Error("No requests found in the database");
        }

        setOrders({
          retailerRequests,
          supplierOrders
        });
      } catch (err) {
        console.error("Error fetching restock requests:", err);
        setError("Failed to load restock requests");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [selectedStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Shipped":
        return "bg-green-50 text-green-700 border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "Accepted":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "Processing":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "Shipped":
        return <Truck className="w-5 h-5 text-green-500" />;
      case "Rejected":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "Accepted":
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders and requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Orders & Requests</h1>
            <p className="text-sm text-gray-600">
              View your restock requests and supplier orders
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
            >
              <option value="all">All</option>
              <option value="requests">My Requests</option>
              <option value="orders">Supplier Orders</option>
            </select>
            <button
              onClick={() => router.push("/retailer/browse")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Request
            </button>
          </div>
        </div>

        <div className="mt-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Orders/Requests List */}
          <div className="space-y-4">
            {orders.retailerRequests.length > 0 ? (
              orders.retailerRequests.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/retailer/requests/${order.id}`)}
                >
                  <div className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            Request ID: {order.requestId}
                          </h3>
                          <span
                            className={`px-3 py-1.5 text-xs font-medium rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-700">
                              {order.productName || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {new Date(order.dateOfRequest).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center">
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{order.total}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {order.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : viewMode === "orders" ? (
              orders.supplierOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/retailer/orders/${order.id}`)}
                >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              Order ID: {order.requestId}
                            </h3>
                            <span
                              className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            From: {order.supplierName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Item: {order.productName || "N/A"}
                          </p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Received: {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            Order {order.orderNumber}
                          </h3>
                          <span
                            className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          From: {order.supplierName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Item: {order.productName || "N/A"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Received: {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{order.total}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              [...orders.retailerRequests, ...orders.supplierOrders].map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => 
                    order.retailerId === "current-retailer-id" 
                      ? router.push(`/retailer/requests/${order.id}`) 
                      : router.push(`/retailer/orders/${order.id}`)
                  }
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {order.retailerId === "current-retailer-id" 
                              ? `Request ID: ${order.requestId}` 
                              : `Order ID: ${order.requestId}`
                            }
                          </h3>
                          <span
                            className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        {order.retailerId === "current-retailer-id" ? (
                          <p className="text-lg font-semibold text-gray-900">
                            ₹{order.total}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600">
                            From: {order.supplierName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-end">
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{order.total}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {Object.values(orders).every(arr => arr.length === 0) && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {viewMode === "requests"
                  ? "No requests found"
                  : viewMode === "orders"
                  ? "No supplier orders found"
                  : "No orders or requests found"
                }
              </h3>
              <p className="text-gray-600">
                {viewMode === "requests"
                  ? "Create a new request to order items"
                  : viewMode === "orders"
                  ? "Your restock requests will appear here once they are accepted by suppliers"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
