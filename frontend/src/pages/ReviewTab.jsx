import { useMemo, useState } from "react";
import { useLang } from "../context/LangContext";
import { toTitleCase } from "../utils/titleCase";
import "./ReviewTab.css";

const CONTRIBUTOR_INITIALS = ["TR", "RR", "RA", "MA"];

/**
 * Review queue tab with per-item approvals.
 *
 * @param {{ reviews: Array, loading: boolean, error: string|null, currentUser: Object, onApprove: Function, onDelete: Function }} props
 * @returns {JSX.Element}
 */
export default function ReviewTab({
  reviews,
  loading,
  error,
  currentUser,
  onApprove,
  onDelete,
}) {
  const { t } = useLang();
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const rows = useMemo(
    () =>
      reviews.map((item) => ({
        id: item.id,
        action: item.action,
        payload: item.payload,
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
      await onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
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
          const alreadyApproved = row.approvals.some(
            (entry) => entry.userId === currentUser.id,
          );
          const approvedInitials = row.approvals.map((entry) => entry.initials);
          const createdByInitials = row.createdBy?.initials || "";
          const candidates = CONTRIBUTOR_INITIALS.filter(
            (initial) => initial !== createdByInitials,
          );
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
                  {toTitleCase(row.payload.temple)}
                </p>
                <p className="review-item__meta">
                  {toTitleCase(row.payload.location)},{" "}
                  {toTitleCase(row.payload.state)}
                </p>
                <div className="review-item__tags">
                  <span className="review-item__tag review-item__tag--house">
                    {row.payload.house}
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
                  {candidates.map((initial) => {
                    const isCurrentUser = currentUser.initials === initial;
                    const isApproved = approvedInitials.includes(initial);

                    if (isCurrentUser && !alreadyApproved && !isApproved) {
                      return (
                        <button
                          key={initial}
                          className="review-item__approver-btn"
                          onClick={() => onApprove(row.id)}
                        >
                          {initial}
                        </button>
                      );
                    }

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
                className="review-confirm-modal__btn review-confirm-modal__btn--delete"
                onClick={handleConfirmDelete}
              >
                {t.deleteConfirmDeleteBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
