import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

const readJsonSafely = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const normalizePayload = (payload) => ({
  ...payload,
  temple: payload.temple.trim(),
  location: payload.location.trim(),
  state: payload.state.trim(),
  url: payload.url.trim(),
  planets: payload.planets,
});

/**
 * Loads temple groups and queues temple add/edit requests through review APIs.
 *
 * @returns {object} Temple state and queue actions.
 */
export function useTemples() {
  const { authFetch } = useAuth();
  const [templeGroups, setTempleGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const loadTemples = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authFetch("/api/temples");
      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load temples.");
      }

      setTempleGroups(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemples();
  }, []);

  const queueTempleCreate = async (payload) => {
    setSubmitMessage("");
    const response = await authFetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        action: "add",
        payload: normalizePayload(payload),
      }),
    });
    const data = await readJsonSafely(response);

    if (!response.ok) {
      throw new Error(data?.message || "Unable to queue temple add request.");
    }

    setSubmitMessage("Temple add request queued for review.");
    return data;
  };

  const queueTempleEdit = async (templeId, payload) => {
    setSubmitMessage("");
    const response = await authFetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        action: "edit",
        templeId,
        payload: normalizePayload(payload),
      }),
    });
    const data = await readJsonSafely(response);

    if (!response.ok) {
      throw new Error(data?.message || "Unable to queue temple edit request.");
    }

    if (data?.noChanges) {
      setSubmitMessage("No changes detected. Review request was not created.");
      return data;
    }

    setSubmitMessage("Temple edit request queued for review.");
    return data;
  };

  return {
    templeGroups,
    isLoading,
    error,
    submitMessage,
    loadTemples,
    queueTempleCreate,
    queueTempleEdit,
  };
}
