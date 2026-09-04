import { useLang } from "../context/LangContext";
import { PLANET_LIST } from "../constants/planets";
import "./PlanetToggleRow.css";

/**
 * Horizontally scrollable row of 9 Navagraha planet toggle buttons.
 *
 * @param {{ activePlanets: string[], onToggle: Function }} props
 * @returns {JSX.Element}
 */
export default function PlanetToggleRow({ activePlanets, onToggle }) {
  const { t } = useLang();
  return (
    <div
      className="planet-toggle-row"
      role="group"
      aria-label={t.planetFilterAriaLabel}
    >
      {PLANET_LIST.map((planet) => {
        const active = activePlanets.includes(planet);
        return (
          <button
            key={planet}
            className={`planet-toggle${active ? " planet-toggle--active" : ""}`}
            onClick={() => onToggle(planet)}
            aria-pressed={active}
          >
            {planet}
          </button>
        );
      })}
    </div>
  );
}
