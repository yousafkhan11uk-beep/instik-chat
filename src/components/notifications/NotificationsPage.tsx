import React, { useEffect } from 'react';
import { Heart, UserPlus, MessageSquare, Share2, Bookmark, Bell, Sparkles } from 'lucide-react';
import { BackButton } from '../common/BackButton.js';
import { useAuth } from '../../context/AuthContext.js';
import { useSocial } from '../../context/SocialContext.js';
import { api } from '../../services/api.js';

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { notifications, refreshData, pushScreen } = useSocial();

  useEffect(() => {
    if (currentUser) {
      api.markNotificationsRead(currentUser.id).then(() => {
        refreshData();
      });
    }
  }, [currentUser?.id]);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'like':
      case 'story_like':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'follow':
      case 'follow_request':
      case 'follow_accept':
        return <UserPlus className="w-3.5 h-3.5 text-black" />;
      case 'comment':
      case 'reply':
      case 'story_reply':
        return <MessageSquare className="w-3.5 h-3.5 text-gray-700" />;
      case 'share':
        return <Share2 className="w-3.5 h-3.5 text-gray-700" />;
      case 'save':
        return <Bookmark className="w-3.5 h-3.5 text-gray-700" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-gray-700" />;
    }
  };

  const handleNotifClick = (notif: any) => {
    if (notif.targetPostId) {
      pushScreen({ name: 'main', tab: 'home' });
    } else if (notif.targetConversationId) {
      pushScreen({ name: 'chat_detail', conversationId: notif.targetConversationId });
    } else {
      pushScreen({ name: 'user_profile', userId: notif.senderId });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-20">
      <BackButton title="Activity Notifications" />

      <div className="p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-xs">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No activity yet</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              When friends like, comment, or follow you, you'll see instant notifications here.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotifClick(notif)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                !notif.isRead
                  ? 'bg-white border-black/20 shadow-xs'
                  : 'bg-white border-gray-200 hover:bg-gray-50/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={notif.senderAvatar}
                    alt={notif.senderUsername}
                    className="w-11 h-11 rounded-full object-cover border border-gray-200"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full border border-gray-200 shadow-xs">
                    {getNotifIcon(notif.type)}
                  </div>
                </div>

                <div className="text-xs">
                  <p className="text-gray-800">
                    <strong className="text-gray-900 font-bold hover:underline">@{notif.senderUsername}</strong>{' '}
                    <span>{notif.text}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Target Preview Thumbnail if available */}
              {notif.targetPostPreview && (
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                  <img src={notif.targetPostPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

