import { useId, useState } from "react";
import { useLang } from "../context/LangContext";
import { toTitleCase } from "../utils/titleCase";
import "./TempleRow.css";

/**
 * Single temple card with edit button.
 *
 * @param {{ row: Object, onEdit?: Function|null, onViewDetails?: Function|null }} props
 * @returns {JSX.Element}
 */
export default function TempleRow({ row, onEdit }) {
  const { t, lang } = useLang();
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  return (
    <li className="temple-row">
      <div className="temple-row__body">
        <button
          type="button"
          className="temple-row__name-btn"
          onClick={() => setExpanded((isExpanded) => !isExpanded)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          title={row.temple}
        >
          <span className="temple-row__name">{toTitleCase(row.temple)}</span>
          <span className="temple-row__chevron" aria-hidden="true">
            {expanded ? "⌃" : "⌄"}
          </span>
        </button>
        <p className="temple-row__meta">
          {toTitleCase(row.location)}, {toTitleCase(row.state)}
        </p>
        {expanded ? (
          <div id={detailsId} className="temple-row__details">
            {row.significance ? (
              <p className="temple-row__significance">
                {t.significanceLabel}: {row.significance}
              </p>
            ) : null}
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
        ) : null}
      </div>
      {onEdit && (
        <button
          className="temple-row__edit"
          onClick={() => onEdit(row)}
          aria-label={lang === "en" ? t.editBtn : `${row.temple} ${t.editBtn}`}
        >
          {t.editBtn}
        </button>
      )}
    </li>
  );
}
