import { useMemo, useState } from "react";
import { useLang } from "../context/LangContext";
import { toTitleCase } from "../utils/titleCase";
import BrandLoadingIndicator from "../components/BrandLoadingIndicator";
import EditModal from "../components/EditModal";
import InlineSpinner from "../components/InlineSpinner";
import "./ReviewTab.css";

/**
 * Review queue tab with per-item approvals.
 *
 * @param {{ reviews: Array, loading: boolean, error: string|null, currentUser: Object, contributorInitials?: Array<string>, onApprove?: Function, onEdit?: Function, onDelete: Function }} props
 * @returns {JSX.Element}
 */
export default function ReviewTab({
  reviews,
  loading,
  error,
  currentUser,
  contributorInitials = [],
  onApprove,
  onEdit,
  onDelete,
}) {
  const { t } = useLang();
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [expandedReviewId, setExpandedReviewId] = useState(null);

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

  const locationOptions = useMemo(
    () =>
      [...new Set(rows.map((row) => row.payload.location).filter(Boolean))].sort(
        (first, second) => first.localeCompare(second),
      ),
    [rows],
  );

  if (loading) {
    return (
      <div className="review-tab__status" role="status">
        <BrandLoadingIndicator label={t.loading} />
      </div>
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
          const isExpanded = expandedReviewId === row.id;
          const detailsId = `review-details-${row.id}`;

          return (
            <li className="review-item" key={row.id}>
              <div className="review-item__main">
                <button
                  type="button"
                  className="review-item__name-btn"
                  onClick={() =>
                    setExpandedReviewId(isExpanded ? null : row.id)
                  }
                  aria-expanded={isExpanded}
                  aria-controls={detailsId}
                  title={row.payload.temple}
                >
                  <span className="review-item__name">
                    {toTitleCase(row.payload.temple) || "-"}
                  </span>
                  <span className="review-item__chevron" aria-hidden="true">
                    {isExpanded ? "⌃" : "⌄"}
                  </span>
                </button>
                <p className="review-item__meta">
                  {toTitleCase(row.payload.location) || "-"},{" "}
                  {toTitleCase(row.payload.state) || "-"}
                </p>
                <p className="review-item__meta">{row.status}</p>
                <div
                  id={detailsId}
                  className={`review-item__details${isExpanded ? " is-expanded" : ""}`}
                  hidden={!isExpanded}
                >
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
                </div>

                <div
                  className="review-item__approvers"
                  role="group"
                  aria-label={t.reviewApproversLabel}
                >
                  {approverStatusInitials.map((initial) => {
                    const isApproved = approvedInitials.includes(initial);
                    return (
                      <button
                        type="button"
                        className={`review-item__approver-btn review-item__approver-text${isApproved ? " review-item__approver-text--approved" : " review-item__approver-text--pending"}`}
                        onClick={() => onApprove?.(row.id)}
                        aria-label={`${t.approveBtn} ${initial}`}
                        title={`${t.approveBtn} ${initial}`}
                        key={initial}
                      >
                        <span className="review-item__approver-initial">
                          {initial}
                        </span>
                        <span className="review-item__approver-indicator">
                          {isApproved ? "✓✓" : "👀"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="review-item__approval-label">{approvalText}</p>

                <div className="review-item__footer">
                  <p className="review-item__source">{sourceLabel}</p>
                  {onEdit && (
                    <button
                      type="button"
                      className="review-item__edit-btn"
                      onClick={() => setEditingReview(row)}
                      aria-label={`${t.reviewEditBtn}: ${row.payload.temple}`}
                    >
                      {t.reviewEditBtn}
                    </button>
                  )}
                  <button
                    type="button"
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

      <EditModal
        temple={editingReview ? { ...editingReview.payload, id: editingReview.id } : null}
        mode="edit"
        locationOptions={locationOptions}
        onSave={async (reviewId, payload) => {
          return onEdit?.(reviewId, payload);
        }}
        onCreate={async () => {}}
        onClose={() => setEditingReview(null)}
      />
    </>
  );
}
