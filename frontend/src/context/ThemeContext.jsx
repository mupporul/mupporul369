import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME, THEMES } from "../constants/themes";

const THEME_STORAGE_KEY = "mupporul369-theme";
const ThemeContext = createContext(null);

/**
 * Theme provider with localStorage persistence.
 * Applies `data-theme` on the root html element.
 *
 * @param {{ children: import('react').ReactNode }} props
 * @returns {JSX.Element}
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = globalThis.localStorage?.getItem(THEME_STORAGE_KEY);
    const isValidTheme = THEMES.some((item) => item.id === saved);
    return isValidTheme ? saved : DEFAULT_THEME;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Returns the active theme and setter from ThemeProvider.
 *
 * @returns {{ theme: string, setTheme: Function, themes: Array<{id:string,labelTa:string,labelEn:string}> }}
 */
export function useTheme() {
  return useContext(ThemeContext);
}
