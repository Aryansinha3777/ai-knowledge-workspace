import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ConversationList() {
  const { id: workspaceId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function fetchConversations() {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/conversations`);
      setConversations(res.data.data);
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConversations();
  }, [workspaceId]);

  async function handleNewConversation() {
    try {
      const res = await api.post(`/workspaces/${workspaceId}/conversations`, {
        title: 'New Conversation',
      });
      navigate(`/workspaces/${workspaceId}/chat/${res.data.data.id}`);
    } catch (err) {
      setError('Failed to create conversation');
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to={`/workspaces/${workspaceId}`} className="text-sm text-slate-500 hover:underline">
          ← Back to workspace
        </Link>

        <div className="flex justify-between items-center mt-2 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Conversations</h1>
          <button
            onClick={handleNewConversation}
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 text-sm"
          >
            + New Conversation
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-slate-500">Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <p className="text-slate-500">No conversations yet. Start one above.</p>
        ) : (
          <ul className="space-y-2">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <Link
                  to={`/workspaces/${workspaceId}/chat/${conv.id}`}
                  className="block bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-slate-800">{conv.title || 'Untitled conversation'}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Last updated {formatDate(conv.updatedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}