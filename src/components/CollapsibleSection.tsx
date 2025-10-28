import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-600 rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-700 hover:bg-gray-600 transition-colors rounded-t-lg"
      >
        <span className="text-lg font-medium text-white">{title}</span>
        {isOpen ? (
          <ChevronDownIcon className="w-5 h-5 text-gray-300" />
        ) : (
          <ChevronRightIcon className="w-5 h-5 text-gray-300" />
        )}
      </button>
      {isOpen && <div className="p-4 bg-gray-800 rounded-b-lg">{children}</div>}
    </div>
  );
}
