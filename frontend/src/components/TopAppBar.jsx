import PropTypes from "prop-types";

import { useLang } from "../context/LangContext";
import { useTheme } from "../context/ThemeContext";
import "./TopAppBar.css";

/**
 * Top application bar with language and theme controls.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - Display title.
 * @param {Function} props.onLogout - Logout callback.
 * @returns {JSX.Element} Top app bar.
 */
export default function TopAppBar({ title, onLogout }) {
  const { language, setLanguage } = useLang();
  const { themeId, setThemeId, themes } = useTheme();

  return (
    <header className="top-bar app-shell">
      <h1 className="top-bar__title">{title}</h1>
      <div className="top-bar__controls">
        <select
          className="select"
          value={themeId}
          aria-label="Theme"
          onChange={(event) => setThemeId(event.target.value)}
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="ghost-button"
          onClick={() => setLanguage(language === "en" ? "ta" : "en")}
        >
          {language === "en" ? "TA" : "EN"}
        </button>
        <button type="button" className="danger-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

TopAppBar.propTypes = {
  title: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
};
