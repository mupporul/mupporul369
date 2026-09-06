import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import InlineSpinner from "../components/InlineSpinner";
import "./LoginPage.css";

const CREDENTIALS_STORAGE_KEY = "mupporul369-remembered-credentials";

function readRememberedCredentials() {
  const raw = globalThis.localStorage?.getItem(CREDENTIALS_STORAGE_KEY);
  if (!raw) {
    return { mobile: "", password: "", remember: false };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      mobile: String(parsed.mobile || ""),
      password: String(parsed.password || ""),
      remember: Boolean(parsed.remember),
    };
  } catch {
    return { mobile: "", password: "", remember: false };
  }
}

function PasswordVisibilityIcon({ visible }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {visible ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4 10 8a16.7 16.7 0 0 1-3.1 5.1" />
          <path d="M6.6 6.6A16.7 16.7 0 0 0 2 12c1.3 4 5 8 10 8a10.8 10.8 0 0 0 2.1-.2" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

/**
 * Login page using mobile number + password.
 *
 * @returns {JSX.Element}
 */
export default function LoginPage() {
  const { t } = useLang();
  const { changePassword, login } = useAuth();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    mobile: "",
    oldPassword: "",
    newPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePasswordMessage, setChangePasswordMessage] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const remembered = readRememberedCredentials();
    if (remembered.remember) {
      setMobile(remembered.mobile);
      setPassword(remembered.password);
      setRememberCredentials(true);
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(mobile, password);

      if (rememberCredentials) {
        globalThis.localStorage?.setItem(
          CREDENTIALS_STORAGE_KEY,
          JSON.stringify({
            mobile,
            password,
            remember: true,
          }),
        );
      } else {
        globalThis.localStorage?.removeItem(CREDENTIALS_STORAGE_KEY);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setChangePasswordMessage("");
    setChangePasswordError("");

    if (
      changePasswordForm.oldPassword === changePasswordForm.newPassword
    ) {
      setChangePasswordError(t.changePasswordDifferentError);
      return;
    }

    try {
      await changePassword(
        changePasswordForm.mobile,
        changePasswordForm.oldPassword,
        changePasswordForm.newPassword,
      );
      setChangePasswordForm({ mobile: "", oldPassword: "", newPassword: "" });
      setChangePasswordMessage(t.changePasswordSuccess);
    } catch (err) {
      setChangePasswordError(err.message);
    }
  }

  function updateChangePasswordField(field, value) {
    setChangePasswordForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1 className="login-card__title">MupporuL369</h1>
        <p className="login-card__subtitle">
          {showChangePassword ? t.changePasswordSubtitle : t.loginSubtitle}
        </p>

        {showChangePassword ? (
          <form className="login-card__form" onSubmit={handleChangePassword}>
            <label className="login-card__label" htmlFor="change-mobile-input">
              {t.mobileLabel}
            </label>
            <input
              id="change-mobile-input"
              className="login-card__input"
              type="tel"
              inputMode="numeric"
              placeholder="919876543210"
              value={changePasswordForm.mobile}
              onChange={(event) =>
                updateChangePasswordField("mobile", event.target.value)
              }
              required
            />

            <label className="login-card__label" htmlFor="old-password-input">
              {t.oldPasswordLabel}
            </label>
            <div className="login-card__password-field">
              <input
                id="old-password-input"
                className="login-card__input"
                type={showOldPassword ? "text" : "password"}
                value={changePasswordForm.oldPassword}
                onChange={(event) =>
                  updateChangePasswordField("oldPassword", event.target.value)
                }
                required
              />
              <button
                className="login-card__password-toggle"
                type="button"
                aria-label={showOldPassword ? "Hide old password" : "Show old password"}
                onClick={() => setShowOldPassword((visible) => !visible)}
              >
                <PasswordVisibilityIcon visible={showOldPassword} />
              </button>
            </div>

            <label className="login-card__label" htmlFor="new-password-input">
              {t.newPasswordLabel}
            </label>
            <div className="login-card__password-field">
              <input
                id="new-password-input"
                className="login-card__input"
                type={showNewPassword ? "text" : "password"}
                value={changePasswordForm.newPassword}
                onChange={(event) =>
                  updateChangePasswordField("newPassword", event.target.value)
                }
                required
              />
              <button
                className="login-card__password-toggle"
                type="button"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                onClick={() => setShowNewPassword((visible) => !visible)}
              >
                <PasswordVisibilityIcon visible={showNewPassword} />
              </button>
            </div>

            {changePasswordError && (
              <p className="login-card__error">{changePasswordError}</p>
            )}
            {changePasswordMessage && (
              <p className="login-card__success">{changePasswordMessage}</p>
            )}

            <button className="login-card__submit" type="submit">
              {t.changePasswordBtn}
            </button>
            <button
              className="login-card__link"
              type="button"
              onClick={() => {
                setShowChangePassword(false);
                setChangePasswordError("");
                setChangePasswordMessage("");
              }}
            >
              {t.backToLoginLink}
            </button>
          </form>
        ) : (
          <form className="login-card__form" onSubmit={handleSubmit}>
          <label className="login-card__label" htmlFor="mobile-input">
            {t.mobileLabel}
          </label>
          <input
            id="mobile-input"
            className="login-card__input"
            type="tel"
            inputMode="numeric"
            placeholder="919876543210"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            required
          />

          <label className="login-card__label" htmlFor="password-input">
            {t.passwordLabel}
          </label>
          <div className="login-card__password-field">
            <input
              id="password-input"
              className="login-card__input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              className="login-card__password-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {showPassword ? (
                  <>
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4 10 8a16.7 16.7 0 0 1-3.1 5.1" />
                    <path d="M6.6 6.6A16.7 16.7 0 0 0 2 12c1.3 4 5 8 10 8a10.8 10.8 0 0 0 2.1-.2" />
                  </>
                ) : (
                  <>
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <label className="login-card__remember">
            <input
              type="checkbox"
              checked={rememberCredentials}
              onChange={(event) => setRememberCredentials(event.target.checked)}
            />
            <span>{t.rememberCredentialsLabel}</span>
          </label>

          {error && <p className="login-card__error">{error}</p>}

          <button
            className="login-card__submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <InlineSpinner label={t.loading} />
            ) : (
              t.loginBtn
            )}
          </button>
            <button
              className="login-card__link"
              type="button"
              onClick={() => setShowChangePassword(true)}
            >
              {t.changePasswordLink}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
