import PropTypes from "prop-types";

import { PLANET_OPTIONS } from "../utils/constants";
import "./PlanetToggleRow.css";

/**
 * Multi-select toggle row for planets.
 *
 * @param {object} props - Component props.
 * @param {string[]} props.selectedPlanets - Selected planet names.
 * @param {Function} props.onToggle - Toggle callback.
 * @returns {JSX.Element} Planet toggle row.
 */
export default function PlanetToggleRow({ selectedPlanets, onToggle }) {
  return (
    <div className="planet-toggle-row">
      {PLANET_OPTIONS.map((planet) => {
        const isActive = selectedPlanets.includes(planet);
        return (
          <button
            key={planet}
            type="button"
            className={`planet-toggle-row__item${isActive ? " planet-toggle-row__item--active" : ""}`}
            onClick={() => onToggle(planet)}
          >
            {planet}
          </button>
        );
      })}
    </div>
  );
}

PlanetToggleRow.propTypes = {
  selectedPlanets: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggle: PropTypes.func.isRequired,
};
