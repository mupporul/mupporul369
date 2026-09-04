import TopAppBar from "./TopAppBar";
import PillTabBar from "./PillTabBar";
import "./Shell.css";

/**
 * Top-level layout shell.
 * Provides a fixed branded header with a pill tab bar and a scrollable content area below.
 *
 * @param {{ tabs: Array<{id:string,label:string,badgeCount?:number}>, activeTab: string, onTabChange: Function, user: Object, onLogout: Function, headerAction?: {label:string,onClick:Function,ariaLabel?:string}, children: import('react').ReactNode }} props
 * @returns {JSX.Element}
 */
export default function Shell({
  tabs,
  activeTab,
  onTabChange,
  user,
  onLogout,
  headerAction,
  children,
}) {
  return (
    <div className="shell">
      <header className="shell__header">
        <TopAppBar user={user} onLogout={onLogout} />
        <div className="shell__tabs-row">
          <PillTabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
          {headerAction && (
            <button
              type="button"
              className="shell__header-action"
              onClick={headerAction.onClick}
              aria-label={headerAction.ariaLabel || headerAction.label}
            >
              <span className="shell__header-action-text">
                {headerAction.label}
              </span>
              <span className="shell__header-action-icon" aria-hidden="true">
                +
              </span>
            </button>
          )}
        </div>
      </header>
      <main className="shell__content">{children}</main>
    </div>
  );
}
