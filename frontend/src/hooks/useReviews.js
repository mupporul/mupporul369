import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

const readJsonSafely = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

/**
 * Loads review queue items and exposes approval actions.
 *
 * @returns {object} Review state and actions.
 */
export function useReviews() {
  const { authFetch } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authFetch("/api/reviews");
      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load reviews.");
      }

      setReviews(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const approveReview = async (reviewId) => {
    const response = await authFetch(`/api/reviews/${reviewId}/approve`, {
      method: "POST",
    });
    const data = await readJsonSafely(response);

    if (!response.ok) {
      throw new Error(data?.message || "Unable to approve review.");
    }

    setReviews((currentReviews) =>
      currentReviews.map((review) =>
        review.id === reviewId ? { ...review, ...data } : review,
      ),
    );

    return data;
  };

  return {
    reviews,
    isLoading,
    error,
    loadReviews,
    approveReview,
  };
}
