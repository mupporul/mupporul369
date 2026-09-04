import PropTypes from "prop-types";

import PlanetToggleRow from "./PlanetToggleRow";
import RasiDropdown from "./RasiDropdown";
import SearchInput from "./SearchInput";
import "./FilterBar.css";

/**
 * Search and filter controls for temple browsing.
 *
 * @param {object} props - Component props.
 * @param {string} props.search - Search query.
 * @param {Function} props.onSearchChange - Query callback.
 * @param {string} props.house - Current house filter.
 * @param {Function} props.onHouseChange - House callback.
 * @param {string[]} props.selectedPlanets - Planet filters.
 * @param {Function} props.onPlanetToggle - Planet callback.
 * @returns {JSX.Element} Filter bar.
 */
export default function FilterBar({
  search,
  onSearchChange,
  house,
  onHouseChange,
  selectedPlanets,
  onPlanetToggle,
}) {
  return (
    <section
      className="filter-bar surface-card card-stack"
      aria-label="Temple filters"
    >
      <SearchInput value={search} onChange={onSearchChange} />
      <RasiDropdown value={house} onChange={onHouseChange} />
      <PlanetToggleRow
        selectedPlanets={selectedPlanets}
        onToggle={onPlanetToggle}
      />
    </section>
  );
}

FilterBar.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  house: PropTypes.string.isRequired,
  onHouseChange: PropTypes.func.isRequired,
  selectedPlanets: PropTypes.arrayOf(PropTypes.string).isRequired,
  onPlanetToggle: PropTypes.func.isRequired,
};
