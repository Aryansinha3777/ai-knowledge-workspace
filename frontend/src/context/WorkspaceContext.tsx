import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import api from '../api/client';

interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const refreshWorkspaces = useCallback(async () => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data.data);
    } catch {
      // silently ignore — sidebar just shows empty list if this fails
    }
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspaces, refreshWorkspaces }}>
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