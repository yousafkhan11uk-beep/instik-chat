import React, { useState, useEffect } from 'react';
import { X, Send, Heart, Trash2, Edit2, Reply, Check } from 'lucide-react';
import { PostComment } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useSocial } from '../../context/SocialContext.js';
import { api } from '../../services/api.js';

interface CommentsDrawerProps {
  postId: string;
  onClose: () => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({ postId, onClose }) => {
  const { currentUser } = useAuth();
  const { showToast, refreshData } = useSocial();

  const [comments, setComments] = useState<PostComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await api.getComments(postId);
      if (res.comments) setComments(res.comments);
    } catch (e) {
      console.error('Fetch comments error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newCommentText.trim()) return;

    try {
      const res = await api.addComment(
        postId,
        currentUser.id,
        newCommentText.trim(),
        replyingTo ? replyingTo.id : undefined
      );
      if (res.success) {
        setNewCommentText('');
        setReplyingTo(null);
        fetchComments();
        refreshData();
        showToast('Comment added!');
      }
    } catch (e) {
      showToast('Failed to add comment.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.deleteComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      refreshData();
      showToast('Comment deleted.');
    } catch (e) {
      showToast('Failed to delete comment.');
    }
  };

  const handleSaveEdit = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, text: editText } : c))
    );
    setEditingCommentId(null);
    showToast('Comment updated!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white border-t sm:border border-gray-200 w-full max-w-lg h-[80vh] max-h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col justify-between shadow-xl relative text-gray-900">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-gray-900">Comments ({comments.length})</h2>
          <button onClick={onClose} id="btn-close-comments" className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            comments.map((comment) => {
              const isOwn = currentUser?.id === comment.userId;
              const isEditing = editingCommentId === comment.id;

              return (
                <div key={comment.id} className="flex gap-3 text-xs">
                  <img src={comment.userAvatar} alt={comment.username} className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200" />

                  <div className="flex-1 space-y-1">
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900">@{comment.username}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-black"
                          />
                          <button onClick={() => handleSaveEdit(comment.id)} className="p-1 text-emerald-600 hover:text-emerald-700">
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 px-1 text-[11px] text-gray-500 font-medium">
                      <button onClick={() => setReplyingTo(comment)} className="hover:text-black flex items-center gap-1">
                        <Reply className="w-3 h-3" /> Reply
                      </button>

                      {isOwn && (
                        <>
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditText(comment.text);
                            }}
                            className="hover:text-black flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={() => handleDeleteComment(comment.id)} className="hover:text-red-500 flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Replying Indicator */}
        {replyingTo && (
          <div className="px-5 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-black font-semibold">
            <span>Replying to @{replyingTo.username}</span>
            <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleAddComment} className="p-4 border-t border-gray-200 bg-white shrink-0 flex items-center gap-2">
          <input
            type="text"
            id="input-add-comment"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black"
          />
          <button
            type="submit"
            id="btn-submit-comment"
            disabled={!newCommentText.trim()}
            className="p-2.5 bg-black hover:bg-neutral-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full font-bold active:scale-95 transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

