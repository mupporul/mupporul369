import RasiDropdown from "./RasiDropdown";
import SearchInput from "./SearchInput";
import PlanetToggleRow from "./PlanetToggleRow";
import "./FilterBar.css";

/**
 * Sticky filter bar rendered inside each tab's scroll area.
 * Contains rasi dropdown, text search, and planet toggles.
 *
 * @param {{
 *   rasi: string,
 *   onRasiChange: Function,
 *   search: string,
 *   onSearchChange: Function,
 *   activePlanets: string[],
 *   onPlanetToggle: Function
 * }} props
 * @returns {JSX.Element}
 */
export default function FilterBar({
  rasi,
  onRasiChange,
  search,
  onSearchChange,
  activePlanets,
  onPlanetToggle,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__top">
        <RasiDropdown value={rasi} onChange={onRasiChange} />
        <SearchInput value={search} onChange={onSearchChange} />
      </div>
      <PlanetToggleRow
        activePlanets={activePlanets}
        onToggle={onPlanetToggle}
      />
    </div>
  );
}
