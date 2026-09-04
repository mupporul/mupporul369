import { useState } from "react";

import { useReviews } from "../hooks/useReviews";
import { formatDateTime } from "../utils/formatters";

/**
 * Review queue page for approvals and status visibility.
 *
 * @returns {JSX.Element} Reviews page.
 */
export default function ReviewsPage() {
  const { reviews, isLoading, error, approveReview } = useReviews();
  const [actionError, setActionError] = useState("");

  const approve = async (reviewId) => {
    setActionError("");
    try {
      await approveReview(reviewId);
    } catch (approveError) {
      setActionError(approveError.message);
    }
  };

  if (isLoading) {
    return <p className="status-text">Loading reviews...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <section className="page-stack">
      <h2>Review Queue</h2>
      {actionError ? <p className="error-text">{actionError}</p> : null}
      {!reviews.length ? (
        <p className="empty-state">No pending reviews.</p>
      ) : null}
      <ul className="stagger-list reviews-page__list">
        {reviews.map((review) => (
          <li key={review.id} className="surface-card reviews-page__item">
            <p>
              <strong>{review.action}</strong> · {review.status}
            </p>
            <p className="helper-text">
              Created: {formatDateTime(review.createdAt)}
            </p>
            <p className="helper-text">Temple ID: {review.templeId || "new"}</p>
            <button
              type="button"
              className="button"
              onClick={() => approve(review.id)}
              disabled={review.status !== "pending"}
            >
              Approve
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
