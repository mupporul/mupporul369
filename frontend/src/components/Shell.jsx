import PropTypes from "prop-types";

import TopAppBar from "./TopAppBar";
import PillTabBar from "./PillTabBar";
import "./Shell.css";

/**
 * App layout shell containing header, tabs, and page content.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - App title.
 * @param {Array<{id: string, label: string}>} props.tabs - Tab definitions.
 * @param {string} props.activeTab - Active tab id.
 * @param {Function} props.onTabChange - Active tab change callback.
 * @param {Function} props.onLogout - Logout action callback.
 * @param {React.ReactNode} props.children - Page content.
 * @returns {JSX.Element} Shell component.
 */
export default function Shell({
  title,
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  children,
}) {
  return (
    <div className="shell fade-in">
      <TopAppBar title={title} onLogout={onLogout} />
      <div className="shell__tabs surface-card">
        <PillTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </div>
      <main className="shell__content app-shell">{children}</main>
    </div>
  );
}

Shell.propTypes = {
  title: PropTypes.string.isRequired,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
