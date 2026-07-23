import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, Story, Conversation, AppNotification, CallSession, User } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';

export type ScreenState =
  | { name: 'main'; tab: 'home' | 'reels' | 'chat' | 'profile' | 'global' }
  | { name: 'search' }
  | { name: 'notifications' }
  | { name: 'user_profile'; userId: string }
  | { name: 'chat_detail'; conversationId: string }
  | { name: 'edit_profile' }
  | { name: 'settings' }
  | { name: 'create_post' }
  | { name: 'create_story' }
  | { name: 'saved_collections' }
  | { name: 'admin_dashboard' }
  | { name: 'comments_sheet'; postId: string };

interface SocialContextType {
  activeTab: 'home' | 'reels' | 'chat' | 'profile' | 'global';
  setActiveTab: (tab: 'home' | 'reels' | 'chat' | 'profile' | 'global') => void;
  screenStack: ScreenState[];
  currentScreen: ScreenState;
  pushScreen: (screen: ScreenState) => void;
  goBack: () => boolean; // returns false if at root
  clearStackAndGoMain: (tab?: 'home' | 'reels' | 'chat' | 'profile' | 'global') => void;
  
  // Realtime Data
  posts: Post[];
  stories: Story[];
  notifications: AppNotification[];
  conversations: Conversation[];
  unreadNotifsCount: number;
  unreadChatCount: number;
  refreshData: () => Promise<void>;

  // Calling
  activeCall: CallSession | null;
  startCall: (targetUser: User, type: 'audio' | 'video') => void;
  endCall: () => void;
  acceptCall: () => void;
  declineCall: () => void;

  // Offline network status
  isOnline: boolean;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTabState] = useState<'home' | 'reels' | 'chat' | 'profile' | 'global'>('home');
  const [screenStack, setScreenStack] = useState<ScreenState[]>([{ name: 'main', tab: 'home' }]);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Back online! Syncing latest data...');
      refreshData();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('No Internet Connection. Offline mode active.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshData = async () => {
    if (!currentUser) return;
    try {
      const [pRes, sRes, nRes, cRes] = await Promise.all([
        api.getPosts(),
        api.getStories(),
        api.getNotifications(currentUser.id),
        api.getConversations(currentUser.id),
      ]);
      if (pRes.posts) setPosts(pRes.posts);
      if (sRes.stories) setStories(sRes.stories);
      if (nRes.notifications) setNotifications(nRes.notifications);
      if (cRes.conversations) setConversations(cRes.conversations);
    } catch (e) {
      console.error('Error refreshing social context data', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
      // Periodically poll every 5s for real-time updates
      const interval = setInterval(() => {
        refreshData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  const setActiveTab = (tab: 'home' | 'reels' | 'chat' | 'profile' | 'global') => {
    setActiveTabState(tab);
    setScreenStack([{ name: 'main', tab }]);
  };

  const pushScreen = (screen: ScreenState) => {
    setScreenStack((prev) => [...prev, screen]);
  };

  const goBack = (): boolean => {
    if (screenStack.length <= 1) return false;
    setScreenStack((prev) => prev.slice(0, prev.length - 1));
    return true;
  };

  const clearStackAndGoMain = (tab?: 'home' | 'reels' | 'chat' | 'profile' | 'global') => {
    const targetTab = tab || activeTab;
    setActiveTabState(targetTab);
    setScreenStack([{ name: 'main', tab: targetTab }]);
  };

  const currentScreen = screenStack[screenStack.length - 1] || { name: 'main', tab: 'home' };

  // Call handling
  const startCall = (targetUser: User, type: 'audio' | 'video') => {
    if (!currentUser) return;
    const session: CallSession = {
      id: `call_${Date.now()}`,
      callerId: currentUser.id,
      callerName: currentUser.fullName,
      callerAvatar: currentUser.avatar,
      receiverId: targetUser.id,
      receiverName: targetUser.fullName,
      receiverAvatar: targetUser.avatar,
      type,
      status: 'ringing',
    };
    setActiveCall(session);
  };

  const endCall = () => {
    if (activeCall) {
      setActiveCall({ ...activeCall, status: 'ended' });
      setTimeout(() => setActiveCall(null), 1000);
    }
  };

  const acceptCall = () => {
    if (activeCall) {
      setActiveCall({ ...activeCall, status: 'connected', startedAt: new Date().toISOString() });
    }
  };

  const declineCall = () => {
    if (activeCall) {
      setActiveCall({ ...activeCall, status: 'declined' });
      setTimeout(() => setActiveCall(null), 1000);
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const unreadChatCount = conversations.reduce((sum, c) => {
    return sum + (currentUser ? c.unreadCount?.[currentUser.id] || 0 : 0);
  }, 0);

  return (
    <SocialContext.Provider
      value={{
        activeTab,
        setActiveTab,
        screenStack,
        currentScreen,
        pushScreen,
        goBack,
        clearStackAndGoMain,
        posts,
        stories,
        notifications,
        conversations,
        unreadNotifsCount,
        unreadChatCount,
        refreshData,
        activeCall,
        startCall,
        endCall,
        acceptCall,
        declineCall,
        isOnline,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocial must be used within a SocialProvider');
  return context;
};
