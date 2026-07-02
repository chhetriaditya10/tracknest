import React, { useEffect, createContext, useContext, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000";
const authContext = createContext();

const readStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.error("Failed to parse stored user", error);
    return null;
  }
};

const persistAuth = (authUser, authToken) => {
  if (authUser && authToken) {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(authUser));
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));

  const login = (userData, authToken) => {
    const normalizedUser = {
      ...(userData || {}),
      role: userData?.role || "free",
      isAdmin: Boolean(userData?.isAdmin),
    };

    setUser(normalizedUser);
    setToken(authToken);
    persistAuth(normalizedUser, authToken);
  };

  const logout = () => {
    try {
      persistAuth(null, null);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchSubscriptionStatus = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/checkout/subscription-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser((prev) => {
        const next = { ...(prev || {}), ...res.data };
        persistAuth(next, token);
        return next;
      });
    } catch (error) {
      console.log("Failed to fetch subscription status:", error.message);
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = readStoredUser();

      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await axios.get(`${BASE_URL}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.data?.success && res.data.user) {
          const verifiedUser = {
            ...(res.data.user || {}),
            role: res.data.user?.role || storedUser?.role || "free",
            isAdmin: Boolean(res.data.user?.isAdmin ?? storedUser?.isAdmin),
          };
          setUser(verifiedUser);
          setToken(storedToken);
          persistAuth(verifiedUser, storedToken);
          await fetchSubscriptionStatus();
        } else {
          setUser(null);
          setToken(null);
          persistAuth(null, null);
        }
      } catch (error) {
        const status = error?.response?.status;

        if (status === 401 || status === 403) {
          setUser(null);
          setToken(null);
          persistAuth(null, null);
        } else if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);
          persistAuth(storedUser, storedToken);
        } else {
          setUser(null);
          setToken(null);
          persistAuth(null, null);
        }
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  return (
    <authContext.Provider
      value={{ user, token, login, logout, setUser, loading, fetchSubscriptionStatus }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => useContext(authContext);
export default ContextProvider;
