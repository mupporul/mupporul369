import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLang } from "../context/LangContext";
import { toTitleCase } from "../utils/titleCase";
import "./TempleDetailsSheet.css";

/**
 * Read-only bottom sheet showing full temple details.
 *
 * @param {{ temple: Object|null, onClose: Function }} props
 * @returns {JSX.Element|null}
 */
export default function TempleDetailsSheet({ temple, onClose }) {
  const { t } = useLang();

  useEffect(() => {
    if (!temple) return undefined;

    function handleEsc(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [temple, onClose]);

  if (!temple) return null;

  return createPortal(
    <div
      className="temple-details-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="temple-details-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t.templeDetailsAriaLabel}
      >
        <div className="temple-details-sheet__handle" aria-hidden="true" />
        <h2 className="temple-details-sheet__title">{t.templeDetailsTitle}</h2>

        <dl className="temple-details-sheet__grid">
          <div className="temple-details-sheet__row">
            <dt>{t.fieldTemple}</dt>
            <dd>{toTitleCase(temple.temple)}</dd>
          </div>
          <div className="temple-details-sheet__row">
            <dt>{t.fieldLocation}</dt>
            <dd>{toTitleCase(temple.location)}</dd>
          </div>
          <div className="temple-details-sheet__row">
            <dt>{t.fieldState}</dt>
            <dd>{toTitleCase(temple.state)}</dd>
          </div>
          <div className="temple-details-sheet__row">
            <dt>{t.fieldRasi}</dt>
            <dd>{temple.house || t.fieldRasiUnknownValue}</dd>
          </div>
          <div className="temple-details-sheet__row">
            <dt>{t.fieldPlanets}</dt>
            <dd>
              <div className="temple-details-sheet__chips">
                {(temple.planets || []).map((planet) => (
                  <span key={planet} className="temple-details-sheet__chip">
                    {planet}
                  </span>
                ))}
              </div>
            </dd>
          </div>
          {temple.significance ? (
            <div className="temple-details-sheet__row">
              <dt>{t.fieldSignificance}</dt>
              <dd>{temple.significance}</dd>
            </div>
          ) : null}
        </dl>

        <button
          type="button"
          className="temple-details-sheet__close"
          onClick={onClose}
        >
          {t.detailsCloseBtn}
        </button>
      </div>
    </div>,
    document.body,
  );
}
