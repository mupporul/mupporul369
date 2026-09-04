import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { STORAGE_KEYS, THEME_OPTIONS } from "../utils/constants";

const ThemeContext = createContext(null);

/**
 * Provides theme state and applies the selected theme to the document root.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Descendant elements.
 * @returns {JSX.Element} Context provider.
 */
export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem(STORAGE_KEYS.theme) || THEME_OPTIONS[0].id,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    localStorage.setItem(STORAGE_KEYS.theme, themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider
      value={{ themeId, setThemeId, themes: THEME_OPTIONS }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Reads the current theme context.
 *
 * @returns {{themeId: string, setThemeId: Function, themes: Array}} Theme context value.
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
