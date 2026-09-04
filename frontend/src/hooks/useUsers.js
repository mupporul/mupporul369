import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

const readJsonSafely = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

/**
 * Loads users and exposes create/delete actions.
 *
 * @returns {object} User state and mutation helpers.
 */
export function useUsers() {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authFetch("/api/users");
      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load users.");
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (payload) => {
    const response = await authFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await readJsonSafely(response);

    if (!response.ok) {
      throw new Error(data?.message || "Unable to create user.");
    }

    setUsers((currentUsers) => [...currentUsers, data]);
    return data;
  };

  const deleteUser = async (userId) => {
    const response = await authFetch(`/api/users/${userId}`, {
      method: "DELETE",
    });
    const data = await readJsonSafely(response);

    if (!response.ok) {
      throw new Error(data?.message || "Unable to delete user.");
    }

    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId),
    );
    return data;
  };

  return {
    users,
    isLoading,
    error,
    loadUsers,
    createUser,
    deleteUser,
  };
}
