import { useMemo, useState } from "react";

import EditModal from "../components/EditModal";
import FilterBar from "../components/FilterBar";
import TempleDetailsSheet from "../components/TempleDetailsSheet";
import TempleList from "../components/TempleList";
import { useTemples } from "../hooks/useTemples";

const flattenGroups = (groups) =>
  groups.flatMap((group) =>
    group.data.map((row) => ({
      ...row,
      house: group.house,
      planets: group.planets,
    })),
  );

/**
 * Temples page with grouped source data filters and review-queue edits.
 *
 * @returns {JSX.Element} Temples page.
 */
export default function TemplesPage() {
  const {
    templeGroups,
    isLoading,
    error,
    submitMessage,
    queueTempleCreate,
    queueTempleEdit,
  } = useTemples();
  const [search, setSearch] = useState("");
  const [house, setHouse] = useState("all");
  const [selectedPlanets, setSelectedPlanets] = useState([]);
  const [activeTemple, setActiveTemple] = useState(null);
  const [detailsTemple, setDetailsTemple] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return flattenGroups(templeGroups).filter((row) => {
      const houseMatch = house === "all" || row.house === house;
      const planetsMatch = selectedPlanets.every((planet) =>
        row.planets.includes(planet),
      );
      const searchMatch =
        !query ||
        row.temple.toLowerCase().includes(query) ||
        row.location.toLowerCase().includes(query) ||
        row.state.toLowerCase().includes(query);
      return houseMatch && planetsMatch && searchMatch;
    });
  }, [templeGroups, search, house, selectedPlanets]);

  const onPlanetToggle = (planet) => {
    setSelectedPlanets((current) =>
      current.includes(planet)
        ? current.filter((item) => item !== planet)
        : [...current, planet],
    );
  };

  const openCreate = () => {
    setActiveTemple(null);
    setShowModal(true);
  };

  return (
    <section className="page-stack">
      <button type="button" className="button" onClick={openCreate}>
        Add Temple
      </button>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        house={house}
        onHouseChange={setHouse}
        selectedPlanets={selectedPlanets}
        onPlanetToggle={onPlanetToggle}
      />
      {isLoading ? <p className="status-text">Loading temples...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {submitMessage ? (
        <p className="status-text status-text--success">{submitMessage}</p>
      ) : null}
      {!isLoading && !error ? (
        <TempleList
          rows={rows}
          onView={(temple) => setDetailsTemple(temple)}
          onEdit={(temple) => {
            setActiveTemple(temple);
            setShowModal(true);
          }}
        />
      ) : null}
      <EditModal
        open={showModal}
        temple={activeTemple}
        onClose={() => setShowModal(false)}
        onCreate={queueTempleCreate}
        onEdit={queueTempleEdit}
      />
      <TempleDetailsSheet
        temple={detailsTemple}
        onClose={() => setDetailsTemple(null)}
      />
    </section>
  );
}
