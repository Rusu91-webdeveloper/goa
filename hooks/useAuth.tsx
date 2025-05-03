import { useState, useEffect, useCallback } from "react";

interface User {
  _id: string;
  email: string;
  name?: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/profile", {
        // Add cache control to prevent browser caching
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        // Add cache control to prevent browser caching
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      const data = await response.json();

      if (data.success) {
        setUser(null);
        // Force a hard refresh to ensure all state is cleared
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    logout,
    refreshAuth: checkAuth,
  };
}
