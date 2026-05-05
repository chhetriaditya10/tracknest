import React, { useEffect, createContext, useContext, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const authContext = createContext();
const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  const login = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if (res.data.success) {
          setUser(res.data.user);
          setToken(storedToken);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, []);

  return (
    <authContext.Provider
      value={{ user, token, login, logout, setUser, loading }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => useContext(authContext);
export default ContextProvider;
