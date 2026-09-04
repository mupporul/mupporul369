import { useState } from "react";

import { useAuth } from "../context/AuthContext";

/**
 * Login screen for mobile and password authentication.
 *
 * @returns {JSX.Element} Login page.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(mobile, password);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app-shell fade-in">
      <section className="surface-card page-stack login-page">
        <h1>Mupporul 369</h1>
        <p className="helper-text">Sign in with your mobile number.</p>
        <form className="form-grid" onSubmit={submit}>
          <label className="label">
            Mobile
            <input
              className="field"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              required
            />
          </label>
          <label className="label">
            Password
            <input
              className="field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" className="button" disabled={busy}>
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
