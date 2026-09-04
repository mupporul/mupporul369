import { useState, useEffect, useCallback } from "react";

const API_BASE = "/api/temples";

async function parseJsonSafe(response) {
  if (!response) return null;

  if (typeof response.text === "function") {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  if (typeof response.json === "function") {
    return response.json();
  }

  return null;
}

/**
 * Fetches and manages the full temples dataset from the server.
 *
 * @param {Function} authFetch
 * @returns {{
 *   temples: Array,
 *   loading: boolean,
 *   error: string|null,
 *   fetchTemples: () => Promise<void>,
 *   createTemple: (payload: Object) => Promise<void>,
 *   patchTemple: (id: string, payload: Object) => Promise<void>
 * }}
 */
export default function useTemples(authFetch) {
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemples = useCallback(async () => {
    if (!authFetch) return;
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch(API_BASE);
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        throw new Error(data?.message || `Server error ${res.status}`);
      }
      setTemples(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchTemples();
  }, [fetchTemples]);

  /**
   * Patch a single temple record and refresh local state from the server response.
   *
   * @param {string} id - UUID of the temple to update.
   * @param {{ temple: string, location: string, state: string, house: string, planets: string[] }} payload
   * @returns {Promise<void>}
   */
  const patchTemple = useCallback(
    async (id, payload) => {
      const res = await authFetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      return res.json();
    },
    [authFetch],
  );

  /**
   * Create a new temple record and refresh local state from server response.
   *
   * @param {{ temple: string, location: string, state: string, house: string, planets: string[] }} payload
   * @returns {Promise<void>}
   */
  const createTemple = useCallback(
    async (payload) => {
      const res = await authFetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      return res.json();
    },
    [authFetch],
  );

  return { temples, loading, error, fetchTemples, createTemple, patchTemple };
}
