"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, MinusIcon, TrashIcon } from "@radix-ui/react-icons";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PlaceOrder() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log("Fetching products from Firestore...");
        const productsRef = collection(db, "items");
        const snapshot = await getDocs(productsRef);
        console.log("Firestore snapshot:", snapshot);

        const productsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Document data:", data);
          return {
            id: doc.id,
            ...data,
          };
        });

        console.log("Processed products data:", productsData);
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) return null;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    try {
      setIsSubmitting(true);

      // Create order data
      const orderData = {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          supplier: item.supplier,
        })),
        total: calculateTotal(),
        status: "Pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add order to Firestore
      const docRef = await addDoc(collection(db, "requests"), orderData);

      // Show success notification
      toast.success("Order placed successfully!", {
        duration: 2000,
      });

      // Clear cart and redirect to browse page after a short delay
      setCart([]);
      setTimeout(() => {
        router.push("/retailer/browse");
      }, 2000);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Place Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search Section */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <Input
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Supplier: {product.supplier}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Category: {product.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Price: ₹{product.price}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Available Stock: {product.stock}
                      </p>
                      <Button
                        onClick={() => addToCart(product)}
                        className="w-full"
                        disabled={product.stock <= 0}
                      >
                        {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handlePlaceOrder}
                    disabled={cart.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
