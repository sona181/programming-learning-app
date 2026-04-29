"use client";

export const CURRENT_USER_STORAGE_KEY = "programming-learning-app.currentUser";

export type StoredCurrentUser = {
  email: string;
  id: string;
  role: string;
};

export function saveCurrentUser(user: StoredCurrentUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredCurrentUser;
  } catch {
    window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    return null;
  }
}
