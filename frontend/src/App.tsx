import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Workspaces from './pages/Workspaces';
import WorkspaceDetail from './pages/WorkspaceDetail';
import ProtectedRoute from './components/ProtectedRoute';
import Search from './pages/Search';
import Chat from './pages/Chat';
import ConversationList from './pages/ConversationList';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/workspaces"
        element={
          <ProtectedRoute>
            <Workspaces />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:id"
        element={
          <ProtectedRoute>
            <WorkspaceDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:id/search"
        element={
       <ProtectedRoute>
         <Search />
       </ProtectedRoute>
       }
      />
      <Route
        path="/workspaces/:id/chat"
        element={
          <ProtectedRoute>
            <ConversationList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:id/chat/:conversationId"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/workspaces" replace />} />
    </Routes>
  );
}

export default App;