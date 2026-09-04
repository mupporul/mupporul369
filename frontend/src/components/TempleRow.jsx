import { useLang } from "../context/LangContext";
import { toTitleCase } from "../utils/titleCase";
import "./TempleRow.css";

/**
 * Single temple card with edit button.
 *
 * @param {{ row: Object, onEdit?: Function|null, onViewDetails?: Function|null }} props
 * @returns {JSX.Element}
 */
export default function TempleRow({ row, onEdit, onViewDetails }) {
  const { t } = useLang();
  const canViewDetails = typeof onViewDetails === "function";

  return (
    <li className="temple-row">
      <div className="temple-row__body">
        {canViewDetails ? (
          <button
            type="button"
            className="temple-row__name-btn"
            onClick={() => onViewDetails(row)}
            aria-label={`${row.temple} ${t.viewDetailsBtn}`}
            title={row.temple}
          >
            <span className="temple-row__name">{toTitleCase(row.temple)}</span>
          </button>
        ) : (
          <p className="temple-row__name" title={row.temple}>
            {toTitleCase(row.temple)}
          </p>
        )}
        <p className="temple-row__meta">
          {toTitleCase(row.location)}, {toTitleCase(row.state)}
        </p>
        <div className="temple-row__tags">
          <span className="temple-row__tag temple-row__tag--house">
            {row.house}
          </span>
          {row.planets.map((p) => (
            <span key={p} className="temple-row__tag temple-row__tag--planet">
              {p}
            </span>
          ))}
        </div>
        {row.url && (
          <a
            className="temple-row__yt-link"
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${row.temple} ${t.youtubeLinkLabel}`}
          >
            <span className="temple-row__yt-icon" aria-hidden="true">
              <span className="temple-row__yt-eye" />
              <span className="temple-row__yt-eye" />
            </span>
            <span>{t.openYoutubeBtn}</span>
          </a>
        )}
      </div>
      {onEdit && (
        <button
          className="temple-row__edit"
          onClick={() => onEdit(row)}
          aria-label={`${row.temple} ${t.editBtn}`}
        >
          {t.editBtn}
        </button>
      )}
    </li>
  );
}
