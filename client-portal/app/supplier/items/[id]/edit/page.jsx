"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Save,
  X,
  IndianRupee,
  Boxes,
  Tag,
  FileText,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EditItemPage({ params }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    itemId: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    minStock: "",
    unitOfMeasure: "",
    manufacturingDate: "",
    specialInstructions: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Electronics",
    "Furniture",
    "Office Supplies",
    "Accessories",
  ];

  useEffect(() => {
    fetchItem();
  }, [params.id]);

  const fetchItem = async () => {
    try {
      const docRef = doc(db, "items", params.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          ...data,
          price: data.price.toString(),
          stock: data.stock.toString(),
          minStock: data.minStock.toString(),
        });
      } else {
        console.log("No such document!");
        router.push("/supplier/items");
      }
    } catch (error) {
      console.error("Error fetching item:", error);
      alert("Failed to fetch item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert price and stock to numbers
      const itemData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        status:
          Number(formData.stock) <= Number(formData.minStock)
            ? "Low Stock"
            : "In Stock",
        updatedAt: new Date().toISOString(),
      };

      // Update the item in Firestore
      const docRef = doc(db, "items", params.id);
      await updateDoc(docRef, itemData);

      // Redirect to items page
      router.push("/supplier/items");
    } catch (error) {
      console.error("Error updating item: ", error);
      alert("Failed to update item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading item...</p>
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/supplier/items")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Edit Item
                </h1>
                <p className="text-sm text-gray-600">Update item information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/supplier/items")}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-800">
                    Basic Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Item ID
                    </label>
                    <input
                      type="text"
                      name="itemId"
                      value={formData.itemId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      placeholder="Enter Item ID (ITM-___)"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Unit of Measure
                    </label>
                    <select
                      name="unitOfMeasure"
                      value={formData.unitOfMeasure}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow"
                      required
                    >
                      <option value="">Select unit</option>
                      <option value="pieces">Pieces</option>
                      <option value="boxes">Boxes</option>
                      <option value="kg">Kilograms</option>
                      <option value="l">Liters</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      placeholder="Enter item description"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing and Stock */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-800">
                    Pricing and Stock
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Stock Quantity
                    </label>
                    <div className="relative">
                      <Boxes className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Stock Level
                    </label>
                    <div className="relative">
                      <AlertCircle className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="minStock"
                        value={formData.minStock}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-800">
                    Additional Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Manufacturing Date
                    </label>
                    <input
                      type="date"
                      name="manufacturingDate"
                      value={formData.manufacturingDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Special Handling Instructions
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      placeholder="E.g., Fragile, Keep Refrigerated"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-8">
            {/* Preview Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-800">
                    Item Preview
                  </h2>
                </div>
                <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg mb-4">
                  <div className="flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">
                    {formData.name || "Item Name"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formData.description ||
                      "Item description will appear here"}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="font-medium text-gray-900">
                      ₹{Number(formData.price || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Stock</span>
                    <span className="font-medium text-gray-900">
                      {formData.stock || 0} units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
