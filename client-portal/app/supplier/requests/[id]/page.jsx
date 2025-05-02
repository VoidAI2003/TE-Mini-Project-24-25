"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  Truck,
  Building,
  MapPin,
  Phone,
  Mail,
  Package,
  ArrowLeft,
  AlertCircle,
  Calendar,
  DollarSign,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";

export default function RequestDetailsPage({ params }) {
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const requestRef = doc(db, "restock_requests", params.id);
        const requestSnap = await getDoc(requestRef);

        if (requestSnap.exists()) {
          const data = requestSnap.data();
          setRequest({
            id: requestSnap.id,
            item: {
              name: data.productName
            },
            quantity: data.quantity,
            total: data.price * data.quantity,
            status: data.states,
            category: data.category,
            urgency: data.urgency,
            notes: data.shortNote,
            dateRequested: data.dateOfRequest,
            ...data
          });
        } else {
          setError("Request not found");
        }
      } catch (err) {
        console.error("Error fetching request:", err);
        setError("Failed to load request details");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [params.id]);

  const handleAcceptRequest = async () => {
    try {
      setProcessing(true);

      // Update request status in restock_requests collection
      const requestRef = doc(db, "restock_requests", request.id);
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

      // Redirect to requests page
      router.push("/supplier/requests");
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept request. Please try again.");
    } finally {
      setProcessing(false);
      setShowAcceptConfirm(false);
    }
  };

  const handleRejectRequest = async () => {
    try {
      setProcessing(true);

      // Update request status to Rejected
      const requestRef = doc(db, "requests", request.id);
      await updateDoc(requestRef, {
        status: "Rejected",
        updatedAt: new Date().toISOString(),
        rejectionReason: "Request rejected by supplier",
      });

      // Redirect to requests page
      router.push("/supplier/requests");
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request. Please try again.");
    } finally {
      setProcessing(false);
      setShowRejectConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading request details...</p>
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
            onClick={() => router.push("/supplier/requests")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/supplier/requests")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Request Details
                </h1>
                <p className="text-sm text-gray-600">
                  View and process stock request
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  request.states === "Pending"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : request.states === "Processing"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : request.states === "Rejected"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {request.states}
              </span>
              {request.states === "Pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRejectConfirm(true)}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Reject Request
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowAcceptConfirm(true)}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Accept Request
                      </>
                    )}
                  </button>
                </div>
              )}
              {request.states !== "Pending" && (
                <button
                  onClick={() => setShowAcceptConfirm(true)}
                  disabled={processing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Accept Request
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Item Details */}
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Item Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Package className="w-4 h-4" />
                    <span>Item Name</span>
                  </div>
                  <p className="text-gray-900">{request.item.name}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Package className="w-4 h-4" />
                    <span>Quantity</span>
                  </div>
                  <p className="text-gray-900">{request.quantity}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Total Amount</span>
                  </div>
                  <p className="text-gray-900">₹{request.total.toFixed(2)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Request Date</span>
                  </div>
                  <p className="text-gray-900">
                    {request.dateRequested ? new Date(request.dateRequested).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Retailer Details */}
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Retailer Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Building className="w-4 h-4" />
                    <span>Retailer ID</span>
                  </div>
                  <p className="text-gray-900">
                    {request.retailerId || 'N/A'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </div>
                  <p className="text-gray-900">
                    {request.item.location || "N/A"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Phone className="w-4 h-4" />
                    <span>Contact</span>
                  </div>
                  <p className="text-gray-900">
                    {request.item.contact || "N/A"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                  <p className="text-gray-900">{request.item.email || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {request.note && (
              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Notes
                </h2>
                <p className="text-gray-600">{request.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Accept Request
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to accept this request? This will mark it as
              processing.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAcceptConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptRequest}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? "Processing..." : "Accept"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reject Request
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reject this request? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectRequest}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? "Processing..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
