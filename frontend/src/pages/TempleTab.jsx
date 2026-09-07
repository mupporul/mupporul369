import { useState, useMemo, useEffect } from "react";
import { useLang } from "../context/LangContext";
import FilterBar from "../components/FilterBar";
import TempleList from "../components/TempleList";
import EditModal from "../components/EditModal";
import TempleDetailsSheet from "../components/TempleDetailsSheet";
import { ALL_RASI } from "../constants/rasi";

/**
 * கோவில்கள் tab — filter controls + temple result list + edit modal.
 *
 * @param {{ temples: Array, loading: boolean, error: string|null, canContribute: boolean, addTempleClickCount: number, onCreate: Function, onPatch: Function, onProposalQueued: Function }} props
 * @returns {JSX.Element}
 */
export default function TempleTab({
  temples,
  loading,
  error,
  canContribute,
  addTempleClickCount,
  onAddTempleRequestConsumed,
  onCreate,
  onPatch,
  onProposalQueued,
}) {
  const { t } = useLang();
  const [rasi, setRasi] = useState(ALL_RASI);
  const [search, setSearch] = useState("");
  const [activePlanets, setActivePlanets] = useState([]);
  const [editingTemple, setEditingTemple] = useState(null);
  const [modalMode, setModalMode] = useState("edit");
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    if (!canContribute || addTempleClickCount === 0) return;
    setModalMode("create");
    setEditingTemple(null);
    onAddTempleRequestConsumed?.();
  }, [addTempleClickCount, canContribute, onAddTempleRequestConsumed]);

  function openEditModal(row) {
    if (!canContribute) return;
    setModalMode("edit");
    setEditingTemple(row);
  }

  function closeModal() {
    setModalMode("edit");
    setEditingTemple(null);
  }

  function openDetailsSheet(row) {
    setSelectedTemple(row);
  }

  function closeDetailsSheet() {
    setSelectedTemple(null);
  }

  function handlePlanetToggle(planet) {
    setActivePlanets((prev) =>
      prev.includes(planet)
        ? prev.filter((p) => p !== planet)
        : [...prev, planet],
    );
  }

  const rows = useMemo(() => {
    // 1. Filter groups by rasi
    let groups =
      rasi === ALL_RASI ? temples : temples.filter((g) => g.house === rasi);

    // 2. Filter groups by active planets (AND — all must be present)
    if (activePlanets.length > 0) {
      groups = groups.filter((g) =>
        activePlanets.every((p) => g.planets.includes(p)),
      );
    }

    // 3. Flatten data[], attaching group-level house + planets to each row
    let flatRows = groups.flatMap((g) =>
      g.data.map((t) => ({ ...t, house: g.house, planets: g.planets })),
    );

    // 4. Text search across temple name, location, and state
    const q = search.trim().toLowerCase();
    if (q) {
      flatRows = flatRows.filter(
        (r) =>
          r.temple.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q),
      );
    }

    return flatRows;
  }, [temples, rasi, activePlanets, search]);

  const locationOptions = useMemo(() => {
    const set = new Set(
      temples
        .flatMap((group) => group.data)
        .map((item) => item.location)
        .filter(Boolean),
    );
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [temples]);

  return (
    <>
      <FilterBar
        rasi={rasi}
        onRasiChange={setRasi}
        search={search}
        onSearchChange={setSearch}
        activePlanets={activePlanets}
        onPlanetToggle={handlePlanetToggle}
      />

      {loading && (
        <p className="temple-tab__status" role="status">
          {t.loading}
        </p>
      )}
      {error && (
        <p className="temple-tab__status temple-tab__status--error">{error}</p>
      )}
      {submitMessage && (
        <p className="temple-tab__status" role="status">
          {submitMessage}
        </p>
      )}
      {!loading && !error && (
        <TempleList
          rows={rows}
          onEdit={canContribute ? openEditModal : null}
          onViewDetails={openDetailsSheet}
        />
      )}

      <TempleDetailsSheet temple={selectedTemple} onClose={closeDetailsSheet} />

      <EditModal
        temple={editingTemple}
        mode={modalMode}
        locationOptions={locationOptions}
        onCreate={async (payload) => {
          setSubmitMessage("");
          await onCreate(payload);
        }}
        onSave={async (id, payload) => {
          setSubmitMessage("");
          const result = await onPatch(id, payload);
          if (!result?.noChanges) {
            setSubmitMessage(t.reviewQueuedMessage);
            await onProposalQueued();
          } else {
            setSubmitMessage(t.noEditChangesMessage);
          }
          return result;
        }}
        onClose={closeModal}
      />
    </>
  );
}
