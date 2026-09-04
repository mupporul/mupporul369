import PropTypes from "prop-types";

import "./SearchInput.css";

/**
 * Controlled search field.
 *
 * @param {object} props - Component props.
 * @param {string} props.value - Current query.
 * @param {Function} props.onChange - Query change callback.
 * @returns {JSX.Element} Search field.
 */
export default function SearchInput({ value, onChange }) {
  return (
    <label className="search-input">
      <span className="visually-hidden">Search temples</span>
      <input
        className="field"
        type="search"
        value={value}
        placeholder="Search by temple, location or state"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
