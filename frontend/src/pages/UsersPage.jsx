import { useState } from "react";

import { useUsers } from "../hooks/useUsers";

const INITIAL_FORM = {
  mobile: "",
  password: "",
  name: "",
  initials: "",
  role: "contributor",
};

/**
 * User management page for listing, creating, and deleting users.
 *
 * @returns {JSX.Element} Users page.
 */
export default function UsersPage() {
  const { users, isLoading, error, createUser, deleteUser } = useUsers();
  const [form, setForm] = useState(INITIAL_FORM);
  const [actionError, setActionError] = useState("");

  const onField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setActionError("");
    try {
      await createUser(form);
      setForm(INITIAL_FORM);
    } catch (submitError) {
      setActionError(submitError.message);
    }
  };

  const remove = async (userId) => {
    setActionError("");
    try {
      await deleteUser(userId);
    } catch (deleteError) {
      setActionError(deleteError.message);
    }
  };

  return (
    <section className="page-stack">
      <h2>Users</h2>
      {error ? <p className="error-text">{error}</p> : null}
      {actionError ? <p className="error-text">{actionError}</p> : null}
      <form
        className="surface-card form-grid users-page__form"
        onSubmit={submit}
      >
        <label className="label">
          Mobile
          <input
            className="field"
            value={form.mobile}
            onChange={(event) => onField("mobile", event.target.value)}
          />
        </label>
        <label className="label">
          Password
          <input
            className="field"
            type="password"
            value={form.password}
            onChange={(event) => onField("password", event.target.value)}
          />
        </label>
        <label className="label">
          Name
          <input
            className="field"
            value={form.name}
            onChange={(event) => onField("name", event.target.value)}
          />
        </label>
        <label className="label">
          Initials
          <input
            className="field"
            value={form.initials}
            onChange={(event) => onField("initials", event.target.value)}
          />
        </label>
        <label className="label">
          Role
          <select
            className="select"
            value={form.role}
            onChange={(event) => onField("role", event.target.value)}
          >
            <option value="user">User</option>
            <option value="contributor">Contributor</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button type="submit" className="button">
          Create User
        </button>
      </form>
      {isLoading ? <p className="status-text">Loading users...</p> : null}
      <ul className="stagger-list users-page__list">
        {users.map((user) => (
          <li key={user.id} className="surface-card users-page__item">
            <div>
              <p>
                <strong>{user.name || user.mobile}</strong>
              </p>
              <p className="helper-text">
                {user.mobile} · {user.role}
              </p>
            </div>
            <button
              type="button"
              className="danger-button"
              onClick={() => remove(user.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
