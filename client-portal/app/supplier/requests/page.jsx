"use client";
import React, { useState, useEffect } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Building,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  Check,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SupplierRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const handleAcceptRequest = async (requestId) => {
    try {
      setProcessing(true);
      const requestRef = doc(db, "restock_requests", requestId);
      await updateDoc(requestRef, {
        states: "Processing",
        updatedAt: new Date().toISOString(),
        statusHistory: [
          {
            states: "Processing",
            timestamp: new Date().toISOString(),
            notes: "Request accepted by supplier",
          },
        ],
      });
      
      // Refresh the requests list
      await fetchRequests();
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept request. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const requestsRef = collection(db, "restock_requests");
        let q = query(requestsRef, orderBy("dateOfRequest", "desc"));

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
            ...data
          };
        });

        setRequests(requestsData);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Shipped":
        return "bg-green-50 text-green-700 border-green-200";
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

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Incoming Requests
              </h1>
              <p className="text-sm text-gray-600">
                Manage and process stock requests
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
              </select>
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/supplier/requests/${request.id}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.item.name}
                        </h3>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>Quantity: {request.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Requested: {" "}
                            {request.dateOfRequest ? new Date(request.dateOfRequest).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          <span>Retailer: {request.retailerId || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        ₹{(request.price * request.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No requests have been submitted yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
