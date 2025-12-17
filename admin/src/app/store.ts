// Simple state management for Admin Dashboard
import { useState, useEffect } from 'react';
import type { User, Page } from './types';

// Global state
let currentUser: User | null = null;
let currentPage: Page | null = null;
const listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

export const store = {
  // User
  getUser: () => currentUser,
  setUser: (user: User | null) => {
    currentUser = user;
    notify();
  },

  // Page
  getPage: () => currentPage,
  setPage: (page: Page | null) => {
    currentPage = page;
    notify();
  },

  // Subscribe
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
};

// React hooks
export function useUser() {
  const [user, setUser] = useState<User | null>(store.getUser());

  useEffect(() => {
    return store.subscribe(() => {
      setUser(store.getUser());
    });
  }, []);

  return user;
}

export function usePage() {
  const [page, setPage] = useState<Page | null>(store.getPage());

  useEffect(() => {
    return store.subscribe(() => {
      setPage(store.getPage());
    });
  }, []);

  return page;
}

