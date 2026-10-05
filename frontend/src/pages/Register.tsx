import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, name);
      navigate('/workspaces');
    } catch (err: any) {
      setError(err.friendlyMessage || err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <ThemeToggle />
      <form onSubmit={handleSubmit} className="w-full max-w-sm px-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Create your account</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Start organizing your knowledge.</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg px-3 py-2 mb-3"
        />
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-sm text-[var(--text-secondary)] mt-4">
          Already have an account? <Link to="/login" className="text-[var(--accent)] font-medium">Log in</Link>
        </p>
      </form>
    </div>
  );
}