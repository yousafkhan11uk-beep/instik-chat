import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Video, Send, Mic, Image as ImageIcon, MoreVertical, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSocial } from '../../context/SocialContext.js';
import { api } from '../../services/api.js';
import { ChatMessage, User } from '../../types/index.js';
import { VoiceRecorder } from './VoiceRecorder.js';

interface ChatDetailScreenProps {
  conversationId: string;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ conversationId }) => {
  const { currentUser } = useAuth();
  const { conversations, goBack, startCall, refreshData, showToast } = useSocial();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    if (conversation && currentUser) {
      const other = conversation.participants.find((p) => p.id !== currentUser.id) || conversation.participants[0];
      setOtherUser(other);
    }
  }, [conversation, currentUser]);

  const loadMessages = async () => {
    try {
      const res = await api.getMessages(conversationId);
      if (res.messages) setMessages(res.messages);
    } catch (e) {
      console.error('Failed to load messages', e);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (type: 'text' | 'voice' | 'image' = 'text', content?: string) => {
    const textToSend = content || inputText.trim();
    if (!currentUser || !textToSend) return;

    try {
      await api.sendMessage(conversationId, {
        senderId: currentUser.id,
        text: textToSend,
        type,
      });
      setInputText('');

      setIsRecordingVoice(false);
      await loadMessages();
      refreshData();
    } catch (e) {
      showToast('Failed to send message');
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#fafafa] flex flex-col justify-between text-gray-900">
      {/* Top Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {otherUser && (
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img src={otherUser.avatar} alt={otherUser.fullName} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                {otherUser.isOnline && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                )}
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900">{otherUser.fullName}</h2>
                <p className="text-[10px] text-gray-400">@{otherUser.username}</p>
              </div>
            </div>
          )}
        </div>

        {otherUser && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => startCall(otherUser, 'audio')}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
              title="Voice Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => startCall(otherUser, 'video')}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
              title="Video Call"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUser?.id;

          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 shadow-xs ${
                  isOwn
                    ? 'bg-black text-white rounded-br-xs'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-xs'
                }`}
              >
                {msg.type === 'voice' ? (
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="p-1.5 rounded-full bg-gray-200 text-black">
                      <Mic className="w-3.5 h-3.5" />
                    </span>
                    <span>Voice Note ({msg.text})</span>
                  </div>
                ) : msg.type === 'image' ? (
                  <img src={msg.text} alt="Attachment" className="rounded-xl max-h-48 object-cover" />
                ) : (
                  <p className="leading-relaxed">{msg.text}</p>
                )}

                <div className={`flex items-center justify-end gap-1 text-[9px] ${isOwn ? 'text-gray-400' : 'text-gray-400'}`}>
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isOwn && <CheckCheck className="w-3 h-3 text-gray-300" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Section */}
      <div className="p-3 bg-white border-t border-gray-200 shrink-0">
        {isRecordingVoice ? (
          <VoiceRecorder
            onSendVoice={(duration) => handleSendMessage('voice', `${duration}s`)}
            onCancel={() => setIsRecordingVoice(false)}
          />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage('text');
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setIsRecordingVoice(true)}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shrink-0"
              title="Voice Message"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-black hover:bg-neutral-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full font-bold transition-all shrink-0 active:scale-95 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
