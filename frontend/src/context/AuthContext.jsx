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
const LEGACY_TOKEN_KEY = "mupporul369.authToken";
const IDLE_TIMEOUT_MS = 20 * 60 * 1000;
const AuthContext = createContext(null);

function readStoredAuth() {
  const raw = globalThis.localStorage?.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    const legacyToken =
      globalThis.localStorage?.getItem(LEGACY_TOKEN_KEY) || "";
    return legacyToken
      ? { token: legacyToken, user: null }
      : { token: "", user: null };
  }

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
    globalThis.localStorage?.removeItem(LEGACY_TOKEN_KEY);
  }, []);

  const normalizeUser = useCallback((candidate) => {
    if (!candidate || typeof candidate !== "object") return null;
    return {
      id: candidate.id || "",
      mobile: candidate.mobile || "",
      initials: candidate.initials || "",
      name: candidate.name || "",
      role: candidate.role || "admin",
    };
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
        const resolvedUser = normalizeUser(payload?.user || payload);
        if (!resolvedUser?.id) {
          clearAuth();
          setIsAuthReady(true);
          return;
        }

        const nextAuth = { token: auth.token, user: resolvedUser };
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
  }, [auth.token, clearAuth, normalizeUser]);

  const login = useCallback(
    async (mobile, password) => {
      const res = await fetch(buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid mobile number or password");
      }

      const payload = await res.json();
      const resolvedUser = normalizeUser(payload?.user || payload);
      const nextAuth = { token: payload.token, user: resolvedUser };
      setAuth(nextAuth);
      globalThis.localStorage?.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(nextAuth),
      );
      globalThis.localStorage?.removeItem(LEGACY_TOKEN_KEY);
    },
    [normalizeUser],
  );

  const changePassword = useCallback(async (mobile, oldPassword, newPassword) => {
    const res = await fetch(buildApiUrl("/api/auth/change-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, oldPassword, newPassword }),
    });

    if (!res.ok) {
      throw new Error("Invalid mobile number or old password");
    }
  }, []);

  const logout = useCallback(async () => {
    const currentToken = auth.token;
    if (currentToken) {
      try {
        await fetch(buildApiUrl("/api/auth/logout"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
      } catch {
        // Ignore logout request failures and still clear local auth state.
      }
    }

    clearAuth();
  }, [auth.token, clearAuth]);

  useEffect(() => {
    if (!auth.token) return undefined;

    let timeoutId = null;
    const resetTimer = () => {
      if (timeoutId) {
        globalThis.clearTimeout(timeoutId);
      }
      timeoutId = globalThis.setTimeout(() => {
        logout();
      }, IDLE_TIMEOUT_MS);
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const listener = () => resetTimer();
    activityEvents.forEach((eventName) => {
      globalThis.addEventListener(eventName, listener, { passive: true });
    });
    resetTimer();

    return () => {
      if (timeoutId) {
        globalThis.clearTimeout(timeoutId);
      }
      activityEvents.forEach((eventName) => {
        globalThis.removeEventListener(eventName, listener);
      });
    };
  }, [auth.token, logout]);

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
      changePassword,
      logout,
      authFetch,
    }),
    [
      auth.user,
      auth.token,
      isAuthReady,
      login,
      changePassword,
      logout,
      authFetch,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Returns auth state and auth actions.
 *
 * @returns {{ user: Object|null, token: string, isAuthReady: boolean, login: Function, changePassword: Function, logout: Function, authFetch: Function }}
 */
export function useAuth() {
  return useContext(AuthContext);
}
