"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Building,
  DollarSign,
  Info,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function OrderDetailsPage({ params }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderRef = doc(db, "orders", params.id);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          setOrder({
            id: orderSnap.id,
            ...orderSnap.data(),
          });
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

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
      default:
        return null;
    }
  };

  const getShipmentStatus = () => {
    if (order?.status === "Shipped") {
      return [
        { title: "Order Placed", date: order.createdAt, completed: true },
        {
          title: "Processing",
          date: order.statusHistory?.find((h) => h.status === "Processing")
            ?.timestamp,
          completed: true,
        },
        {
          title: "Shipped",
          date: order.statusHistory?.find((h) => h.status === "Shipped")
            ?.timestamp,
          completed: true,
        },
        {
          title: "Out for Delivery",
          date: order.deliveryDate,
          completed: false,
        },
        { title: "Delivered", date: "", completed: false },
      ];
    }
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">{error}</p>
          <button
            onClick={() => router.push("/retailer/orders")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const shipmentStatus = getShipmentStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/retailer/orders")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Order Details
                </h1>
                <p className="text-sm text-gray-600">
                  View and track your order
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    {order.status === "Shipped" && (
                      <span className="text-sm text-gray-600">
                        Tracking: {order.trackingNumber}
                      </span>
                    )}
                  </div>
                  {order.status === "Shipped" && (
                    <div className="text-sm text-gray-600 mt-1">
                      Expected delivery:{" "}
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {order.status === "Shipped" && (
                <div className="relative mt-6">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
                  <div className="space-y-6">
                    {[
                      {
                        title: "Order Placed",
                        date: order.createdAt,
                        completed: true,
                      },
                      {
                        title: "Processing",
                        date: order.statusHistory?.find(
                          (h) => h.status === "Processing"
                        )?.timestamp,
                        completed: true,
                      },
                      {
                        title: "Shipped",
                        date: order.statusHistory?.find(
                          (h) => h.status === "Shipped"
                        )?.timestamp,
                        completed: true,
                      },
                      {
                        title: "Out for Delivery",
                        date: order.deliveryDate,
                        completed: false,
                      },
                      { title: "Delivered", date: "", completed: false },
                    ].map((status, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div
                          className={`w-3 h-3 rounded-full mt-1.5 ${
                            status.completed ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                        <div>
                          <div
                            className={`font-medium ${
                              status.completed
                                ? "text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {status.title}
                          </div>
                          {status.date && (
                            <div className="text-sm text-gray-600">
                              {new Date(status.date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    Order Progress
                  </div>
                  <div className="text-sm text-gray-500">{order.status}</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      order.status === "Delivered"
                        ? "bg-green-500"
                        : order.status === "Out for Delivery"
                        ? "bg-blue-500"
                        : order.status === "Shipped"
                        ? "bg-blue-400"
                        : order.status === "Processing"
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }`}
                    style={{
                      width: `${
                        order.status === "Delivered"
                          ? "100%"
                          : order.status === "Out for Delivery"
                          ? "80%"
                          : order.status === "Shipped"
                          ? "60%"
                          : order.status === "Processing"
                          ? "40%"
                          : "20%"
                      }`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">Order Placed</span>
                  <span className="text-xs text-gray-500">Processing</span>
                  <span className="text-xs text-gray-500">Shipped</span>
                  <span className="text-xs text-gray-500">
                    Out for Delivery
                  </span>
                  <span className="text-xs text-gray-500">Delivered</span>
                </div>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Item
                      </h3>
                      <p className="text-gray-900">{order.item.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Building className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Quantity
                      </h3>
                      <p className="text-gray-900">{order.quantity}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Order Date
                      </h3>
                      <p className="text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <span className="text-gray-600">₹</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Total Amount
                      </h3>
                      <p className="text-gray-900">₹{order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Info className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Category
                      </h3>
                      <p className="text-gray-900">{order.category}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Urgency
                      </h3>
                      <p className="text-gray-900">{order.urgency}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Notes
                  </h3>
                  <p className="text-gray-900">{order.notes}</p>
                </div>
              )}

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">
                    Status History
                  </h3>
                  <div className="space-y-4">
                    {order.statusHistory.map((history, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getStatusIcon(history.status)}
                        </div>
                        <div>
                          <p className="text-gray-900">{history.status}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(history.timestamp).toLocaleString()}
                          </p>
                          {history.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              {history.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Supplier Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Supplier Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {order.supplier?.name || "Not specified"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="text-gray-600">
                    {order.supplier?.location || "Not specified"}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="text-gray-600">
                    {order.supplier?.email || "Not specified"}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="text-gray-600">
                    {order.supplier?.phone || "Not specified"}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Shipping Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {order.shippingMethod || "Standard Delivery"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">Order Date</div>
                    <div className="text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {order.deliveryDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">
                        Expected Delivery
                      </div>
                      <div className="text-gray-900">
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">
                        Tracking Number
                      </div>
                      <div className="text-gray-900">
                        {order.trackingNumber}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
