import React, { useState } from 'react';
import { Search, MessageSquare, Phone, Video, CheckCheck, Circle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSocial } from '../../context/SocialContext.js';
import { BackButton } from '../common/BackButton.js';

export const ChatPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { conversations, pushScreen, startCall } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) => {
    const otherUser = c.participants.find((p) => p.id !== currentUser?.id) || c.participants[0];
    return (
      otherUser?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-20">
      <BackButton title="Direct Messages" />

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages & friends..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black shadow-xs transition-all"
          />
        </div>

        {/* Conversations List */}
        <div className="space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No conversations found</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Connect with friends from search or profile pages to start chatting.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const otherUser =
                conv.participants.find((p) => p.id !== currentUser?.id) || conv.participants[0];
              const unread = currentUser ? conv.unreadCount?.[currentUser.id] || 0 : 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => pushScreen({ name: 'chat_detail', conversationId: conv.id })}
                  className="p-3.5 bg-white border border-gray-200 hover:border-gray-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative shrink-0">
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                      {otherUser.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>

                    <div className="overflow-hidden text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 truncate">{otherUser.fullName}</span>
                        <span className="text-[10px] text-gray-400">@{otherUser.username}</span>
                      </div>
                      <p className="text-gray-500 truncate mt-0.5 font-medium">
                        {conv.lastMessage?.text || 'Started a conversation'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] text-gray-400 font-medium">
                      {conv.lastMessage
                        ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>

                    {unread > 0 ? (
                      <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded-full">
                        {unread}
                      </span>
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5 text-gray-300" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
