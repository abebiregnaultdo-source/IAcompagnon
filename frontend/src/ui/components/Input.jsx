/**
 * Input avec validation douce
 */
export default function Input({
  label,
  value,
  onChange,
  onKeyDown,
  placeholder = "",
  error = "",
  helpText = "",
  type = "text",
  disabled = false,
  required = false,
  "aria-label": ariaLabel,
}) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {required && <span style={{ color: "#B88888" }}> *</span>}
        </label>
      )}

      <input
        type={type}
        className={`input ${error ? "input-error" : ""}`}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        onPaste={
          type === "password"
            ? (e) => {
                e.preventDefault();
              }
            : undefined
        }
        onCopy={
          type === "password"
            ? (e) => {
                e.preventDefault();
              }
            : undefined
        }
        onCut={
          type === "password"
            ? (e) => {
                e.preventDefault();
              }
            : undefined
        }
        aria-label={ariaLabel || label}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={
          error ? `${label}-error` : helpText ? `${label}-help` : undefined
        }
      />

      {helpText && !error && (
        <div className="input-help" id={`${label}-help`}>
          {helpText}
        </div>
      )}

      {error && (
        <div className="input-error-message" id={`${label}-error`} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
