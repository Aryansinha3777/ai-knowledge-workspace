import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import api from '../api/client';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
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

  return (
    <div className="min-h-screen flex bg-white">
      <aside className="w-64 flex-shrink-0 bg-[#F7F7F8] border-r border-[#E4E4E7] flex flex-col">
        <div className="p-4 border-b border-[#E4E4E7]">
          <Link to="/workspaces" className="text-[15px] font-semibold text-[#27272A]">
            AI Knowledge Workspace
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs font-medium text-[#71717A] px-2 mb-2 mt-1">Workspaces</p>
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
                        ? 'bg-[#4F46E5]/10 text-[#4F46E5] font-medium'
                        : 'text-[#27272A] hover:bg-black/5'
                    }`}
                  >
                    <button
                      onClick={() => toggleExpand(ws.id)}
                      className="p-1.5 flex-shrink-0"
                    >
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </button>
                    <Link
                      to={`/workspaces/${ws.id}`}
                      className="flex-1 py-1.5 pr-2 truncate"
                    >
                      {ws.name}
                    </Link>
                  </div>

                  {isExpanded && (
                    <div className="ml-5 border-l border-[#E4E4E7] pl-2 mt-0.5 space-y-0.5">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`group flex items-center rounded-md text-xs transition-colors ${
                            activeConversationId === conv.id
                              ? 'bg-[#4F46E5]/10 text-[#4F46E5] font-medium'
                              : 'text-[#52525B] hover:bg-black/5'
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
                            className="p-1 mr-1 opacity-0 group-hover:opacity-100 text-[#71717A] hover:text-red-600 transition-opacity flex-shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleNewConversation(ws.id)}
                        className="flex items-center gap-1 text-xs text-[#71717A] hover:text-[#27272A] py-1.5 px-2 w-full"
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

        <div className="p-3 border-t border-[#E4E4E7]">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm text-[#27272A] truncate">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-[#71717A] hover:text-[#27272A]"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}