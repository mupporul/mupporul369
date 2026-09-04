import { useMemo, useState } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { LangProvider, useLang } from "./context/LangContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuthGuard } from "./hooks/useAuthGuard";
import { PAGE_OPTIONS } from "./utils/constants";
import Shell from "./components/Shell";
import LoginPage from "./pages/LoginPage";
import TemplesPage from "./pages/TemplesPage";
import ReviewsPage from "./pages/ReviewsPage";
import UsersPage from "./pages/UsersPage";

/**
 * Renders the authenticated app shell with page tabs.
 *
 * @returns {JSX.Element} Authenticated content.
 */
export function AppAuthed() {
  const { logout } = useAuth();
  const { copy } = useLang();
  const [activePage, setActivePage] = useState("temples");

  const tabs = useMemo(
    () => [
      { id: "temples", label: copy.temples },
      { id: "reviews", label: copy.reviews },
      { id: "users", label: copy.users },
    ],
    [copy],
  );

  return (
    <Shell
      title={copy.appName}
      tabs={tabs}
      activeTab={activePage}
      onTabChange={setActivePage}
      onLogout={logout}
    >
      {activePage === PAGE_OPTIONS[0].id && <TemplesPage />}
      {activePage === PAGE_OPTIONS[1].id && <ReviewsPage />}
      {activePage === PAGE_OPTIONS[2].id && <UsersPage />}
    </Shell>
  );
}

/**
 * Handles auth bootstrap and route-level gating.
 *
 * @returns {JSX.Element} App body.
 */
export function AppGate() {
  const { status } = useAuth();
  const { isReady, isAllowed } = useAuthGuard();

  if (!isReady) {
    return (
      <main className="app-shell fade-in status-text">
        Bootstrapping session...
      </main>
    );
  }

  if (!isAllowed || status === "anonymous") {
    return <LoginPage />;
  }

  return <AppAuthed />;
}

/**
 * Main frontend application component.
 *
 * @returns {JSX.Element} Provider tree and app content.
 */
export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <AppGate />
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
