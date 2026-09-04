import PropTypes from "prop-types";

import TempleRow from "./TempleRow";
import "./TempleList.css";

/**
 * Flat list of filtered temple rows.
 *
 * @param {object} props - Component props.
 * @param {Array} props.rows - Temple rows.
 * @param {Function} props.onView - View callback.
 * @param {Function} props.onEdit - Edit callback.
 * @returns {JSX.Element} Temple list.
 */
export default function TempleList({ rows, onView, onEdit }) {
  if (!rows.length) {
    return <p className="empty-state">No temples match your filter.</p>;
  }

  return (
    <ul className="temple-list stagger-list" aria-label="Temples">
      {rows.map((row) => (
        <TempleRow key={row.id} temple={row} onView={onView} onEdit={onEdit} />
      ))}
    </ul>
  );
}

TempleList.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};
