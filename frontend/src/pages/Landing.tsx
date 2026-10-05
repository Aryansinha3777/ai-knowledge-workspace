import { Link, Navigate } from 'react-router-dom';
import { Search, MessageSquare, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  {
    icon: FileText,
    title: 'Organize your knowledge',
    description: 'Upload PDFs, notes, and docs into focused workspaces — no more digging through folders.',
  },
  {
    icon: Search,
    title: 'Search by meaning',
    description: 'Find what you need by concept, not exact keywords, powered by semantic vector search.',
  },
  {
    icon: MessageSquare,
    title: 'Ask, don\'t search',
    description: 'Get direct, grounded answers to your questions, with citations back to your own documents.',
  },
  {
    icon: Sparkles,
    title: 'Never hallucinated',
    description: 'Answers are built only from what you\'ve uploaded — if it\'s not there, the AI says so.',
  },
];

export default function Landing() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return null;
  }

  if (user) {
    return <Navigate to="/workspaces" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <ThemeToggle />
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <span className="text-[15px] font-semibold text-[var(--text-primary)]">AI Knowledge Workspace</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-[var(--text-primary)] font-medium">
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-[var(--accent)] text-white font-medium px-4 py-2 rounded-lg hover:bg-[var(--accent-hover)] transition-colors btn-press"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto text-center px-8 pt-20 pb-16">
        <h1 className="text-4xl sm:text-5xl font-semibold text-[var(--text-primary)] leading-tight mb-5">
          Your documents, made answerable.
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed">
          Upload your notes and PDFs, organize them into workspaces, and ask questions in
          plain language. Every answer is grounded in your own content — with sources, not
          guesses.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="bg-[var(--accent)] text-white font-medium px-6 py-3 rounded-lg hover:bg-[var(--accent-hover)] transition-colors btn-press"
          >
            Get started — it's free
          </Link>
          <Link
            to="/login"
            className="text-[var(--text-primary)] font-medium px-6 py-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors btn-press"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-8 pb-20">
        <div className="border border-[var(--border-color)] rounded-2xl bg-[var(--bg-secondary)] p-6 sm:p-10">
          <div className="bg-[var(--bg-primary)] rounded-xl shadow-sm border border-[var(--border-color)] p-6 max-w-lg mx-auto">
            <div className="flex justify-end mb-4">
              <div className="bg-[var(--accent)] text-white text-sm rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                What is special about an elephant's trunk?
              </div>
            </div>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-2">
              An elephant's trunk is its most remarkable feature — a highly versatile tool
              used for breathing, smelling, communicating, and grasping food or water.
            </p>
            <span className="inline-block text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full px-2.5 py-1">
              elephant.md · 72%
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid sm:grid-cols-2 gap-8">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-tint)] flex items-center justify-center">
                <f.icon size={18} className="text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border-color)] py-8 text-center text-sm text-[var(--text-secondary)]">
        AI Knowledge Workspace — built with React, Node.js, PostgreSQL + pgvector, and RAG.
      </footer>
    </div>
  );
}