import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSocial } from '../../context/SocialContext.js';

interface BackButtonProps {
  title?: string;
  onCustomBack?: () => void;
  rightElement?: React.ReactNode;
}

export const BackButton: React.FC<BackButtonProps> = ({ title, onCustomBack, rightElement }) => {
  const { goBack } = useSocial();

  const handleBack = () => {
    if (onCustomBack) {
      onCustomBack();
    } else {
      goBack();
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between text-gray-900">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          id="btn-nav-back"
          className="p-2 rounded-full hover:bg-gray-100 text-gray-800 transition-colors active:scale-95 border border-gray-200/60"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {title && <h1 className="text-base font-bold text-gray-900 tracking-tight truncate">{title}</h1>}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
};

