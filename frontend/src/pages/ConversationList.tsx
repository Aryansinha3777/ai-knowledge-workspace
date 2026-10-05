import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import { MessageSquarePlus } from 'lucide-react';

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
    } catch {
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
    } catch {
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
    <Layout>
      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Conversations</h1>
          <button
            onClick={handleNewConversation}
            className="bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[var(--accent-hover)] transition-colors btn-press"
          >
            New conversation
          </button>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-8">Your Q&A history for this workspace.</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquarePlus}
            title="No conversations yet"
            description="Start a new conversation above to ask questions about your documents."
          />
        ) : (
          <ul className="space-y-1">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <Link
                  to={`/workspaces/${workspaceId}/chat/${conv.id}`}
                  className="block px-4 py-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {conv.title || 'Untitled conversation'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Last updated {formatDate(conv.updatedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}