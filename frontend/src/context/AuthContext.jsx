import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { buildApiUrl } from "../utils/apiUrl";
import { STORAGE_KEYS } from "../utils/constants";

const AuthContext = createContext(null);

const readJsonSafely = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

/**
 * Provides authentication state, token bootstrap, and authorized fetch access.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Descendant elements.
 * @returns {JSX.Element} Context provider.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(STORAGE_KEYS.authToken) || "",
  );
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("bootstrapping");
  const [error, setError] = useState("");

  const clearAuth = () => {
    localStorage.removeItem(STORAGE_KEYS.authToken);
    setToken("");
    setUser(null);
    setStatus("anonymous");
  };

  const validateToken = async (currentToken) => {
    const response = await fetch(buildApiUrl("/api/auth/me"), {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (response.status === 401) {
      clearAuth();
      return;
    }

    if (!response.ok) {
      throw new Error("Unable to validate session.");
    }

    const data = await readJsonSafely(response);
    setUser(data);
    setStatus("authenticated");
  };

  useEffect(() => {
    let ignore = false;

    const bootstrapAuth = async () => {
      if (!token) {
        setStatus("anonymous");
        return;
      }

      try {
        await validateToken(token);
      } catch (authError) {
        if (!ignore) {
          setError(authError.message);
          clearAuth();
        }
      }
    };

    bootstrapAuth();

    return () => {
      ignore = true;
    };
  }, [token]);

  const login = async (mobile, password) => {
    setStatus("loading");
    setError("");

    const response = await fetch(buildApiUrl("/api/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mobile, password }),
    });

    const data = await readJsonSafely(response);

    if (!response.ok) {
      setStatus("anonymous");
      throw new Error(data?.message || "Login failed.");
    }

    const nextToken = data?.token || data?.accessToken || "";
    localStorage.setItem(STORAGE_KEYS.authToken, nextToken);
    setToken(nextToken);
    setUser(data?.user || data?.profile || null);
    setStatus("authenticated");
    return data;
  };

  const logout = () => {
    setError("");
    clearAuth();
  };

  const authFetch = async (path, options = {}) => {
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(buildApiUrl(path), {
      ...options,
      headers,
    });

    if (response.status === 401) {
      clearAuth();
      throw new Error("Unauthorized");
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        status,
        error,
        isAuthenticated: status === "authenticated" && Boolean(token),
        login,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Reads the authentication context.
 *
 * @returns {object} Authentication state and actions.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
