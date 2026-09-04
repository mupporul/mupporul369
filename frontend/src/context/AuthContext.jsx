import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { buildApiUrl } from "../utils/apiUrl";

const AUTH_STORAGE_KEY = "mupporul369-auth";
const AuthContext = createContext(null);

function readStoredAuth() {
  const raw = globalThis.localStorage?.getItem(AUTH_STORAGE_KEY);
  if (!raw) return { token: "", user: null };

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.user) return { token: "", user: null };
    return parsed;
  } catch {
    return { token: "", user: null };
  }
}

/**
 * Auth provider for login/logout and authenticated fetch calls.
 *
 * @param {{ children: import('react').ReactNode }} props
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const clearAuth = useCallback(() => {
    setAuth({ token: "", user: null });
    globalThis.localStorage?.removeItem(AUTH_STORAGE_KEY);
  }, []);

  useEffect(() => {
    async function validateSession() {
      if (!auth.token) {
        setIsAuthReady(true);
        return;
      }

      try {
        const res = await fetch(buildApiUrl("/api/auth/me"), {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        if (!res.ok) {
          clearAuth();
          setIsAuthReady(true);
          return;
        }

        const payload = await res.json();
        if (!payload?.user) {
          clearAuth();
          setIsAuthReady(true);
          return;
        }

        const nextAuth = { token: auth.token, user: payload.user };
        setAuth(nextAuth);
        globalThis.localStorage?.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify(nextAuth),
        );
      } catch {
        clearAuth();
      } finally {
        setIsAuthReady(true);
      }
    }

    validateSession();
  }, [auth.token, clearAuth]);

  const login = useCallback(async (mobile, password) => {
    const res = await fetch(buildApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, password }),
    });

    if (!res.ok) {
      throw new Error("Invalid mobile number or password");
    }

    const payload = await res.json();
    const nextAuth = { token: payload.token, user: payload.user };
    setAuth(nextAuth);
    globalThis.localStorage?.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(nextAuth),
    );
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        ...(options.headers || {}),
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      };
      const res = await fetch(buildApiUrl(url), { ...options, headers });
      if (res.status === 401) {
        clearAuth();
        throw new Error("Session expired. Please login again");
      }
      return res;
    },
    [auth.token, clearAuth],
  );

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      isAuthReady,
      login,
      logout,
      authFetch,
    }),
    [auth.user, auth.token, isAuthReady, login, logout, authFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Returns auth state and auth actions.
 *
 * @returns {{ user: Object|null, token: string, isAuthReady: boolean, login: Function, logout: Function, authFetch: Function }}
 */
export function useAuth() {
  return useContext(AuthContext);
}
