import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { SocialProvider, useSocial } from './context/SocialContext.js';

import { SplashScreen } from './components/auth/SplashScreen.js';
import { WelcomeScreen } from './components/auth/WelcomeScreen.js';
import { LoginForm } from './components/auth/LoginForm.js';
import { SignUpForm } from './components/auth/SignUpForm.js';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal.js';

import { Header } from './components/common/Header.js';
import { BottomNav } from './components/common/BottomNav.js';
import { BackButton } from './components/common/BackButton.js';

import { StoriesBar } from './components/home/StoriesBar.js';
import { PostCard } from './components/home/PostCard.js';
import { CommentsDrawer } from './components/home/CommentsDrawer.js';
import { CreatePostModal } from './components/home/CreatePostModal.tsx';
import { CreateStoryModal } from './components/home/CreateStoryModal.js';
import { StoryViewerModal } from './components/home/StoryViewerModal.js';

import { SearchPage } from './components/search/SearchPage.js';
import { NotificationsPage } from './components/notifications/NotificationsPage.js';
import { ChatPage } from './components/chat/ChatPage.js';
import { ChatDetailScreen } from './components/chat/ChatDetailScreen.js';
import { CallOverlayModal } from './components/call/CallOverlayModal.js';

import { Story } from './types/index.js';
import { WifiOff, Film, Globe, User as UserIcon, Settings, Plus, Heart, Grid, Bookmark, LogOut } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const {
    activeTab,
    setActiveTab,
    currentScreen,
    pushScreen,
    posts,
    stories,
    isOnline,
    toastMessage,
    activeCall,
  } = useSocial();

  const [activeStoryViewer, setActiveStoryViewer] = useState<Story | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [authView, setAuthView] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);

  // Home Feed Filter
  const [feedFilter, setFeedFilter] = useState<'for_you' | 'following'>('for_you');

  // User Profile tab state
  const [profileTab, setProfileTab] = useState<'posts' | 'saved' | 'liked'>('posts');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center">
        {authView === 'welcome' && (
          <WelcomeScreen
            onNavigateLogin={() => setAuthView('login')}
            onNavigateSignup={() => setAuthView('signup')}
          />
        )}
        {authView === 'login' && (
          <LoginForm
            onNavigateSignup={() => setAuthView('signup')}
            onForgotPassword={() => setIsForgotPassOpen(true)}
          />
        )}
        {authView === 'signup' && (
          <SignUpForm onNavigateLogin={() => setAuthView('login')} />
        )}

        {isForgotPassOpen && (
          <ForgotPasswordModal onClose={() => setIsForgotPassOpen(false)} />
        )}
      </div>
    );
  }

  // Render current active screen / view
  const renderScreen = () => {
    switch (currentScreen.name) {
      case 'search':
        return <SearchPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'chat_detail':
        return <ChatDetailScreen conversationId={currentScreen.conversationId} />;
      case 'user_profile':
        return (
          <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-20">
            <BackButton title="User Profile" />
            <div className="p-6 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 border border-gray-300 overflow-hidden shadow-xs">
                <img
                  src={`https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80`}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">User Profile</h2>
                <p className="text-xs text-gray-500">ID: {currentScreen.userId}</p>
              </div>
              <button
                onClick={() => pushScreen({ name: 'chat_detail', conversationId: 'conv_1' })}
                className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-neutral-800 shadow-xs transition-all"
              >
                Send Direct Message
              </button>
            </div>
          </div>
        );
      case 'main':
      default:
        switch (activeTab) {
          case 'reels':
            return (
              <div className="min-h-screen bg-black text-white pb-20 flex flex-col justify-center items-center p-6 text-center">
                <Film className="w-12 h-12 text-gray-400 mb-3 animate-pulse" />
                <h2 className="text-lg font-bold">Immersive Reels Feed</h2>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  Full-screen short video clips and trending audio streams.
                </p>
              </div>
            );
          case 'chat':
            return <ChatPage />;
          case 'global':
            return (
              <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-20">
                <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-20">
                  <h1 className="text-sm font-bold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-black" />
                    Global Explore
                  </h1>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-3xl mx-auto">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setActiveCommentPostId(post.id)}
                      className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group cursor-pointer border border-gray-200"
                    >
                      <img src={post.mediaUrl} alt="Explore" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 text-white text-xs font-bold">
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-white" /> {post.likes.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          case 'profile':
            return (
              <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-20">
                {/* Header info */}
                <div className="bg-white border-b border-gray-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.fullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-xs"
                      />
                      <div>
                        <h2 className="text-base font-bold text-gray-900">{currentUser.fullName}</h2>
                        <p className="text-xs text-gray-500">@{currentUser.username}</p>
                        <p className="text-xs text-gray-700 mt-1">{currentUser.bio || 'Living life through moments ✨'}</p>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stats Bar */}
                  <div className="flex items-center justify-around py-3 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{posts.length}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Posts</p>
                    </div>
                    <div className="h-6 w-px bg-gray-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{currentUser.followersCount || 128}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Followers</p>
                    </div>
                    <div className="h-6 w-px bg-gray-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{currentUser.followingCount || 94}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Following</p>
                    </div>
                  </div>
                </div>

                {/* Profile Tabs */}
                <div className="flex border-b border-gray-200 bg-white">
                  <button
                    onClick={() => setProfileTab('posts')}
                    className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                      profileTab === 'posts' ? 'border-black text-black' : 'border-transparent text-gray-400'
                    }`}
                  >
                    <Grid className="w-4 h-4" /> Posts
                  </button>
                  <button
                    onClick={() => setProfileTab('saved')}
                    className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                      profileTab === 'saved' ? 'border-black text-black' : 'border-transparent text-gray-400'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" /> Saved
                  </button>
                </div>

                {/* Grid Content */}
                <div className="p-4 grid grid-cols-3 gap-2 max-w-2xl mx-auto">
                  {posts.map((post) => (
                    <div key={post.id} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                      <img src={post.mediaUrl} alt="Post" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            );
          case 'home':
          default:
            return (
              <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-20">
                <Header />

                {/* Stories Section */}
                <StoriesBar
                  onSelectStory={(story) => setActiveStoryViewer(story)}
                  onCreateStory={() => setIsCreateStoryOpen(true)}
                />

                {/* Feed Filter Segment */}
                <div className="px-4 my-3 flex items-center justify-center gap-2">
                  <div className="p-1 bg-gray-200/60 rounded-full flex gap-1">
                    <button
                      onClick={() => setFeedFilter('for_you')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        feedFilter === 'for_you'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      For You
                    </button>
                    <button
                      onClick={() => setFeedFilter('following')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        feedFilter === 'following'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Following
                    </button>
                  </div>
                </div>

                {/* Feed Posts */}
                <div className="p-4 max-w-lg mx-auto space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onOpenComments={(pId) => setActiveCommentPostId(pId)}
                    />
                  ))}
                </div>

                {/* Floating Add Post Button */}
                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="fixed bottom-20 right-5 z-30 p-3.5 bg-black hover:bg-neutral-800 text-white rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center"
                  title="Create Post"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            );
        }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fafafa] font-sans">
      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — Viewing cached content</span>
        </div>
      )}

      {renderScreen()}

      {/* Bottom Navigation */}
      {currentScreen.name === 'main' && <BottomNav />}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2.5 rounded-full text-xs font-medium shadow-xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active Story Viewer Modal */}
      {activeStoryViewer && (
        <StoryViewerModal
          story={activeStoryViewer}
          onClose={() => setActiveStoryViewer(null)}
        />
      )}

      {/* Comments Drawer */}
      {activeCommentPostId && (
        <CommentsDrawer
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
        />
      )}

      {/* Create Post Modal */}
      {isCreatePostOpen && (
        <CreatePostModal
          onClose={() => setIsCreatePostOpen(false)}
          onPostCreated={() => setIsCreatePostOpen(false)}
        />
      )}

      {/* Create Story Modal */}
      {isCreateStoryOpen && (
        <CreateStoryModal
          onClose={() => setIsCreateStoryOpen(false)}
          onStoryCreated={() => setIsCreateStoryOpen(false)}
        />
      )}

      {/* Calling Overlay */}
      {activeCall && <CallOverlayModal />}
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <SocialProvider>
        <MainAppContent />
      </SocialProvider>
    </AuthProvider>
  );
}
