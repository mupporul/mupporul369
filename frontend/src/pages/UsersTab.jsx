import { useEffect, useState } from "react";
import { useLang } from "../context/LangContext";
import InlineSpinner from "../components/InlineSpinner";
import "./UsersTab.css";

/**
 * Users management tab — admin only.
 * Displays list of users with delete option and add new user form.
 *
 * @param {{ authFetch: Function }} props
 * @returns {JSX.Element}
 */
export default function UsersTab({ authFetch }) {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [dataFiles, setDataFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importingFile, setImportingFile] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    mobile: "",
    password: "",
    name: "",
    initials: "",
    role: "contributor",
  });

  useEffect(() => {
    fetchUsers();
    fetchDataFiles();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await authFetch("/api/users");
      if (!response.ok) {
        throw new Error(`Failed to fetch users (${response.status})`);
      }
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDataFiles() {
    try {
      const response = await authFetch("/api/export/files");
      if (!response.ok) {
        throw new Error(`Failed to fetch data files (${response.status})`);
      }
      const files = await response.json();
      setDataFiles(files);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleExportFile(fileName) {
    try {
      const response = await authFetch(`/api/export/download/${fileName}`);
      if (!response.ok) {
        throw new Error(`Export failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleImportFile(event) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name;
    if (!fileName.toLowerCase().endsWith(".json")) {
      setError(t.usersFileTypeError);
      return;
    }

    try {
      setImportingFile(true);
      const text = await selectedFile.text();
      const parsedData = JSON.parse(text);

      const response = await authFetch(`/api/export/import/${fileName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsedData }),
      });

      if (!response.ok) {
        throw new Error(`Import failed (${response.status})`);
      }

      await fetchUsers();
      await fetchDataFiles();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setImportingFile(false);
      event.target.value = "";
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    if (
      !newUser.mobile ||
      !newUser.password ||
      !newUser.name ||
      !newUser.initials
    ) {
      setError("Please fill all fields");
      return;
    }

    try {
      setAddingUser(true);
      const response = await authFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error(`Failed to add user (${response.status})`);
      }

      setNewUser({
        mobile: "",
        password: "",
        name: "",
        initials: "",
        role: "contributor",
      });
      await fetchUsers();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingUser(false);
    }
  }

  async function handleDeleteUser(userId) {
    try {
      setDeletingUserId(userId);
      const response = await authFetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user (${response.status})`);
      }

      await fetchUsers();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingUserId(null);
    }
  }

  if (loading && users.length === 0) {
    return (
      <p className="users-tab__status" role="status">
        {t.loading}
      </p>
    );
  }

  return (
    <div className="users-tab">
      {error && (
        <p className="users-tab__error" role="alert">
          {t.errorPrefix}: {error}
        </p>
      )}

      <div className="users-tab__section">
        <h2 className="users-tab__title">{t.usersBackupTitle}</h2>
        <p className="users-tab__desc">{t.usersBackupDescription}</p>
        <div className="users-tab__file-actions">
          {dataFiles.map((fileName) => (
            <button
              key={fileName}
              type="button"
              className="users-tab__btn-export"
              onClick={() => handleExportFile(fileName)}
            >
              {t.exportBtn}: {fileName}
            </button>
          ))}
        </div>
        <label className="users-tab__import-label" htmlFor="users-tab-import">
          {importingFile ? t.loading : t.importBtn}
        </label>
        <input
          id="users-tab-import"
          className="users-tab__import-input"
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          disabled={importingFile}
        />
      </div>

      <div className="users-tab__section">
        <h2 className="users-tab__title">{t.usersAddTitle}</h2>
        <form className="users-tab__form" onSubmit={handleAddUser}>
          <label className="users-tab__label" htmlFor="users-mobile-input">
            Mobile
          </label>
          <input
            id="users-mobile-input"
            type="text"
            placeholder="Mobile (12 digits)"
            aria-label="Mobile"
            value={newUser.mobile}
            onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
            className="users-tab__input"
            maxLength="12"
          />
          <label className="users-tab__label" htmlFor="users-password-input">
            Password
          </label>
          <input
            id="users-password-input"
            type="password"
            placeholder="Password"
            aria-label="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            className="users-tab__input"
          />
          <label className="users-tab__label" htmlFor="users-name-input">
            Name
          </label>
          <input
            id="users-name-input"
            type="text"
            placeholder="Name"
            aria-label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="users-tab__input"
          />
          <label className="users-tab__label" htmlFor="users-initials-input">
            Initials
          </label>
          <input
            id="users-initials-input"
            type="text"
            placeholder="Initials (2 chars)"
            aria-label="Initials"
            value={newUser.initials}
            onChange={(e) =>
              setNewUser({ ...newUser, initials: e.target.value.toUpperCase() })
            }
            className="users-tab__input"
            maxLength="2"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="users-tab__select"
          >
            <option value="user">User</option>
            <option value="contributor">Contributor</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="users-tab__btn-add"
            disabled={addingUser}
          >
            {addingUser ? <InlineSpinner label={t.loading} /> : t.usersAddSubmitBtn}
          </button>
        </form>
      </div>

      <div className="users-tab__section">
        <h2 className="users-tab__title">{t.usersListTitle}</h2>
        {users.length === 0 ? (
          <p className="users-tab__status">{t.noResults}</p>
        ) : (
          <ul className="users-tab__list">
            {users.map((user) => (
              <li key={user.id} className="users-tab__item">
                <div className="users-tab__user-info">
                  <p className="users-tab__user-mobile">
                    {user.name || user.initials}
                  </p>
                  <p className="users-tab__user-mobile">{user.mobile}</p>
                  <p className="users-tab__user-meta">
                    {user.initials} • {user.role}
                  </p>
                </div>
                <button
                  className="users-tab__btn-delete"
                  onClick={() => handleDeleteUser(user.id)}
                  aria-label={t.deleteBtn}
                  disabled={deletingUserId === user.id}
                >
                  {deletingUserId === user.id ? (
                    <InlineSpinner label={t.loading} />
                  ) : (
                    t.deleteBtn
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
