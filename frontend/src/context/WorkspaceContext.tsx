import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import api from '../api/client';

interface Workspace {
  id: string;
  name: string;
}

interface Conversation {
  id: string;
  title: string | null;
  updatedAt: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  conversationsByWorkspace: Record<string, Conversation[]>;
  refreshWorkspaces: () => Promise<void>;
  refreshConversations: (workspaceId: string) => Promise<void>;
  removeConversationFromState: (workspaceId: string, conversationId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [conversationsByWorkspace, setConversationsByWorkspace] = useState<
    Record<string, Conversation[]>
  >({});

  const refreshWorkspaces = useCallback(async () => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data.data);
    } catch {
      // ignore
    }
  }, []);

  const refreshConversations = useCallback(async (workspaceId: string) => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/conversations`);
      setConversationsByWorkspace((prev) => ({ ...prev, [workspaceId]: res.data.data }));
    } catch {
      // ignore
    }
  }, []);

  const removeConversationFromState = useCallback((workspaceId: string, conversationId: string) => {
    setConversationsByWorkspace((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).filter((c) => c.id !== conversationId),
    }));
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        conversationsByWorkspace,
        refreshWorkspaces,
        refreshConversations,
        removeConversationFromState,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within WorkspaceProvider');
  }
  return context;
}