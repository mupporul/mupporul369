import { useEffect, useRef, useState } from "react";
import { useLang } from "../context/LangContext";
import { useTheme } from "../context/ThemeContext";
import InlineSpinner from "./InlineSpinner";
import "./TopAppBar.css";

const USER_PREFS_KEY = "mupporul369-user-prefs";

function readUserPrefs() {
  const raw = globalThis.localStorage?.getItem(USER_PREFS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Fixed top app bar with brand name and EN/த language toggle.
 *
 * @param {{ user: {initials:string,role:string}, onLogout: Function }} props
 * @returns {JSX.Element}
 */
export default function TopAppBar({ user, onLogout }) {
  const { t, lang, setLang } = useLang();
  const { theme, setTheme, themes } = useTheme();
  const accountMenuRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const displayName = user.name || user.initials || "-";

  useEffect(() => {
    function handleOutsidePointerDown(event) {
      const menu = accountMenuRef.current;
      if (!menu || !menu.hasAttribute("open")) return;
      if (!menu.contains(event.target)) {
        menu.removeAttribute("open");
      }
    }

    function handleEscape(event) {
      if (event.key !== "Escape") return;
      const menu = accountMenuRef.current;
      if (menu?.hasAttribute("open")) {
        menu.removeAttribute("open");
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!user.mobile) {
      setLang("en");
      return;
    }
    const prefs = readUserPrefs();
    const preferredLang = prefs[user.mobile]?.lang;
    if (preferredLang === "ta" || preferredLang === "en") {
      setLang(preferredLang);
    }
  }, [user.mobile, setLang]);

  function setPreferredLanguage(nextLang) {
    setLang(nextLang);
    const prefs = readUserPrefs();
    prefs[user.mobile] = {
      ...(prefs[user.mobile] || {}),
      lang: nextLang,
    };
    globalThis.localStorage?.setItem(USER_PREFS_KEY, JSON.stringify(prefs));
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="top-app-bar">
      <div className="top-app-bar__brand-wrap" aria-label="Brand">
        <span className="top-app-bar__brand-word">
          {lang === "ta" ? "முப்பொருள்" : "MUPPORUL"}
        </span>
        <span className="top-app-bar__brand-emblem" aria-hidden="true">
          <svg viewBox="0 0 48 108" className="top-app-bar__brand-emblem-svg">
            <defs>
              <linearGradient
                id="goldGradientSpear"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#ffe98e" />
                <stop offset="50%" stopColor="#f6c733" />
                <stop offset="100%" stopColor="#c88717" />
              </linearGradient>
              <linearGradient id="goldStemSpear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f8cf49" />
                <stop offset="100%" stopColor="#ba7b14" />
              </linearGradient>
            </defs>
            <path
              d="M24 4 C14.4 17, 8.9 25, 8.9 36 C8.9 48.2, 15.9 55, 24 55 C32.1 55, 39.1 48.2, 39.1 36 C39.1 25, 33.6 17, 24 4 Z"
              fill="url(#goldGradientSpear)"
              stroke="#d59b21"
              strokeWidth="1.8"
            />
            <rect
              x="22.2"
              y="66"
              width="3.6"
              height="30"
              rx="1.8"
              fill="url(#goldStemSpear)"
            />
            <path
              d="M14.8 30 H33.2 M15.8 34.3 H32.2 M16.8 38.6 H31.2"
              stroke="#fff7d1"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle
              cx="24"
              cy="34.4"
              r="2.6"
              fill="#ba2226"
              stroke="#f6d579"
              strokeWidth="1.1"
            />
            <path
              d="M20 55 C20 58, 17.7 59.7, 17.7 61.9 C17.7 64.3, 20.2 66.3, 24 66.3 C27.8 66.3, 30.3 64.3, 30.3 61.9 C30.3 59.7, 28 58, 28 55"
              fill="url(#goldStemSpear)"
              stroke="#d59b21"
              strokeWidth="1"
            />
            <rect
              x="17.3"
              y="96"
              width="13.4"
              height="4.5"
              rx="2.2"
              fill="url(#goldStemSpear)"
              stroke="#d59b21"
              strokeWidth="0.8"
            />
            <rect
              x="14.7"
              y="100.5"
              width="18.6"
              height="5.5"
              rx="2.7"
              fill="url(#goldStemSpear)"
              stroke="#d59b21"
              strokeWidth="0.8"
            />
          </svg>
        </span>
        <span className="top-app-bar__brand-number">369</span>
      </div>
      <div className="top-app-bar__controls">
        <label className="top-app-bar__theme-wrap">
          <select
            className="top-app-bar__theme-select"
            aria-label={t.themeAriaLabel}
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            {themes.map((item) => (
              <option key={item.id} value={item.id}>
                {lang === "ta" ? item.labelTa : item.labelEn}
              </option>
            ))}
          </select>
        </label>
        <details className="top-app-bar__account-menu" ref={accountMenuRef}>
          <summary
            className="top-app-bar__account-trigger"
            aria-label="Account menu"
          >
            <span className="top-app-bar__account-initials">
              {user.initials}
            </span>
          </summary>
          <div className="top-app-bar__account-panel">
            <button
              className="top-app-bar__menu-link"
              onClick={() => setProfileOpen((prev) => !prev)}
            >
              {t.viewProfileLabel}
            </button>

            {profileOpen && (
              <div className="top-app-bar__profile-card">
                <p className="top-app-bar__account-id">
                  {user.initials} · {user.role}
                </p>
                <p className="top-app-bar__profile-name">{displayName}</p>
                <p className="top-app-bar__profile-line">
                  {t.profileNameLabel}: {displayName}
                </p>
                <p className="top-app-bar__profile-line">
                  {t.profileMobileLabel}: {user.mobile}
                </p>
                <p className="top-app-bar__profile-line">
                  {t.profileRoleLabel}: {user.role}
                </p>
              </div>
            )}

            <div className="top-app-bar__lang-pref">
              <p className="top-app-bar__lang-pref-label">
                {t.languagePrefLabel}
              </p>
              <div className="top-app-bar__lang-pref-actions">
                <button
                  className={`top-app-bar__lang-pref-btn${lang === "ta" ? " top-app-bar__lang-pref-btn--active" : ""}`}
                  onClick={() => setPreferredLanguage("ta")}
                >
                  {t.languageTamilLabel}
                </button>
                <button
                  className={`top-app-bar__lang-pref-btn${lang === "en" ? " top-app-bar__lang-pref-btn--active" : ""}`}
                  onClick={() => setPreferredLanguage("en")}
                >
                  {t.languageEnglishLabel}
                </button>
              </div>
            </div>

            <button
              className={`top-app-bar__logout api-loading-button${
                loggingOut ? " is-loading" : ""
              }`}
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <InlineSpinner label={t.loading} />
              ) : (
                t.logoutLabel
              )}
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}
