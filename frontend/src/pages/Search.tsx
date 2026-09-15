import { useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

interface SearchResult {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  filename: string;
  similarity: number;
}

export default function Search() {
  const { id: workspaceId } = useParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await api.get('/search', {
        params: { query, workspaceId },
      });
      setResults(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to={`/workspaces/${workspaceId}`} className="text-sm text-slate-500 hover:underline">
          ← Back to workspace
        </Link>

        <h1 className="text-2xl font-semibold text-slate-800 mt-2 mb-6">Semantic Search</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search this workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border border-slate-300 rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {searched && !loading && results.length === 0 && !error && (
          <p className="text-slate-500">No results found.</p>
        )}

        <ul className="space-y-3">
          {results.map((r) => (
            <li key={r.id} className="bg-white p-4 rounded shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">{r.filename}</span>
                <span className="text-xs text-slate-400">
                  Similarity: {r.similarity.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-slate-600">{r.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}