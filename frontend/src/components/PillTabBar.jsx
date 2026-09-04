import PropTypes from "prop-types";

import "./PillTabBar.css";

/**
 * Pill-style tab switcher.
 *
 * @param {object} props - Component props.
 * @param {Array<{id: string, label: string}>} props.tabs - Tabs.
 * @param {string} props.activeTab - Selected tab id.
 * @param {Function} props.onTabChange - Selection callback.
 * @returns {JSX.Element} Tab bar.
 */
export default function PillTabBar({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="pill-tab-bar" aria-label="Primary navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`pill-tab-bar__tab${activeTab === tab.id ? " pill-tab-bar__tab--active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

PillTabBar.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};
