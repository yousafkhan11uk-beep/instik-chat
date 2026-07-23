import React from 'react';
import { Search, Heart } from 'lucide-react';
import { useSocial } from '../../context/SocialContext.js';

export const Header: React.FC = () => {
  const { pushScreen, unreadNotifsCount } = useSocial();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      {/* Top Left: Logo & App Name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-sm">
          <div className="w-4 h-4 border-2 border-white rotate-45" />
        </div>
        <span className="text-lg font-bold tracking-tight uppercase text-gray-900">
          Mok Social
        </span>
      </div>

      {/* Top Right: Search & Notifications */}
      <div className="flex items-center gap-3">
        <button
          id="btn-header-search"
          onClick={() => pushScreen({ name: 'search' })}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-700 transition-colors border border-gray-200/80"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          id="btn-header-notifications"
          onClick={() => pushScreen({ name: 'notifications' })}
          className="relative p-2 hover:bg-gray-100 rounded-full text-gray-700 transition-colors border border-gray-200/80"
          aria-label="Notifications"
        >
          <Heart className="w-5 h-5" />
          {unreadNotifsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
              {unreadNotifsCount > 99 ? '99+' : unreadNotifsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

