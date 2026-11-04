import React from "react";
import { api } from "../lib/api.js";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const loadUser = React.useCallback(async () => {
    try {
      const data = await api("/auth/me");
      setUser(data.user);
      return data.user;
    } catch {
      try {
        await api("/auth/refresh", { method: "POST" });
        const data = await api("/auth/me");
        setUser(data.user);
        return data.user;
      } catch {
        setUser(null);
        return null;
      }
    }
  }, []);

  React.useEffect(() => {
    loadUser().finally(() => setLoading(false));
  }, [loadUser]);

  const login = async (email, password) => {
    const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api("/auth/register", { method: "POST", body: JSON.stringify(payload) });
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async (credential) => {
    const data = await api("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const data = await api("/auth/me", { method: "PUT", body: JSON.stringify(payload) });
    setUser(data.user);
    return data.user;
  };

  const hasRole = (...roles) => !!user && roles.some((role) => user.roles.includes(role));

  const value = { user, loading, login, register, loginWithGoogle, logout, updateProfile, reload: loadUser, hasRole };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return ctx;
}
