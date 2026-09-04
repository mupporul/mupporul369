import { useLang } from "../context/LangContext";
import TempleRow from "./TempleRow";
import "./TempleList.css";

/**
 * Renders a filtered list of temple rows, or an empty-state message.
 *
 * @param {{ rows: Array, onEdit?: Function|null, onViewDetails?: Function|null }} props
 * @returns {JSX.Element}
 */
export default function TempleList({ rows, onEdit, onViewDetails }) {
  const { t } = useLang();
  if (rows.length === 0) {
    return (
      <p className="temple-list__empty" role="status">
        {t.noResults}
      </p>
    );
  }
  return (
    <ul className="temple-list" aria-label={t.listAriaLabel}>
      {rows.map((row) => (
        <TempleRow
          key={row.id}
          row={row}
          onEdit={onEdit}
          onViewDetails={onViewDetails}
        />
      ))}
    </ul>
  );
}
