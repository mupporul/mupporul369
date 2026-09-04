import { useLang } from "../context/LangContext";

/**
 * Controlled text input for searching temple records.
 *
 * @param {{ value: string, onChange: Function }} props
 * @returns {JSX.Element}
 */
export default function SearchInput({ value, onChange }) {
  const { t } = useLang();
  return (
    <input
      className="search-input"
      type="search"
      placeholder={t.searchPlaceholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={t.searchAriaLabel}
    />
  );
}
