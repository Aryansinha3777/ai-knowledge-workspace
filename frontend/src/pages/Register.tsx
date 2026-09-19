import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
  <form onSubmit={handleSubmit} className="w-full max-w-sm px-8">
    <h1 className="text-2xl font-semibold text-[#27272A] mb-1">Create your account</h1>
    <p className="text-sm text-[#71717A] mb-6">Start organizing your knowledge.</p>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-[#E4E4E7] rounded-lg px-3 py-2 mb-3"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[#E4E4E7] rounded-lg px-3 py-2 mb-3"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[#E4E4E7] rounded-lg px-3 py-2 mb-3"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4F46E5] text-white rounded-lg py-2 hover:bg-[#4338CA] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-sm text-slate-500 mt-4">
          Already have an account? <Link to="/login" className="text-[#4F46E5] font-medium">Log in</Link>
        </p>
      </form>
    </div>
  );
}