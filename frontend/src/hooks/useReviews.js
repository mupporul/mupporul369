import { useCallback, useEffect, useState } from "react";

/**
 * Fetches and manages pending review items.
 *
 * @param {Function} authFetch
 * @returns {{ reviews: Array, loading: boolean, error: string|null, fetchReviews: Function, approveReview: Function }}
 */
export default function useReviews(authFetch) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!authFetch) return;
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch("/api/reviews");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setReviews(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const approveReview = useCallback(
    async (reviewId) => {
      const res = await authFetch(`/api/reviews/${reviewId}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Approve failed (${res.status})`);
      const payload = await res.json();
      setReviews(payload.reviews || []);
      return payload;
    },
    [authFetch],
  );

  return { reviews, loading, error, fetchReviews, approveReview };
}
