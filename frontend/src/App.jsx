import { useEffect, useState } from "react";
import { buildApiUrl } from "./utils/apiUrl";
import { LangProvider } from "./context/LangContext";
import { useLang } from "./context/LangContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Shell from "./components/Shell";
import TempleTab from "./pages/TempleTab";
import ReviewTab from "./pages/ReviewTab";
import UsersTab from "./pages/UsersTab";
import QuizTab from "./pages/QuizTab";
import LoginPage from "./pages/LoginPage";
import useTemples from "./hooks/useTemples";
import useReviews from "./hooks/useReviews";
import "./index.css";
import "./pages/TempleTab.css";
import "./pages/ReviewTab.css";
import "./pages/QuizTab.css";
import "./pages/LoginPage.css";

const BACKEND_KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000;
const BACKEND_KEEP_ALIVE_TIMEOUT_MS = 8 * 1000;

function pingBackend() {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    BACKEND_KEEP_ALIVE_TIMEOUT_MS,
  );

  fetch(buildApiUrl("/health"), {
    signal: controller.signal,
    cache: "no-store",
  })
    .catch(() => {})
    .finally(() => globalThis.clearTimeout(timeoutId));
}

function BackendKeepAlive() {
  useEffect(() => {
    const pingIfVisible = () => {
      if (document.visibilityState === "visible") {
        pingBackend();
      }
    };

    pingIfVisible();
    const intervalId = globalThis.setInterval(
      pingIfVisible,
      BACKEND_KEEP_ALIVE_INTERVAL_MS,
    );
    document.addEventListener("visibilitychange", pingIfVisible);

    return () => {
      globalThis.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", pingIfVisible);
    };
  }, []);

  return null;
}

function AuthenticatedApp({ user, logout }) {
  const { t } = useLang();
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState("temples");
  const [addTempleClickCount, setAddTempleClickCount] = useState(0);
  const [contributorInitials, setContributorInitials] = useState([]);

  const { temples, loading, error, fetchTemples } = useTemples(authFetch);
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    fetchReviews,
    approveReview,
  } = useReviews(authFetch);

  const isAdmin = user.role === "admin";
  const canContribute = user.role === "contributor" || isAdmin;
  const reviewCount = reviews.length;

  useEffect(() => {
    async function loadContributorInitials() {
      if (!canContribute) {
        setContributorInitials([]);
        return;
      }

      try {
        const response = await authFetch("/api/users/contributors");
        if (!response.ok) {
          setContributorInitials([]);
          return;
        }

        const users = await response.json();
        const initials = Array.isArray(users)
          ? users
              .map((entry) => String(entry?.initials || "").trim())
              .filter(Boolean)
          : [];

        setContributorInitials(initials);
      } catch {
        setContributorInitials([]);
      }
    }

    loadContributorInitials();
  }, [authFetch, canContribute]);

  const TABS = [
    { id: "temples", label: t.tabTemples },
    { id: "quiz", label: t.tabQuiz },
    ...(canContribute
      ? [{ id: "review", label: t.tabReview, badgeCount: reviewCount }]
      : []),
    ...(isAdmin ? [{ id: "users", label: t.tabUsers }] : []),
  ];

  async function handleProposalQueued() {
    await fetchReviews();
  }

  function handleAddTempleRequestConsumed() {
    setAddTempleClickCount(0);
  }

  async function handleApprove(reviewId) {
    const payload = await approveReview(reviewId);
    if (payload.applied) {
      await fetchTemples();
    }
  }

  async function queueTempleCreate(payload) {
    const response = await authFetch("/api/temples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Create failed (${response.status})`);
    }
    return response.json();
  }

  async function queueTempleEdit(templeId, payload) {
    const response = await authFetch(`/api/temples/${templeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Update failed (${response.status})`);
    }
    return response.json();
  }

  async function handleTempleCreate(payload) {
    const result = await queueTempleCreate(payload);
    await fetchReviews();
    setActiveTab("review");
    return result;
  }

  async function handleTempleEdit(templeId, payload) {
    const result = await queueTempleEdit(templeId, payload);
    if (!result?.noChanges) {
      await fetchReviews();
      setActiveTab("review");
    }
    return result;
  }

  async function handleDelete(reviewId) {
    try {
      const response = await authFetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Auth error - user will be logged out by authFetch
          return;
        }
        throw new Error(`Delete failed (${response.status})`);
      }
      // Refresh the reviews list after successful delete
      await fetchReviews();
    } catch (err) {
      // If 401/403, authFetch already cleared auth or error was thrown
      // Otherwise error will be caught but not shown (UI handles retry via modal)
    }
  }

  async function handleReviewEdit(reviewId, payload) {
    const response = await authFetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Review update failed (${response.status})`);
    }
    await fetchReviews();
    return response.json();
  }

  return (
    <Shell
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={user}
      onLogout={logout}
      headerAction={
        activeTab === "temples" && canContribute
          ? {
              label: t.addTempleBtn,
              onClick: () => setAddTempleClickCount((count) => count + 1),
            }
          : null
      }
    >
      {activeTab === "temples" && (
        <TempleTab
          temples={temples}
          loading={loading}
          error={error}
          canContribute={canContribute}
          addTempleClickCount={addTempleClickCount}
          onAddTempleRequestConsumed={handleAddTempleRequestConsumed}
          onCreate={handleTempleCreate}
          onPatch={handleTempleEdit}
          onProposalQueued={handleProposalQueued}
        />
      )}
      {activeTab === "review" && (
        <ReviewTab
          reviews={reviews}
          loading={reviewsLoading}
          error={reviewsError}
          currentUser={user}
          contributorInitials={contributorInitials}
          onApprove={handleApprove}
          onEdit={handleReviewEdit}
          onDelete={handleDelete}
        />
      )}
      {activeTab === "quiz" && (
        <QuizTab temples={temples} loading={loading} error={error} />
      )}
      {activeTab === "users" && isAdmin && <UsersTab authFetch={authFetch} />}
    </Shell>
  );
}

/**
 * Inner app — reads lang context so tab labels are reactive.
 *
 * @returns {JSX.Element}
 */
function AppInner() {
  const { user, logout, isAuthReady } = useAuth();
  if (!isAuthReady) return null;
  if (!user) return <LoginPage />;
  return <AuthenticatedApp user={user} logout={logout} />;
}

/**
 * Application root for MupporuL369.
 *
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <BackendKeepAlive />
          <AppInner />
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
