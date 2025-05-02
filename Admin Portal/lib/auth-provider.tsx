"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("AuthProvider: Setting up onAuthStateChanged...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("AuthProvider: User is authenticated:", user.uid);
        setUser(user);
        setLoading(false);
      } else {
        console.log("AuthProvider: No user found");
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      console.log("AuthProvider: Cleaning up onAuthStateChanged...");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (
      !loading &&
      !user &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register" &&
      window.location.pathname !== "/register/company" // Add this route
    ) {
      const timeout = setTimeout(() => {
        console.log("AuthProvider: Redirecting to login...");
        router.push("/login");
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [loading, user, router]);

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}