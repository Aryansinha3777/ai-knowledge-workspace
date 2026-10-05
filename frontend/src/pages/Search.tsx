import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import { SearchX } from 'lucide-react';

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
      const res = await api.get('/search', { params: { query, workspaceId } });
      setResults(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-8 py-12">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Search</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Find relevant content across your documents by meaning, not just keywords.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Search this workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors btn-press"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {searched && !loading && results.length === 0 && !error && (
          <EmptyState
            icon={SearchX}
            title="No results found"
            description="Try a different phrase, or make sure your documents have finished processing."
          />
        )}

        <ul className="space-y-3">
          {results.map((r) => (
            <li key={r.id} className="p-4 rounded-lg border border-[var(--border-color)]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-[var(--text-primary)]">{r.filename}</span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {(r.similarity * 100).toFixed(0)}% match
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{r.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}