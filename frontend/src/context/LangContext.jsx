import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { STORAGE_KEYS } from "../utils/constants";

const COPY = {
  en: {
    appName: "Mupporul 369",
    temples: "Temples",
    reviews: "Reviews",
    users: "Users",
    logout: "Logout",
    login: "Login",
  },
  ta: {
    appName: "முப்பொருள் 369",
    temples: "கோவில்கள்",
    reviews: "மதிப்பாய்வுகள்",
    users: "பயனர்கள்",
    logout: "வெளியேறு",
    login: "உள் நுழை",
  },
};

const LangContext = createContext(null);

/**
 * Provides language state and lightweight UI copy.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Descendant elements.
 * @returns {JSX.Element} Context provider.
 */
export function LangProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem(STORAGE_KEYS.language) || "en",
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.language, language);
    document.documentElement.lang = language === "ta" ? "ta" : "en";
  }, [language]);

  return (
    <LangContext.Provider
      value={{ language, setLanguage, copy: COPY[language] || COPY.en }}
    >
      {children}
    </LangContext.Provider>
  );
}

LangProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Reads the current language context.
 *
 * @returns {{language: string, setLanguage: Function, copy: object}} Language context value.
 */
export function useLang() {
  const context = useContext(LangContext);

  if (!context) {
    throw new Error("useLang must be used within LangProvider");
  }

  return context;
}
