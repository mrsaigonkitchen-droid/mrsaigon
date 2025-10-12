import { useState } from 'react';
import { loginWithEmailPassword } from './SessionGuard';

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
	const [email, setEmail] = useState('admin@example.com');
	const [password, setPassword] = useState('admin123');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);
	try {
		await loginWithEmailPassword(email, password);
		onSuccess();
	} catch {
		setError('Login failed');
	} finally {
		setSubmitting(false);
	}
	};

	return (
		<form onSubmit={submit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
			<input
				placeholder="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, width: 220 }}
			/>
			<input
				placeholder="password"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, width: 180 }}
			/>
			<button disabled={submitting} type="submit" style={{ padding: '8px 12px', borderRadius: 6, background: '#111827', color: 'white', border: 0 }}>
				{submitting ? 'Signing in…' : 'Login'}
			</button>
			{error && <span style={{ color: '#ef4444', marginLeft: 8 }}>{error}</span>}
		</form>
	);
}
