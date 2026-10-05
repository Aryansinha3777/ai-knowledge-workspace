import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-[var(--border-color)] rounded-xl">
      <div className="w-12 h-12 rounded-full bg-[var(--accent-tint)] flex items-center justify-center mb-4">
        <Icon size={20} className="text-[var(--accent)]" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}