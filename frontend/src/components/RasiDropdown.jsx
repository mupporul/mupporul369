import { useLang } from "../context/LangContext";
import { RASI_LIST, ALL_RASI } from "../constants/rasi";

/**
 * Select dropdown listing all 12 rasis plus an "All" option.
 *
 * @param {{ value: string, onChange: Function }} props
 * @returns {JSX.Element}
 */
export default function RasiDropdown({ value, onChange }) {
  const { t } = useLang();
  // Map the sentinel value to the current language label
  const displayValue = value === ALL_RASI ? t.rasiAll : value;
  return (
    <select
      className="rasi-dropdown"
      value={displayValue}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === t.rasiAll ? ALL_RASI : raw);
      }}
      aria-label={t.rasiAriaLabel}
    >
      <option value={t.rasiAll}>{t.rasiAll}</option>
      {RASI_LIST.map((rasi) => (
        <option key={rasi} value={rasi}>
          {rasi}
        </option>
      ))}
    </select>
  );
}
