import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Trash2, Plus, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    workspaces,
    conversationsByWorkspace,
    refreshWorkspaces,
    refreshConversations,
    removeConversationFromState,
  } = useWorkspaceContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { conversationId: activeConversationId } = useParams();

  const activeWorkspaceId = location.pathname.match(/\/workspaces\/([^/]+)/)?.[1];

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    refreshWorkspaces();
  }, []);

  useEffect(() => {
    if (activeWorkspaceId) {
      setExpanded((prev) => ({ ...prev, [activeWorkspaceId]: true }));
      refreshConversations(activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  function toggleExpand(workspaceId: string) {
    const isExpanding = !expanded[workspaceId];
    setExpanded((prev) => ({ ...prev, [workspaceId]: isExpanding }));
    if (isExpanding && !conversationsByWorkspace[workspaceId]) {
      refreshConversations(workspaceId);
    }
  }

  async function handleNewConversation(workspaceId: string) {
    try {
      const res = await api.post(`/workspaces/${workspaceId}/conversations`, {
        title: 'New Conversation',
      });
      refreshConversations(workspaceId);
      navigate(`/workspaces/${workspaceId}/chat/${res.data.data.id}`);
    } catch {
      // ignore
    }
  }

  async function handleDeleteConversation(workspaceId: string, conversationId: string) {
    try {
      await api.delete(`/conversations/${conversationId}`);
      removeConversationFromState(workspaceId, conversationId);
      if (activeConversationId === conversationId) {
        navigate(`/workspaces/${workspaceId}`);
      }
    } catch {
      // ignore
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const activeConversation = activeWorkspaceId
    ? (conversationsByWorkspace[activeWorkspaceId] || []).find((c) => c.id === activeConversationId)
    : undefined;

  const pathSegment = location.pathname.split('/').pop();

  type Crumb = { label: string; to?: string };
  const crumbs: Crumb[] = [{ label: 'Workspaces', to: '/workspaces' }];

  if (activeWorkspace) {
    crumbs.push({
      label: activeWorkspace.name,
      to:
        activeConversationId || pathSegment === 'search' || pathSegment === 'chat'
          ? `/workspaces/${activeWorkspace.id}`
          : undefined,
    });

    if (activeConversationId) {
      crumbs.push({ label: activeConversation?.title || 'Conversation' });
    } else if (pathSegment === 'search') {
      crumbs.push({ label: 'Search' });
    } else if (pathSegment === 'chat') {
      crumbs.push({ label: 'Conversations' });
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      <aside className="w-64 flex-shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col">
        <div className="p-4 border-b border-[var(--border-color)]">
          <Link to="/workspaces" className="text-[15px] font-semibold text-[var(--text-primary)]">
            AI Knowledge Workspace
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs font-medium text-[var(--text-secondary)] px-2 mb-2 mt-1">Workspaces</p>
          <nav className="space-y-0.5">
            {workspaces.map((ws) => {
              const isExpanded = !!expanded[ws.id];
              const isActiveWorkspace = activeWorkspaceId === ws.id;
              const conversations = conversationsByWorkspace[ws.id] || [];

              return (
                <div key={ws.id}>
                  <div
                    className={`group flex items-center rounded-md text-sm transition-colors ${
                      isActiveWorkspace && !activeConversationId
                        ? 'bg-[var(--accent-tint)] text-[var(--accent)] font-medium'
                        : 'text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <button onClick={() => toggleExpand(ws.id)} className="p-1.5 flex-shrink-0">
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </button>
                    <Link to={`/workspaces/${ws.id}`} className="flex-1 py-1.5 pr-2 truncate">
                      {ws.name}
                    </Link>
                  </div>

                  {isExpanded && (
                    <div className="ml-5 border-l border-[var(--border-color)] pl-2 mt-0.5 space-y-0.5">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`group flex items-center rounded-md text-xs transition-colors ${
                            activeConversationId === conv.id
                              ? 'bg-[var(--accent-tint)] text-[var(--accent)] font-medium'
                              : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <Link
                            to={`/workspaces/${ws.id}/chat/${conv.id}`}
                            className="flex-1 py-1.5 px-2 truncate"
                          >
                            {conv.title || 'Untitled'}
                          </Link>
                          <button
                            onClick={() => handleDeleteConversation(ws.id, conv.id)}
                            className="p-1 mr-1 opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-500 transition-opacity flex-shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleNewConversation(ws.id)}
                        className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-1.5 px-2 w-full"
                      >
                        <Plus size={12} /> New chat
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            <span className="text-sm text-[var(--text-primary)] truncate">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Log out
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 w-full"
          >
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col">
        {crumbs.length > 1 && (
          <div className="flex items-center gap-1 px-8 pt-4 text-sm text-[var(--text-secondary)] flex-shrink-0">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={14} className="text-[var(--border-color)]" />}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-[var(--text-primary)] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--text-primary)] font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}