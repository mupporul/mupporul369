import { createContext, useContext, useState } from "react";
import STRINGS from "../constants/strings";

const LangContext = createContext(null);

/**
 * Provides the current language and a toggle function to the component tree.
 *
 * @param {{ children: import('react').ReactNode }} props
 * @returns {JSX.Element}
 */
export function LangProvider({ children }) {
  const [lang, setLangState] = useState("ta");
  const t = STRINGS[lang];
  const toggle = () => setLangState((l) => (l === "ta" ? "en" : "ta"));
  const setLang = (nextLang) => {
    if (nextLang === "ta" || nextLang === "en") {
      setLangState(nextLang);
    }
  };
  return (
    <LangContext.Provider value={{ lang, t, toggle, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

/**
 * Returns { lang, t, toggle, setLang } from the nearest LangProvider.
 * `t` is the strings object for the current language.
 *
 * @returns {{ lang: string, t: Object, toggle: Function, setLang: Function }}
 */
export function useLang() {
  return useContext(LangContext);
}
