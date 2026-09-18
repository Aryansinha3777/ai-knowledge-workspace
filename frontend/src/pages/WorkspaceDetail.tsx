import { useEffect, useState, ChangeEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

const STATUS_STYLES: Record<Document['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default function WorkspaceDetail() {
  const { id: workspaceId } = useParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summarizing, setSummarizing] = useState<string | null>(null);

  async function fetchDocuments() {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/documents`);
      setDocuments(res.data.data);
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

useEffect(() => {
  fetchDocuments();
}, [workspaceId]);

useEffect(() => {
  const hasPendingDocs = documents.some(
    (doc) => doc.status === 'PENDING' || doc.status === 'PROCESSING'
  );

  if (!hasPendingDocs) return;

  const interval = setInterval(() => {
    fetchDocuments();
  }, 3000);

  return () => clearInterval(interval);
}, [documents]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/workspaces/${workspaceId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(docId: string) {
    try {
      await api.delete(`/documents/${docId}`);
      fetchDocuments();
    } catch (err) {
      setError('Failed to delete document');
    }
  }

  async function handleSummarize(docId: string) {
  setSummarizing(docId);
  setError('');
  try {
    const res = await api.post(`/documents/${docId}/summarize`);
    setSummaries((prev) => ({ ...prev, [docId]: res.data.data.summary }));
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to summarize');
  } finally {
    setSummarizing(null);
  }
}

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/workspaces" className="text-sm text-slate-500 hover:underline">
          ← Back to workspaces
        </Link>

        <Link
          to={`/workspaces/${workspaceId}/search`}
          className="text-sm text-slate-800 underline ml-4"
        >
          Search this workspace →
        </Link>

        <Link
           to={`/workspaces/${workspaceId}/chat`}
           className="text-sm text-slate-800 underline ml-4"
        >
         Ask AI →
        </Link>

        <h1 className="text-2xl font-semibold text-slate-800 mt-2 mb-6">Documents</h1>

        <label className="block mb-6">
          <span className="inline-block bg-slate-800 text-white px-4 py-2 rounded cursor-pointer hover:bg-slate-700">
            {uploading ? 'Uploading...' : 'Upload document'}
          </span>
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-slate-500">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-slate-500">No documents yet. Upload one above.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="bg-white p-4 rounded shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-800">{doc.filename}</p>
                    <p className="text-xs text-slate-400">
                      {doc.fileType.toUpperCase()} · {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${STATUS_STYLES[doc.status]}`}>
                      {doc.status}
                    </span>
                    {doc.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleSummarize(doc.id)}
                        disabled={summarizing === doc.id}
                        className="text-slate-600 text-sm hover:underline disabled:opacity-50"
                      >
                        {summarizing === doc.id ? 'Summarizing...' : 'Summarize'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {summaries[doc.id] && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600 whitespace-pre-line">
                    {summaries[doc.id]}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}