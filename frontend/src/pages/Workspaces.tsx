import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import { FolderOpen, FileText, MessageSquare, FolderPlus } from 'lucide-react';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import EmptyState from '../components/EmptyState';

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

interface DashboardData {
  counts: { workspaces: number; documents: number; conversations: number };
  recentDocuments: {
    id: string;
    filename: string;
    status: string;
    createdAt: string;
    workspaceId: string;
    workspace: { name: string };
  }[];
  recentConversations: {
    id: string;
    title: string | null;
    updatedAt: string;
    workspaceId: string;
    workspace: { name: string };
  }[];
}

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { refreshWorkspaces } = useWorkspaceContext();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

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

  async function fetchDashboard() {
  try {
    const res = await api.get('/dashboard');
    setDashboard(res.data.data);
  } catch {
    // dashboard is supplementary — fail silently, don't block the page
  }
}

  useEffect(() => {
    fetchWorkspaces();
    fetchDashboard();
  }, []);

  function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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

{dashboard && (
  <>
    <div className="grid grid-cols-3 gap-3 mb-8">
  <div className="border border-[#E4E4E7] rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-md bg-[#4F46E5]/10 flex items-center justify-center">
        <FolderOpen size={14} className="text-[#4F46E5]" />
      </div>
      <span className="text-xs font-medium text-[#71717A]">Workspaces</span>
    </div>
    <p className="text-2xl font-semibold text-[#4F46E5]">{dashboard.counts.workspaces}</p>
  </div>
  <div className="border border-[#E4E4E7] rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-md bg-[#4F46E5]/10 flex items-center justify-center">
        <FileText size={14} className="text-[#4F46E5]" />
      </div>
      <span className="text-xs font-medium text-[#71717A]">Documents</span>
    </div>
    <p className="text-2xl font-semibold text-[#4F46E5]">{dashboard.counts.documents}</p>
  </div>
  <div className="border border-[#E4E4E7] rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-md bg-[#4F46E5]/10 flex items-center justify-center">
        <MessageSquare size={14} className="text-[#4F46E5]" />
      </div>
      <span className="text-xs font-medium text-[#71717A]">Conversations</span>
    </div>
    <p className="text-2xl font-semibold text-[#4F46E5]">{dashboard.counts.conversations}</p>
  </div>
</div>

    {(dashboard.recentDocuments.length > 0 || dashboard.recentConversations.length > 0) && (
      <div className="mb-8">
        <p className="text-xs font-medium text-[#71717A] mb-2">Recent activity</p>
        <div className="border border-[#E4E4E7] rounded-lg divide-y divide-[#E4E4E7]">
          {dashboard.recentDocuments.slice(0, 3).map((doc) => (
            <Link
              key={doc.id}
              to={`/workspaces/${doc.workspaceId}`}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-[#F7F7F8] transition-colors"
            >
              <span className="text-sm text-[#27272A] truncate">
                {doc.filename} <span className="text-[#71717A]">in {doc.workspace.name}</span>
              </span>
              <span className="text-xs text-[#71717A] flex-shrink-0 ml-3">
                {timeAgo(doc.createdAt)}
              </span>
            </Link>
          ))}
          {dashboard.recentConversations.slice(0, 2).map((conv) => (
            <Link
              key={conv.id}
              to={`/workspaces/${conv.workspaceId}/chat/${conv.id}`}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-[#F7F7F8] transition-colors"
            >
              <span className="text-sm text-[#27272A] truncate">
                {conv.title || 'Untitled'} <span className="text-[#71717A]">in {conv.workspace.name}</span>
              </span>
              <span className="text-xs text-[#71717A] flex-shrink-0 ml-3">
                {timeAgo(conv.updatedAt)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    )}
  </>
)}

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
            className="bg-[#4F46E5] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors btn-press"
          >
            Create
          </button>
        </form>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-sm text-[#71717A]">Loading...</p>
          ) : workspaces.length === 0 ? (
            <EmptyState
              icon={FolderPlus}
              title="No workspaces yet"
              description="Create your first workspace above to start organizing your documents."
            />
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