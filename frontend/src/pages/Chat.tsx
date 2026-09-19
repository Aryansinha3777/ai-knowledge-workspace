import { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';

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
    } catch {
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
    if (!question.trim()) return;

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
                      <div className="max-w-[85%]">
                        <p className="text-sm text-[#27272A] leading-relaxed whitespace-pre-line">
                          {msg.content}
                        </p>
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
                      </div>
                    )}
                  </div>
                ))}

                {asking && (
                  <div className="flex items-center gap-1.5 text-[#71717A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#71717A] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#71717A] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#71717A] animate-bounce"></span>
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