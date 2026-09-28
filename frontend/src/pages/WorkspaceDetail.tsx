import { useEffect, useState, type ChangeEvent } from 'react';
import { useParams, Link , useNavigate } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';


interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

const STATUS_STYLES: Record<Document['status'], string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  FAILED: 'bg-red-50 text-red-700',
};

export default function WorkspaceDetail() {
  const { id: workspaceId } = useParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const navigate = useNavigate();

  async function fetchDocuments() {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/documents`);
      setDocuments(res.data.data);
    } catch {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  async function handleAskAI() {
  try {
    const res = await api.post(`/workspaces/${workspaceId}/conversations`, {
      title: 'New Conversation',
    });
    navigate(`/workspaces/${workspaceId}/chat/${res.data.data.id}`);
  } catch {
    setError('Failed to start conversation');
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
    const interval = setInterval(fetchDocuments, 3000);
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
    } catch {
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
    <Layout>
      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-semibold text-[#27272A]">Documents</h1>
          <div className="flex gap-4">
            <Link to={`/workspaces/${workspaceId}/search`} className="text-sm text-[#4F46E5] font-medium">
              Search
            </Link>
            <button onClick={handleAskAI} className="text-sm text-[#4F46E5] font-medium">
              Ask AI
            </button>
          </div>
        </div>
        <p className="text-sm text-[#71717A] mb-8">Upload PDF, TXT, or Markdown files.</p>

        <label className="inline-block mb-8">
          <span className="inline-block bg-[#4F46E5] text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer hover:bg-[#4338CA] transition-colors">
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
          <p className="text-sm text-[#71717A]">Loading...</p>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#E4E4E7] rounded-lg">
            <p className="text-sm text-[#71717A]">No documents yet — upload one above.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {documents.map((doc) => (
              <li key={doc.id} className="px-4 py-3 rounded-lg hover:bg-[#F7F7F8] transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-[#27272A]">{doc.filename}</p>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      {doc.fileType.toUpperCase()} · {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[doc.status]}`}>
                      {doc.status}
                    </span>
                    {doc.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleSummarize(doc.id)}
                        disabled={summarizing === doc.id}
                        className="text-xs text-[#71717A] hover:text-[#27272A] disabled:opacity-50"
                      >
                        {summarizing === doc.id ? 'Summarizing...' : 'Summarize'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-xs text-[#71717A] hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {summaries[doc.id] && (
                  <div className="mt-3 pt-3 border-t border-[#E4E4E7] text-sm text-[#52525B] whitespace-pre-line">
                    {summaries[doc.id]}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}