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

/**
 * Login page using mobile number + password.
 *
 * @returns {JSX.Element}
 */
export default function LoginPage() {
  const { t } = useLang();
  const { login } = useAuth();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <main className="login-page">
      <section className="login-card">
        <h1 className="login-card__title">MupporuL369</h1>
        <p className="login-card__subtitle">{t.loginSubtitle}</p>

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
          <input
            id="password-input"
            className="login-card__input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

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
        </form>
      </section>
    </main>
  );
}
