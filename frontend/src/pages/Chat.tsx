import { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

interface Source {
  documentId: string;
  filename: string;
  chunkIndex: number;
  similarity: number;
}

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  sources: Source[] | null;
}

export default function Chat() {
  const { id: workspaceId, conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
const [loading, setLoading] = useState(true);
const [question, setQuestion] = useState('');
const [asking, setAsking] = useState(false);
const [error, setError] = useState('');
const bottomRef = useRef<HTMLDivElement>(null);

async function loadConversation() {
  try {
    const res = await api.get(`/conversations/${conversationId}`);
    setMessages(res.data.data.messages);
  } catch (err) {
    setError('Failed to load conversation');
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  loadConversation();
}, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleAsk(e: FormEvent) {
    e.preventDefault();
    if (!question.trim() || !conversationId) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: question,
      sources: null,
    };

    setMessages((prev) => [...prev, userMessage]);
    setAsking(true);
    setError('');
    const askedQuestion = question;
    setQuestion('');

    try {
      const res = await api.post(`/conversations/${conversationId}/messages`, {
        question: askedQuestion,
        workspaceId,
      });

      const assistantMessage: Message = {
        id: `temp-${Date.now()}-a`,
        role: 'ASSISTANT',
        content: res.data.data.answer,
        sources: res.data.data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get answer');
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="max-w-2xl mx-auto w-full p-8 flex-1 flex flex-col">
        <Link to={`/workspaces/${workspaceId}/chat`} className="text-sm text-slate-500 hover:underline">
          ← Back to conversations
        </Link>

        <h1 className="text-2xl font-semibold text-slate-800 mt-2 mb-6">Ask AI</h1>

        <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
          {loading ? (
          <p className="text-slate-400 text-sm">Loading conversation...</p>
           ) : messages.length === 0 ? (
          <p className="text-slate-400 text-sm">
             Ask a question about the documents in this workspace.
          </p>
         ) : null}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg max-w-[85%] ${
                msg.role === 'USER'
                  ? 'bg-slate-800 text-white ml-auto'
                  : 'bg-white shadow-sm text-slate-800'
              }`}
            >
              <p className="text-sm">{msg.content}</p>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                  {msg.sources.map((s, i) => (
                    <p key={i} className="text-xs text-slate-500">
                      📄 {s.filename} · similarity {s.similarity.toFixed(2)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}

          {asking && <p className="text-slate-400 text-sm">Thinking...</p>}

          <div ref={bottomRef} />
        </div>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={asking}
            className="flex-1 border border-slate-300 rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={asking}
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}