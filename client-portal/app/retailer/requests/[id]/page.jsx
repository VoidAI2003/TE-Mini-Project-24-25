"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Package, Building, DollarSign, Calendar } from "lucide-react";

export default function RequestDetailsPage() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const requestRef = doc(db, "restock_requests", id);
        const requestSnap = await getDoc(requestRef);

        if (!requestSnap.exists()) {
          throw new Error("Request not found");
        }

        const requestData = requestSnap.data();
        setRequest({
          id: requestSnap.id,
          ...requestData
        });
      } catch (err) {
        console.error("Error fetching request:", err);
        setError("Failed to load request details");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Request not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Request Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Request ID: {request.id}
              </p>
            </div>
            <div className="flex items-center">
              <span
                className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(
                  request.states
                )}`}
              >
                {request.states}
              </span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Item</h3>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-900 font-medium">{request.productName || "N/A"}</p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Quantity</h3>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-900 font-medium">{request.quantity}</p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Price</h3>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-900 font-medium">₹{request.price}</p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total</h3>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-900 font-medium">₹{(request.price * request.quantity).toFixed(2)}</p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Date</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-900 font-medium">
                    {new Date(request.dateOfRequest).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Supplier</h3>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-900 font-medium">{request.supplierId || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Shipped":
      return "bg-green-100 text-green-800 border-green-200";
    case "Accepted":
      return "bg-green-100 text-green-800 border-green-200";
    case "Rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
