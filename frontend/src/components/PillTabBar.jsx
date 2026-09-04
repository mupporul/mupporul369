import { useLang } from "../context/LangContext";
import "./PillTabBar.css";

function getCompactLabel(tabId, lang, fallbackLabel) {
  const compact = {
    en: {
      temples: "Temple",
      quiz: "Quiz",
      review: "Review",
      users: "Users",
    },
    ta: {
      temples: "கோவில்",
      quiz: "வினா",
      review: "பரிசீ",
      users: "பயனர்",
    },
  };

  return compact[lang]?.[tabId] || fallbackLabel;
}

/**
 * Horizontally scrollable pill-style tab navigation bar.
 *
 * @param {{ tabs: Array<{id:string,label:string,badgeCount?:number}>, activeTab: string, onTabChange: Function }} props
 * @returns {JSX.Element}
 */
export default function PillTabBar({ tabs, activeTab, onTabChange }) {
  const { t, lang } = useLang();
  return (
    <nav className="pill-tab-bar" aria-label={t.navAriaLabel}>
      <div className="pill-tab-bar__scroll">
        {tabs.map((tab) => {
          const compactLabel = getCompactLabel(tab.id, lang, tab.label);

          return (
            <button
              key={tab.id}
              className={`pill-tab-bar__tab${activeTab === tab.id ? " pill-tab-bar__tab--active" : ""}`}
              onClick={() => onTabChange(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              aria-label={tab.label}
            >
              <span className="pill-tab-bar__text">{compactLabel}</span>
              {tab.badgeCount > 0 && (
                <span
                  className="pill-tab-bar__badge"
                  aria-label={`${tab.badgeCount}`}
                >
                  {tab.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
