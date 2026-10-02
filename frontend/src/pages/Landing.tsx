import { Link , Navigate } from 'react-router-dom';
import { Search, MessageSquare, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/workspaces" replace />;
  }
  
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <span className="text-[15px] font-semibold text-[#27272A]">AI Knowledge Workspace</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-[#27272A] font-medium">
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-[#4F46E5] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto text-center px-8 pt-20 pb-16">
        <h1 className="text-4xl sm:text-5xl font-semibold text-[#27272A] leading-tight mb-5">
          Your documents, made answerable.
        </h1>
        <p className="text-lg text-[#71717A] mb-8 leading-relaxed">
          Upload your notes and PDFs, organize them into workspaces, and ask questions in
          plain language. Every answer is grounded in your own content — with sources, not
          guesses.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="bg-[#4F46E5] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            Get started — it's free
          </Link>
          <Link
            to="/login"
            className="text-[#27272A] font-medium px-6 py-3 rounded-lg border border-[#E4E4E7] hover:bg-[#F7F7F8] transition-colors"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-8 pb-20">
        <div className="border border-[#E4E4E7] rounded-2xl bg-[#F7F7F8] p-6 sm:p-10">
          <div className="bg-white rounded-xl shadow-sm border border-[#E4E4E7] p-6 max-w-lg mx-auto">
            <div className="flex justify-end mb-4">
              <div className="bg-[#4F46E5] text-white text-sm rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                What is special about an elephant's trunk?
              </div>
            </div>
            <p className="text-sm text-[#27272A] leading-relaxed mb-2">
              An elephant's trunk is its most remarkable feature — a highly versatile tool
              used for breathing, smelling, communicating, and grasping food or water.
            </p>
            <span className="inline-block text-xs text-[#71717A] bg-[#F7F7F8] border border-[#E4E4E7] rounded-full px-2.5 py-1">
              elephant.md · 72%
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid sm:grid-cols-2 gap-8">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center">
                <f.icon size={18} className="text-[#4F46E5]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#27272A] mb-1">{f.title}</h3>
                <p className="text-sm text-[#71717A] leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#E4E4E7] py-8 text-center text-sm text-[#71717A]">
        AI Knowledge Workspace — built with React, Node.js, PostgreSQL + pgvector, and RAG.
      </footer>
    </div>
  );
}