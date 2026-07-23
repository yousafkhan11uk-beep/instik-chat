import React, { useState, useEffect } from 'react';
import { X, Trash2, Eye, Send, Heart } from 'lucide-react';
import { Story } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useSocial } from '../../context/SocialContext.js';

interface StoryViewerModalProps {
  story: Story;
  onClose: () => void;
  onDeleteStory?: (storyId: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ story, onClose, onDeleteStory }) => {
  const { currentUser } = useAuth();
  const { showToast } = useSocial();
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [showViewers, setShowViewers] = useState(false);

  const isOwner = currentUser?.id === story.userId;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onClose();
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [story.id]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    showToast(`Reply sent to @${story.username}`);
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="relative w-full max-w-md h-full max-h-[900px] bg-black flex flex-col justify-between overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
          <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Top Bar */}
        <div className="absolute top-6 left-3 right-3 z-20 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent p-2 rounded-xl">
          <div className="flex items-center gap-2.5">
            <img src={story.userAvatar} alt={story.username} className="w-8 h-8 rounded-full object-cover border border-white/20" />
            <div>
              <p className="text-xs font-bold">{story.userFullName}</p>
              <p className="text-[10px] text-gray-300">@{story.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && onDeleteStory && (
              <button
                onClick={() => onDeleteStory(story.id)}
                className="p-1.5 rounded-full bg-black/40 hover:bg-rose-600 text-white transition-colors"
                title="Delete Story"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              id="btn-close-story"
              className="p-1.5 rounded-full bg-black/40 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Container */}
        <div className="w-full h-full flex items-center justify-center bg-black">
          {story.mediaType === 'video' ? (
            <video src={story.mediaUrl} autoPlay loop playsInline className="w-full h-full object-contain" />
          ) : (
            <img src={story.mediaUrl} alt="Story" className="w-full h-full object-contain" />
          )}
        </div>

        {/* Bottom Bar: Owner Viewers vs Viewer Reply */}
        <div className="absolute bottom-4 left-3 right-3 z-20">
          {isOwner ? (
            <button
              onClick={() => setShowViewers(!showViewers)}
              className="w-full py-2.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl text-xs text-white font-semibold flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-white" />
              <span>{story.views.length} Story Viewers</span>
            </button>
          ) : (
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to @${story.username}...`}
                className="flex-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-300 focus:outline-none focus:border-white"
              />
              <button type="submit" className="p-2.5 rounded-full bg-white text-black font-bold active:scale-95">
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Story Viewers Sheet Modal */}
        {showViewers && (
          <div className="absolute inset-x-0 bottom-0 z-30 bg-white border-t border-gray-200 rounded-t-3xl p-4 max-h-[300px] overflow-y-auto text-gray-900 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
              <h3 className="text-xs font-bold text-gray-900">Story Viewers ({story.views.length})</h3>
              <button onClick={() => setShowViewers(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            {story.views.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No viewers yet.</p>
            ) : (
              <div className="space-y-2.5">
                {story.views.map((v) => (
                  <div key={v.userId} className="flex items-center justify-between text-xs text-gray-800">
                    <div className="flex items-center gap-2">
                      <img src={v.userAvatar} alt={v.username} className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                      <span className="font-medium">@{v.username}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{new Date(v.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

