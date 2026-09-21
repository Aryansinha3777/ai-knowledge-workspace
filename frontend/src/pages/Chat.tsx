import { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

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
  const [status, setStatus] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadConversation() {
    try {
      const res = await api.get(`/conversations/${conversationId}`);
      setMessages(res.data.data.messages);
    } catch {
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(id: string, content: string) {
  try {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  } catch {
    setError('Failed to copy');
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
  if (!question.trim()) return;

  const userMessage: Message = {
    id: `temp-${Date.now()}`,
    role: 'USER',
    content: question,
    sources: null,
  };

  const assistantId = `temp-${Date.now()}-a`;
  const assistantMessage: Message = {
    id: assistantId,
    role: 'ASSISTANT',
    content: '',
    sources: null,
  };

  setMessages((prev) => [...prev, userMessage, assistantMessage]);
  setAsking(true);
  setError('');
  setStatus('');
  const askedQuestion = question;
  setQuestion('');

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:5000/api/conversations/${conversationId}/messages/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: askedQuestion, workspaceId }),
      }
    );

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const event = JSON.parse(line.slice(6));

      if (event.type === 'status') {
        if (event.stage === 'searching') setStatus('Searching your documents...');
        else if (event.stage === 'found') setStatus(`Found ${event.count} relevant source${event.count === 1 ? '' : 's'}...`);
        else if (event.stage === 'generating') setStatus('Generating answer...');
      } else if (event.type === 'sources') {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, sources: event.sources } : m))
        );
      } else if (event.type === 'token') {
        setStatus('');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + event.token } : m
          )
        );
      } else if (event.type === 'error') {
        setError(event.message);
      }
    }
    }
  } catch (err: any) {
    setError('Failed to get answer');
  } finally {
    setAsking(false);
  }
}

  return (
    <Layout>
      <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-8 py-8">
            {loading ? (
              <p className="text-sm text-[#71717A]">Loading conversation...</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-sm text-[#71717A]">
                  Ask a question about the documents in this workspace.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.role === 'USER' ? (
                      <div className="flex justify-end">
                        <div className="bg-[#4F46E5] text-white text-sm rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[85%] group">
                        <div className="text-sm text-[#27272A] leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-headings:my-2 prose-strong:font-semibold">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {msg.sources.map((s, i) => (
                              <span
                                key={i}
                                className="text-xs text-[#71717A] bg-[#F7F7F8] border border-[#E4E4E7] rounded-full px-2.5 py-1"
                              >
                                {s.filename} · {(s.similarity * 100).toFixed(0)}%
                              </span>
                            ))}
                          </div>
                        )}
                        {msg.content && !asking && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="mt-2 flex items-center gap-1 text-xs text-[#71717A] hover:text-[#27272A] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check size={12} /> Copied
                              </>
                            ) : (
                              <>
                                <Copy size={12} /> Copy
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {asking && status && (
                  <div className="flex items-center gap-2 text-sm text-[#71717A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse"></span>
                    {status}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#E4E4E7] px-8 py-4">
          <div className="max-w-2xl mx-auto">
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask a question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={asking}
                className="flex-1 border border-[#E4E4E7] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
              />
              <button
                type="submit"
                disabled={asking}
                className="bg-[#4F46E5] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#4338CA] disabled:opacity-50 transition-colors"
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}