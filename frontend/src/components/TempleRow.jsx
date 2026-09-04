import PropTypes from "prop-types";

import "./TempleRow.css";

/**
 * Displays one temple row with actions.
 *
 * @param {object} props - Component props.
 * @param {object} props.temple - Temple record.
 * @param {Function} props.onView - View callback.
 * @param {Function} props.onEdit - Edit callback.
 * @returns {JSX.Element} Temple row.
 */
export default function TempleRow({ temple, onView, onEdit }) {
  return (
    <li className="temple-row surface-card">
      <div>
        <h3 className="temple-row__title">{temple.temple}</h3>
        <p className="helper-text">
          {temple.location}, {temple.state}
        </p>
      </div>
      <div className="temple-row__chips">
        <span className="chip">{temple.house}</span>
        {temple.planets.map((planet) => (
          <span className="chip" key={planet}>
            {planet}
          </span>
        ))}
      </div>
      <div className="temple-row__actions">
        <button
          type="button"
          className="ghost-button"
          onClick={() => onView(temple)}
        >
          View
        </button>
        <button type="button" className="button" onClick={() => onEdit(temple)}>
          Edit
        </button>
      </div>
    </li>
  );
}

TempleRow.propTypes = {
  temple: PropTypes.shape({
    id: PropTypes.string.isRequired,
    temple: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    url: PropTypes.string,
    house: PropTypes.string.isRequired,
    planets: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};
