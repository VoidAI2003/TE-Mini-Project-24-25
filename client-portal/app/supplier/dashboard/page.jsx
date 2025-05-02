"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Clock,
  User,
  CheckCircle,
  Truck,
  AlertCircle,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

export default function SupplierDashboard() {
  // Status helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50";
      case "Processing":
        return "bg-blue-50";
      case "Shipped":
        return "bg-green-50";
      case "Rejected":
        return "bg-red-50";
      case "Accepted":
        return "bg-purple-50";
      default:
        return "bg-gray-50";
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

  const router = useRouter();
  const [supplierName, setSupplierName] = useState("Supplier");
  const [metrics, setMetrics] = useState([
    {
      name: "Total Items",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Package,
    },
    {
      name: "Pending Orders",
      value: "0",
      change: "-0%",
      trend: "down",
      icon: ShoppingCart,
    },
  ]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    fetchSupplierInfo();

    // Listen for pending orders in real-time
    const requestsRef = collection(db, "restock_requests");
    const pendingRequestsQuery = query(
      requestsRef,
      where("states", "==", "Pending")
    );

    const unsubscribe = onSnapshot(pendingRequestsQuery, (snapshot) => {
      const count = snapshot.size;
      setPendingOrdersCount(count);
      // Update metrics when pending orders count changes
      setMetrics((prev) => [
        ...prev.slice(0, 1),
        {
          ...prev[1],
          value: count.toString(),
        },
      ]);
    });

    // Initial fetch
    fetchDashboardData();

    return () => unsubscribe();
  }, []);

  const fetchSupplierInfo = async () => {
    try {
      // In a real app, you would get the current user's ID from authentication
      const currentUserId = "current-user-id"; // Replace with actual user ID

      const suppliersRef = collection(db, "suppliers");
      const supplierQuery = query(
        suppliersRef,
        where("userId", "==", currentUserId)
      );
      const supplierSnapshot = await getDocs(supplierQuery);

      if (!supplierSnapshot.empty) {
        const supplierData = supplierSnapshot.docs[0].data();
        setSupplierName(supplierData.name || "Supplier");
      }
    } catch (error) {
      console.error("Error fetching supplier info:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch total items count from items collection
      const itemsRef = collection(db, "items");
      const itemsSnapshot = await getDocs(itemsRef);
      const totalItems = itemsSnapshot.size;

      // Fetch pending orders count from restock_requests collection
      const requestsRef = collection(db, "restock_requests");
      const pendingRequestsQuery = query(
        requestsRef,
        where("states", "==", "Pending")
      );
      const pendingRequestsSnapshot = await getDocs(pendingRequestsQuery);
      const pendingOrdersCount = pendingRequestsSnapshot.size;

      // Update metrics with actual values
      setMetrics([
        {
          name: "Total Items",
          value: totalItems.toString(),
          change: "+12%", // This could be calculated based on historical data
          trend: "up",
          icon: Package,
        },
        {
          name: "Pending Orders",
          value: pendingOrdersCount.toString(),
          change: "-2%", // This could be calculated based on historical data
          trend: "down",
          icon: ShoppingCart,
        },
      ]);

      // Fetch recent orders from restock_requests collection
      const recentRequestsQuery = query(
        requestsRef,
        orderBy("dateOfRequest", "desc"),
        limit(3)
      );
      const recentRequestsSnapshot = await getDocs(recentRequestsQuery);
      const ordersData = recentRequestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentOrders(ordersData);

      // Fetch recent transactions
      const requestsSnapshot = await getDocs(recentRequestsQuery);

      const transactionsData = await Promise.all(
        requestsSnapshot.docs.map(async (doc, index) => {
          const data = doc.data();

          // Skip pending orders
          if (data.states === "Pending") {
            return null;
          }

          // Generate sequential transaction ID
          const transactionId = `TRX-${String(index + 1).padStart(3, '0')}`;

          // Get confirmed date from status history
          let confirmedDate = "Not confirmed yet";
          let status = data.states || "Pending";

          if (status === "Rejected") {
            confirmedDate = data.updatedAt
              ? new Date(data.updatedAt).toISOString().split("T")[0]
              : "Rejected";
          } else {
            // Check status history for acceptance date
            if (data.statusHistory && Array.isArray(data.statusHistory)) {
              const acceptanceEntry = data.statusHistory.find(
                entry => entry.states === "Processing"
              );
              if (acceptanceEntry && acceptanceEntry.timestamp) {
                confirmedDate = new Date(acceptanceEntry.timestamp).toISOString().split("T")[0];
              }
            }

            // Check orders collection for confirmation
            const ordersRef = collection(db, "orders");
            const orderQuery = query(
              ordersRef,
              where("requestId", "==", doc.id)
            );
            const orderSnapshot = await getDocs(orderQuery);

            if (!orderSnapshot.empty) {
              const orderData = orderSnapshot.docs[0].data();
              if (orderData.createdAt) {
                confirmedDate = orderData.createdAt.split("T")[0];
                status = "Confirmed";
              }
            }
          }

          return {
            transactionId: transactionId,
            amount: data.price * data.quantity || 0,
            status: status,
            date: data.dateOfRequest ? new Date(data.dateOfRequest).toISOString().split("T")[0] : "No date",
          };
        })
      );

      // Filter out null values (pending orders)
      const filteredTransactions = transactionsData.filter(
        (transaction) => transaction !== null
      );

      setRecentTransactions(filteredTransactions);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-1">
              Here's an overview of your business performance
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl">
            <User className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{metric.name}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm ${
                      metric.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {metric.change}
                  </span>
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600 ml-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600 ml-1" />
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <metric.icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => router.push("/supplier/items")}
          className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-800">Manage Items</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Add or update your inventory items
          </p>
        </button>
        <button
          onClick={() => router.push("/supplier/requests")}
          className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-800">Process Requests</h3>
          </div>
          <p className="text-gray-600 text-sm">
            View and fulfill retailer requests
          </p>
        </button>
        <button
          onClick={() => router.push("/supplier/transactions")}
          className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-800">Transactions</h3>
          </div>
          <p className="text-gray-600 text-sm">View transaction history</p>
        </button>
      </div>

      {/* Recent Orders and Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Requests</h2>
            <button
              onClick={() => router.push("/supplier/requests")}
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
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retailer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/supplier/requests/${request.id}`)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {request.productName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.retailerId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ₹{(request.price * request.quantity).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          request.states
                        )}`}
                      >
                        {request.states}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Transactions
            </h2>
            <button
              onClick={() => router.push("/supplier/transactions")}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                onClick={() => router.push(`/supplier/transactions/${transaction.transactionId}`)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Transaction ID: {transaction.transactionId}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.date}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-sm font-medium text-gray-900">
                    ₹{transaction.amount}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(transaction.status)}`} />
                    {getStatusIcon(transaction.status)}
                    <span className="text-sm font-medium text-gray-900">{transaction.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
