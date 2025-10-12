import { PropsWithChildren, useEffect, useState } from 'react';

export type SessionUser = { id: string; email: string; role: 'ADMIN' | 'MANAGER' | 'VIEWER' };

export function SessionGuard({ children, fallback }: PropsWithChildren<{ fallback: React.ReactNode }>) {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch('http://localhost:4202/auth/me', { credentials: 'include' })
      .then(async (r) => (r.ok ? ((await r.json()) as SessionUser) : null))
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (user === undefined) return <div style={{ padding: 16 }}>Checking session…</div>;
  if (!user) return <>{fallback}</>;
  return <>{children}</>;
}

export async function loginWithEmailPassword(email: string, password: string): Promise<SessionUser> {
  const res = await fetch('http://localhost:4202/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = (await res.json()) as { user?: SessionUser } | SessionUser;
  return 'user' in data ? (data.user as SessionUser) : (data as SessionUser);
}

export async function logoutSession(): Promise<void> {
  await fetch('http://localhost:4202/auth/logout', { method: 'POST', credentials: 'include' });
}


