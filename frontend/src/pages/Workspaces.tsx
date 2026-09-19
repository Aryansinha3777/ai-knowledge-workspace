import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import { useWorkspaceContext } from '../context/WorkspaceContext';

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
  const { refreshWorkspaces } = useWorkspaceContext();

  async function fetchWorkspaces() {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data.data);
    } catch {
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
      refreshWorkspaces();
    } catch {
      setError('Failed to create workspace');
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/workspaces/${id}`);
      fetchWorkspaces();
      refreshWorkspaces();
    } catch {
      setError('Failed to delete workspace');
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-8 py-12">
        <h1 className="text-2xl font-semibold text-[#27272A] mb-1">Your workspaces</h1>
        <p className="text-sm text-[#71717A] mb-8">
          Organize your documents into focused knowledge spaces.
        </p>

        <form onSubmit={handleCreate} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="New workspace name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 border border-[#E4E4E7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
          />
          <button
            type="submit"
            className="bg-[#4F46E5] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            Create
          </button>
        </form>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-sm text-[#71717A]">Loading...</p>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#E4E4E7] rounded-lg">
            <p className="text-sm text-[#71717A]">No workspaces yet — create one above to get started.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {workspaces.map((ws) => (
              <li
                key={ws.id}
                className="group flex justify-between items-center px-4 py-3 rounded-lg hover:bg-[#F7F7F8] transition-colors"
              >
                <Link to={`/workspaces/${ws.id}`} className="text-sm text-[#27272A] font-medium">
                  {ws.name}
                </Link>
                <button
                  onClick={() => handleDelete(ws.id)}
                  className="text-xs text-[#71717A] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}