// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (err) {
      setError('האימייל או הסיסמה שגויים');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', direction: 'rtl' }}>
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ marginBottom: '2rem' }}>התחברות</h1>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">אימייל</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">סיסמה</label>
          <input
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button type="submit" style={{ padding: '0.75rem', width: '100%', backgroundColor: '#0070f3', color: '#fff', border: 'none' }}>
          התחבר
        </button>
      </form>
    </div>
  );
}
