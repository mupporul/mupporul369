import { useLang } from "../context/LangContext";

/**
 * பெயர்கள் tab — placeholder until the names feature is built.
 *
 * @returns {JSX.Element}
 */
export default function NamesTab() {
  const { t } = useLang();
  return (
    <div className="names-tab-placeholder">
      <p>{t.namesPlaceholder}</p>
    </div>
  );
}
