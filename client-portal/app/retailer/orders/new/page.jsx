"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  Minus,
  Plus,
  ShoppingCart,
  X,
  Truck,
  Calendar,
  ArrowLeft,
  Clock,
  DollarSign,
  AlertCircle,
  Building,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";

export default function NewOrderPage() {
  const auth = getAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("item");

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        if (itemId) {
          // Create document reference using itemId as the document ID
          const itemRef = doc(db, "items", itemId);
          const itemSnap = await getDoc(itemRef);

          if (itemSnap.exists()) {
            const itemData = {
              id: itemId, // Use the same ID as the document ID
              ...itemSnap.data(),
            };
            setItem(itemData);
            // Auto-fill the stock category from the item data
            setFormData((prev) => ({
              ...prev,
              stockCategory: itemData.category || "",
            }));
          } else {
            setError("Item not found");
          }
        }
      } catch (err) {
        console.error("Error fetching item:", err);
        setError("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const [formData, setFormData] = useState({
    quantity: 1,
    urgency: "Normal",
    shortNote: "",
    stockCategory: "",
  });

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error("Please log in to create a request");
      }

      // Validate required fields
      if (!item || !formData.quantity || !formData.stockCategory) {
        throw new Error("Missing required fields");
      }

      // Generate ID (RR-00X format)
      const requestsRef = collection(db, "restock_requests");
      const snapshot = await getDocs(requestsRef);
      const count = snapshot.size + 1;
      const requestId = `RR-${count.toString().padStart(3, '0')}`;

      // Create request data
      const requestData = {
        requestId: requestId,
        productId: item.id,
        productName: item.name,
        supplierId: item.supplierId || "",
        category: item.category || "",
        quantity: parseInt(formData.quantity),
        stockCategory: formData.stockCategory,
        urgency: formData.urgency,
        shortNote: formData.shortNote,
        description: formData.shortNote,
        retailerId: auth.currentUser?.uid, // Get retailer ID from auth
        states: "Under Review",
        vendorSupplierId: "", // Will be assigned by supplier
        
        // Timestamps
        dateOfRequest: new Date().toISOString(),
        requested: {
          date: new Date().toISOString(),
          user: "current-user" // Placeholder for user ID
        },
        underReview: {
          date: new Date().toISOString(),
          user: "current-user" // Placeholder for user ID
        },

        // Additional fields
        approved: null,
        price: parseFloat(item.price) || 0,
        currentStock: item.stock || 0,
        image: item.image || null
      };

      // Add to restock_requests collection using setDoc
      const docRef = doc(requestsRef, requestId);
      await setDoc(docRef, requestData);

      toast.success("Restock request created successfully!");
      router.push("/retailer/orders");
    } catch (err) {
      console.error("Error creating request:", err);
      setError(err.message || "Failed to create restock request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading item details...</p>
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

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No item selected</p>
          <button
            onClick={() => router.push("/retailer/browse")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Browse Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Items
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Create Restock Request
                </h1>
                <p className="text-sm text-gray-600">
                  Request restock for {item.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Stock: {item.stock}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Price: ₹{item.price}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Category *
                </label>
                <input
                  type="text"
                  name="stockCategory"
                  value={formData.stockCategory}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter stock category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        quantity: Math.max(1, prev.quantity - 1),
                      }))
                    }
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-l-lg hover:bg-gray-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        quantity: prev.quantity + 1,
                      }))
                    }
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-r-lg hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency *
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Note
                </label>
                <textarea
                  name="shortNote"
                  value={formData.shortNote}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requirements or notes..."
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
