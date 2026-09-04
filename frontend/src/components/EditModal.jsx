import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import {
  DEFAULT_TEMPLE_FORM,
  HOUSE_OPTIONS,
  PLANET_OPTIONS,
} from "../utils/constants";
import "./EditModal.css";

/**
 * Modal for temple add/edit review queue requests.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.open - Modal visibility.
 * @param {object|null} props.temple - Selected temple.
 * @param {Function} props.onClose - Close callback.
 * @param {Function} props.onCreate - Add callback.
 * @param {Function} props.onEdit - Edit callback.
 * @returns {JSX.Element|null} Edit modal.
 */
export default function EditModal({
  open,
  temple = null,
  onClose,
  onCreate,
  onEdit,
}) {
  const [form, setForm] = useState(DEFAULT_TEMPLE_FORM);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(temple);

  useEffect(() => {
    if (temple) {
      setForm({
        temple: temple.temple,
        location: temple.location,
        state: temple.state,
        url: temple.url || "",
        house: temple.house,
        planets: temple.planets,
      });
      return;
    }

    setForm(DEFAULT_TEMPLE_FORM);
  }, [temple]);

  if (!open) {
    return null;
  }

  const togglePlanet = (planet) => {
    setForm((current) => ({
      ...current,
      planets: current.planets.includes(planet)
        ? current.planets.filter((item) => item !== planet)
        : [...current.planets, planet],
    }));
  };

  const onField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      if (!form.temple.trim() || !form.location.trim() || !form.state.trim()) {
        throw new Error("Temple, location and state are required.");
      }

      if (isEdit) {
        await onEdit(temple.id, form);
      } else {
        await onCreate(form);
      }
      onClose();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="edit-modal__overlay" role="presentation" onClick={onClose}>
      <section
        className="edit-modal surface-card"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>{isEdit ? "Edit Temple" : "Add Temple"}</h3>
        <label className="label">
          Temple
          <input
            className="field"
            value={form.temple}
            onChange={(event) => onField("temple", event.target.value)}
          />
        </label>
        <label className="label">
          Location
          <input
            className="field"
            value={form.location}
            onChange={(event) => onField("location", event.target.value)}
          />
        </label>
        <label className="label">
          State
          <input
            className="field"
            value={form.state}
            onChange={(event) => onField("state", event.target.value)}
          />
        </label>
        <label className="label">
          URL
          <input
            className="field"
            value={form.url}
            onChange={(event) => onField("url", event.target.value)}
          />
        </label>
        <label className="label">
          House
          <select
            className="select"
            value={form.house}
            onChange={(event) => onField("house", event.target.value)}
          >
            {HOUSE_OPTIONS.map((house) => (
              <option key={house} value={house}>
                {house}
              </option>
            ))}
          </select>
        </label>
        <div className="edit-modal__planet-row">
          {PLANET_OPTIONS.map((planet) => (
            <button
              key={planet}
              type="button"
              className={`ghost-button${form.planets.includes(planet) ? " edit-modal__planet--active" : ""}`}
              onClick={() => togglePlanet(planet)}
            >
              {planet}
            </button>
          ))}
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="edit-modal__actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="button"
            onClick={submit}
            disabled={busy}
          >
            {busy ? "Saving..." : isEdit ? "Queue Edit" : "Queue Add"}
          </button>
        </div>
      </section>
    </div>
  );
}

EditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  temple: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};
