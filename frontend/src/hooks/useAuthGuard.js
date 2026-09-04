import { useAuth } from "../context/AuthContext";

/**
 * Returns the derived access state for protected application content.
 *
 * @returns {{isReady: boolean, isAllowed: boolean}} Guard state.
 */
export function useAuthGuard() {
  const { status, isAuthenticated } = useAuth();

  return {
    isReady: status !== "bootstrapping" && status !== "loading",
    isAllowed: isAuthenticated,
  };
}
