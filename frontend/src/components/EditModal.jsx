import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLang } from "../context/LangContext";
import { RASI_LIST, UNKNOWN_RASI } from "../constants/rasi";
import { PLANET_LIST } from "../constants/planets";
import { INDIAN_STATES } from "../constants/states";
import { NEW_TEMPLE_DEFAULTS } from "../constants/newTempleDefaults";
import "./EditModal.css";

/**
 * Slide-up bottom-sheet modal for editing all fields of a temple record.
 * Rendered into document.body via a portal so it escapes any scroll container.
 *
 * @param {{ temple: Object|null, mode: "edit"|"create", locationOptions?: string[], onSave: Function, onCreate: Function, onClose: Function }} props
 * @returns {JSX.Element|null}
 */
export default function EditModal({
  temple,
  mode,
  locationOptions = [],
  onSave,
  onCreate,
  onClose,
}) {
  const { t } = useLang();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showNoChangesNotice, setShowNoChangesNotice] = useState(false);
  const isCreate = mode === "create";

  useEffect(() => {
    if (isCreate) {
      setForm({ ...NEW_TEMPLE_DEFAULTS });
      setError(null);
      setShowNoChangesNotice(false);
      return;
    }
    if (temple) {
      setForm({
        temple: temple.temple,
        location: temple.location,
        state: temple.state,
        url: temple.url || "",
        house: temple.house,
        planets: [...temple.planets],
      });
      setError(null);
      setShowNoChangesNotice(false);
    }
  }, [temple, isCreate]);

  if ((!isCreate && !temple) || !form) return null;

  function handleField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handlePlanetToggle(planet) {
    setForm((f) => ({
      ...f,
      planets: f.planets.includes(planet)
        ? f.planets.filter((p) => p !== planet)
        : [...f.planets, planet],
    }));
  }

  async function handleSave() {
    const hasRequiredFields =
      String(form.temple || "").trim() &&
      String(form.location || "").trim() &&
      String(form.state || "").trim() &&
      Array.isArray(form.planets) &&
      form.planets.length > 0;

    if (!hasRequiredFields) {
      setError(t.requiredFieldsExceptRasiError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isCreate) {
        await onCreate(form);
      } else {
        const result = await onSave(temple.id, form);
        if (result?.noChanges) {
          setShowNoChangesNotice(true);
          return;
        }
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="edit-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="edit-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isCreate ? t.modalAriaLabelAdd : t.modalAriaLabel}
      >
        <div className="edit-modal__handle" aria-hidden="true" />
        <h2 className="edit-modal__title">
          {isCreate ? t.modalTitleAdd : t.modalTitle}
        </h2>

        <label className="edit-modal__label">
          {t.fieldTemple}
          <input
            className="edit-modal__input"
            value={form.temple}
            onChange={(e) => handleField("temple", e.target.value)}
          />
        </label>

        <label className="edit-modal__label">
          {t.fieldLocation}
          <input
            className="edit-modal__input"
            type="search"
            list="location-options"
            value={form.location}
            onChange={(e) => handleField("location", e.target.value)}
          />
          <datalist id="location-options">
            {locationOptions.map((locationName) => (
              <option key={locationName} value={locationName} />
            ))}
          </datalist>
        </label>

        <label className="edit-modal__label">
          {t.fieldState}
          <select
            className="edit-modal__select"
            value={form.state}
            onChange={(e) => handleField("state", e.target.value)}
            aria-label={t.stateSelectAriaLabel}
          >
            {INDIAN_STATES.map((stateName) => (
              <option key={stateName} value={stateName}>
                {stateName}
              </option>
            ))}
          </select>
        </label>

        <label className="edit-modal__label">
          {t.fieldUrl}
          <input
            className="edit-modal__input"
            type="url"
            value={form.url}
            onChange={(e) => handleField("url", e.target.value)}
          />
        </label>

        <label className="edit-modal__label">
          {t.fieldRasi}
          <select
            className="edit-modal__select"
            value={form.house}
            onChange={(e) => handleField("house", e.target.value)}
          >
            <option value="">{t.fieldRasiUnknownOption}</option>
            <option value={UNKNOWN_RASI}>{t.fieldRasiUnknownValue}</option>
            {RASI_LIST.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="edit-modal__fieldset">
          <legend className="edit-modal__legend">{t.fieldPlanets}</legend>
          <div className="edit-modal__planets">
            {PLANET_LIST.map((planet) => {
              const active = form.planets.includes(planet);
              return (
                <button
                  key={planet}
                  type="button"
                  className={`edit-modal__planet${active ? " edit-modal__planet--active" : ""}`}
                  onClick={() => handlePlanetToggle(planet)}
                  aria-pressed={active}
                >
                  {planet}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error && <p className="edit-modal__error">{error}</p>}

        <div className="edit-modal__actions">
          <button
            className="edit-modal__btn edit-modal__btn--cancel"
            onClick={onClose}
            disabled={saving}
          >
            {t.cancelBtn}
          </button>
          <button
            className="edit-modal__btn edit-modal__btn--save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "..." : isCreate ? t.addBtn : t.saveBtn}
          </button>
        </div>

        {showNoChangesNotice && (
          <div className="edit-modal__notice-overlay" role="presentation">
            <div
              className="edit-modal__notice"
              role="alertdialog"
              aria-modal="true"
              aria-label={t.noEditChangesMessage}
            >
              <p className="edit-modal__notice-text">{t.noEditChangesMessage}</p>
              <button
                type="button"
                className="edit-modal__notice-ok"
                onClick={onClose}
              >
                {t.okBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
