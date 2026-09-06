import "./InlineSpinner.css";

export default function InlineSpinner({ label = "Loading" }) {
  return (
    <span className="inline-spinner" role="status" aria-label={label}>
      <span className="inline-spinner__circle" aria-hidden="true" />
      <span className="inline-spinner__label">{label}</span>
    </span>
  );
}
