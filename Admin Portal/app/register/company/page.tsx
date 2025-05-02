"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const companySchema = z.object({
  companyName: z.string().min(2, { message: "Company name is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  taxId: z.string().min(3, { message: "Tax ID is required" }),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function CompanyRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get query parameters
  const username = searchParams.get("username") || "";
  const email = searchParams.get("email") || "";
  const password = searchParams.get("password") || "";
  const isGoogleUser = searchParams.get("isGoogleUser") === "true";

  // Validate that email is present
  if (!email) {
    setError("Email is missing. Please go back and try again.");
  }

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      address: "",
      taxId: "",
    },
  });

  const onSubmit = async (formData: CompanyFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      let idToken;
      let userUid;

      if (!isGoogleUser) {
        // Create user in Firebase Authentication (for email/password users)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        userUid = user.uid; // Store the UID before signing out
        idToken = await user.getIdToken();

        // Sign out the user immediately after creation
        await signOut(auth);
      } else {
        // For Google users, the user is already authenticated
        const user = auth.currentUser;
        if (!user) throw new Error("No authenticated user found");
        userUid = user.uid; // Store the UID
        idToken = await user.getIdToken();
      }

      // Save profile data to the server
      const response = await fetch("http://localhost:4000/api/map-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: userUid, // Use the stored UID
          email,
          companyName: formData.companyName,
          address: formData.address,
          taxId: formData.taxId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save profile data");
      }

      // Show confirmation toast
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please log in to continue.",
      });

      // Redirect to login page
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Package2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Company Information</CardTitle>
          <CardDescription>Enter your company details to complete registration</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tax ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Completing..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}