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
    <div className="flex flex-col items-center text-center py-16 px-6 border border-dashed border-[#E4E4E7] rounded-xl">
      <div className="w-12 h-12 rounded-full bg-[#4F46E5]/10 flex items-center justify-center mb-4">
        <Icon size={20} className="text-[#4F46E5]" />
      </div>
      <h3 className="text-sm font-semibold text-[#27272A] mb-1">{title}</h3>
      <p className="text-sm text-[#71717A] max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}