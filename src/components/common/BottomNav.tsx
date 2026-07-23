import React from 'react';
import { Home, Film, MessageCircle, User, Globe } from 'lucide-react';
import { useSocial } from '../../context/SocialContext.js';
import { useAuth } from '../../context/AuthContext.js';

interface NavItem {
  id: 'home' | 'reels' | 'chat' | 'profile' | 'global';
  label: string;
  icon: React.FC<any>;
  badge?: number;
  isAvatar?: boolean;
}

export const BottomNav: React.FC = () => {
  const { activeTab, clearStackAndGoMain, unreadChatCount } = useSocial();
  const { currentUser } = useAuth();

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'chat', label: 'Chat', icon: MessageCircle, badge: unreadChatCount },
    { id: 'profile', label: 'Profile', icon: User, isAvatar: true },
    { id: 'global', label: 'Global', icon: Globe },
  ];


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-3 py-2 flex items-center justify-around max-w-md mx-auto sm:max-w-xl shadow-sm">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            id={`btn-bottom-nav-${item.id}`}
            onClick={() => clearStackAndGoMain(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors duration-150 active:scale-95 ${
              isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-700 font-medium'
            }`}
          >
            {item.isAvatar && currentUser?.avatar ? (
              <div
                className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all ${
                  isActive ? 'border-black scale-105 shadow-sm' : 'border-gray-200'
                }`}
              >
                <img src={currentUser.avatar} alt={currentUser.fullName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105' : ''}`} />
            )}

            <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-black font-bold' : 'text-gray-400'}`}>
              {item.label}
            </span>

            {/* Badge if present */}
            {item.badge && item.badge > 0 ? (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-white">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            ) : null}

            {/* Active Indicator dot */}
            {isActive && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-black" />}
          </button>
        );
      })}
    </nav>
  );
};

