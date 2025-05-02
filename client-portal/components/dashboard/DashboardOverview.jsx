"use client";
import React, { useState, useEffect } from "react";
import {
  Package,
  Truck,
  Box,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  Calendar,
  ChevronDown,
  Clock,
  CheckCircle,
  Building,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export default function DashboardOverview() {
  const [dateRange, setDateRange] = useState("This Month");
  const [purchaseOrderDate, setPurchaseOrderDate] = useState("This Month");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const requestsRef = collection(db, "restock_requests");
        const q = query(requestsRef, orderBy("dateOfRequest", "desc"));

        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            item: {
              name: data.productName
            },
            status: data.states,
            createdAt: data.dateOfRequest,
            quantity: data.quantity,
            price: data.price,
            retailerId: data.retailerId
          };
        });

        setRequests(requestsData);
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const statusCards = [
    { number: 10, label: "Qty", description: "TO BE PACKED", color: "blue" },
    { number: 0, label: "Qty", description: "TO BE SHIPPED", color: "red" },
    { number: 0, label: "Pkgs", description: "IN TRANSIT", color: "green" },
    { number: 10, label: "Pkgs", description: "DELIVERED", color: "orange" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusCards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center bg-${card.color}-50`}
              >
                <span className={`text-2xl font-bold text-${card.color}-600`}>
                  {card.number}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-sm font-medium text-gray-900">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Summary & Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Inventory Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Quantity in Hand</p>
              <p className="text-xl font-semibold text-gray-900">10</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Quantity to be Received</p>
              <p className="text-xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Product Details
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Low Stock Items</span>
              <span className="text-red-600 font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">All Item Groups</span>
              <span className="text-gray-900 font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">All Items</span>
              <span className="text-gray-900 font-semibold">0</span>
            </div>
            <div className="flex justify-center items-center h-32">
              <div className="text-center">
                <div className="w-24 h-24 border-4 border-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm text-gray-500">No Active Items</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Items & Purchase Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Top Selling Items
            </h3>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
            </div>
          </div>
          <div className="text-center py-8 text-gray-500">
            No items were invoiced in this time frame
          </div>
        </div>

        {/* Purchase Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Purchase Orders
            </h3>
            <div className="relative">
              <select
                value={purchaseOrderDate}
                onChange={(e) => setPurchaseOrderDate(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading requests...</p>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getStatusIcon(request.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{request.item.name}</h3>
                        <p className="text-sm text-gray-500">Quantity: {request.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline-block mr-1" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        <Building className="w-4 h-4 inline-block mr-1" />
                        {request.retailerId}
                      </div>
                      <div
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-right text-lg font-semibold text-gray-900">
                    ₹{(request.price * request.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
