import PropTypes from "prop-types";

import "./TempleDetailsSheet.css";

/**
 * Bottom sheet with full temple details.
 *
 * @param {object} props - Component props.
 * @param {object|null} props.temple - Active temple.
 * @param {Function} props.onClose - Close callback.
 * @returns {JSX.Element|null} Details sheet.
 */
export default function TempleDetailsSheet({ temple = null, onClose }) {
  if (!temple) {
    return null;
  }

  return (
    <div
      className="temple-details-sheet__overlay"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="temple-details-sheet surface-card"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>{temple.temple}</h3>
        <p className="helper-text">
          {temple.location}, {temple.state}
        </p>
        {temple.url ? (
          <a href={temple.url} target="_blank" rel="noreferrer">
            Temple Link
          </a>
        ) : (
          <p className="helper-text">No URL</p>
        )}
        <button type="button" className="button" onClick={onClose}>
          Close
        </button>
      </section>
    </div>
  );
}

TempleDetailsSheet.propTypes = {
  temple: PropTypes.shape({
    temple: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    url: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};
