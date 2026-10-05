import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/workspaces');
    } catch (err: any) {
      setError(err.friendlyMessage || err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <ThemeToggle />
      <form onSubmit={handleSubmit} className="w-full max-w-sm px-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Welcome back</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Log in to your knowledge workspace.</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg px-3 py-2 mb-3"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg px-3 py-2 mb-4"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--accent)] text-white rounded-lg py-2 hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors btn-press"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-sm text-[var(--text-secondary)] mt-4">
          No account? <Link to="/register" className="text-[var(--accent)] font-medium">Register</Link>
        </p>
      </form>
    </div>
  );
}