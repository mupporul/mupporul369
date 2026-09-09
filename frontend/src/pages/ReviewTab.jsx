import { useMemo, useState } from "react";
import { useLang } from "../context/LangContext";
import { toTitleCase } from "../utils/titleCase";
import InlineSpinner from "../components/InlineSpinner";
import "./ReviewTab.css";

/**
 * Review queue tab with per-item approvals.
 *
 * @param {{ reviews: Array, loading: boolean, error: string|null, currentUser: Object, contributorInitials?: Array<string>, onDelete: Function }} props
 * @returns {JSX.Element}
 */
export default function ReviewTab({
  reviews,
  loading,
  error,
  currentUser,
  contributorInitials = [],
  onDelete,
}) {
  const { t } = useLang();
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const rows = useMemo(
    () =>
      reviews.map((item) => ({
        id: item.id,
        action: item.action,
        status: item.status || "pending",
        payload: {
          temple: item.payload?.temple || "",
          location: item.payload?.location || "",
          state: item.payload?.state || "",
          url: item.payload?.url || "",
          significance: item.payload?.significance || "",
          house: item.payload?.house || "",
          planets: Array.isArray(item.payload?.planets)
            ? item.payload.planets
            : [],
        },
        createdBy: item.createdBy,
        modifiedBy: item.modifiedBy,
        approvals: item.approvals || [],
      })),
    [reviews],
  );

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId && onDelete) {
      const id = deleteConfirmId;
      try {
        setDeletingId(id);
        await onDelete(id);
        setDeleteConfirmId(null);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (loading) {
    return (
      <p className="review-tab__status" role="status">
        {t.loading}
      </p>
    );
  }

  if (error) {
    return (
      <p className="review-tab__status review-tab__status--error">
        {t.errorPrefix}: {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="review-tab__status" role="status">
        {t.reviewEmpty}
      </p>
    );
  }

  return (
    <>
      <ul className="review-list" aria-label={t.reviewListAriaLabel}>
        {rows.map((row) => {
          const approvedInitials = row.approvals
            .map((entry) => String(entry.initials || "").trim())
            .filter(Boolean);
          const approverStatusInitials = [
            ...new Set([
              ...(Array.isArray(contributorInitials) ? contributorInitials : [])
                .map((initial) => String(initial || "").trim())
                .filter(Boolean),
              ...approvedInitials,
            ]),
          ];
          const approvalText =
            approvedInitials.length > 0
              ? `${t.reviewApprovedBy} ${approvedInitials.join(", ")}`
              : t.reviewWaitingForApproval;

          const sourceInitials =
            row.modifiedBy?.initials || row.createdBy?.initials || "";
          const isAddAction = row.action === "add";
          const sourceLabel = isAddAction
            ? `${t.reviewAddedBy} ${sourceInitials}`
            : `${t.reviewModifiedBy} ${sourceInitials}`;

          return (
            <li className="review-item" key={row.id}>
              <div className="review-item__main">
                <p className="review-item__name">
                  {toTitleCase(row.payload.temple) || "-"}
                </p>
                <p className="review-item__meta">
                  {toTitleCase(row.payload.location) || "-"},{" "}
                  {toTitleCase(row.payload.state) || "-"}
                </p>
                <p className="review-item__meta">{row.status}</p>
                {row.payload.url ? (
                  <a
                    className="review-item__video-link"
                    href={row.payload.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.youtubeLinkLabel}
                  </a>
                ) : null}
                {row.payload.significance ? (
                  <p className="review-item__significance">
                    {t.significanceLabel}: {row.payload.significance}
                  </p>
                ) : null}
                <div className="review-item__tags">
                  <span className="review-item__tag review-item__tag--house">
                    {row.payload.house || "-"}
                  </span>
                  {row.payload.planets.map((planet) => (
                    <span
                      key={planet}
                      className="review-item__tag review-item__tag--planet"
                    >
                      {planet}
                    </span>
                  ))}
                </div>

                <div
                  className="review-item__approvers"
                  role="group"
                  aria-label={t.reviewApproversLabel}
                >
                  {approverStatusInitials.map((initial) => {
                    const isApproved = approvedInitials.includes(initial);
                    return (
                      <span
                        className={`review-item__approver-text${isApproved ? " review-item__approver-text--approved" : " review-item__approver-text--pending"}`}
                        key={initial}
                      >
                        <span className="review-item__approver-initial">
                          {initial}
                        </span>
                        <span className="review-item__approver-indicator">
                          {isApproved ? "✓✓" : "👀"}
                        </span>
                      </span>
                    );
                  })}
                </div>

                <p className="review-item__approval-label">{approvalText}</p>

                <div className="review-item__footer">
                  <p className="review-item__source">{sourceLabel}</p>
                  <button
                    className="review-item__delete-btn"
                    onClick={() => handleDeleteClick(row.id)}
                    aria-label={t.deleteBtn}
                    disabled={Boolean(deletingId)}
                  >
                    {t.deleteBtn}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {deleteConfirmId && (
        <div className="review-confirm-modal__overlay">
          <div className="review-confirm-modal">
            <h2 className="review-confirm-modal__title">
              {t.deleteConfirmTitle}
            </h2>
            <p className="review-confirm-modal__text">{t.deleteConfirmText}</p>
            <div className="review-confirm-modal__actions">
              <button
                className="review-confirm-modal__btn review-confirm-modal__btn--cancel"
                onClick={handleCancelDelete}
              >
                {t.deleteConfirmCancelBtn}
              </button>
              <button
                className={`review-confirm-modal__btn review-confirm-modal__btn--delete api-loading-button${
                  deletingId ? " is-loading" : ""
                }`}
                onClick={handleConfirmDelete}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? (
                  <InlineSpinner label={t.loading} />
                ) : (
                  t.deleteConfirmDeleteBtn
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
