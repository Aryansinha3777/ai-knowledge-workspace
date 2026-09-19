import { useEffect, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspaceContext } from '../context/WorkspaceContext';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { workspaces, refreshWorkspaces } = useWorkspaceContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    refreshWorkspaces();
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const activeWorkspaceId = location.pathname.match(/\/workspaces\/([^/]+)/)?.[1];

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
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                to={`/workspaces/${ws.id}`}
                className={`block px-2 py-1.5 rounded-md text-sm truncate transition-colors ${
                  activeWorkspaceId === ws.id
                    ? 'bg-[#4F46E5]/10 text-[#4F46E5] font-medium'
                    : 'text-[#27272A] hover:bg-black/5'
                }`}
              >
                {ws.name}
              </Link>
            ))}
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