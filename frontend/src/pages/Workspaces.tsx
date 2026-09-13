import { useEffect, useState, FormEvent } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function fetchWorkspaces() {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data.data);
    } catch (err: any) {
      setError('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await api.post('/workspaces', { name: newName });
      setNewName('');
      fetchWorkspaces();
    } catch (err: any) {
      setError('Failed to create workspace');
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/workspaces/${id}`);
      fetchWorkspaces();
    } catch (err: any) {
      setError('Failed to delete workspace');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-800">
            Welcome{user?.name ? `, ${user.name}` : ''}
          </h1>
            <button
            onClick={() => {
                logout();
                navigate('/login');
            }}
            className="text-sm text-slate-500 underline"
            >
            Log out
            </button>
        </div>

        <form onSubmit={handleCreate} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="New workspace name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 border border-slate-300 rounded px-3 py-2"
          />
          <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700">
            Create
          </button>
        </form>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-slate-500">Loading workspaces...</p>
        ) : workspaces.length === 0 ? (
          <p className="text-slate-500">No workspaces yet. Create one above.</p>
        ) : (
          <ul className="space-y-2">
            {workspaces.map((ws) => (
              <li key={ws.id} className="bg-white p-4 rounded shadow-sm flex justify-between items-center">
                <Link to={`/workspaces/${ws.id}`} className="text-slate-800 hover:underline">
                   {ws.name}
                </Link>
                <button
                  onClick={() => handleDelete(ws.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}