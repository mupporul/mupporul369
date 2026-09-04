import PropTypes from "prop-types";

import { HOUSE_OPTIONS } from "../utils/constants";
import "./RasiDropdown.css";

/**
 * Rasi/house dropdown selector.
 *
 * @param {object} props - Component props.
 * @param {string} props.value - Selected house.
 * @param {Function} props.onChange - House change callback.
 * @returns {JSX.Element} Dropdown.
 */
export default function RasiDropdown({ value, onChange }) {
  return (
    <label className="label rasi-dropdown">
      House
      <select
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="all">All houses</option>
        {HOUSE_OPTIONS.map((house) => (
          <option key={house} value={house}>
            {house}
          </option>
        ))}
      </select>
    </label>
  );
}

RasiDropdown.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
