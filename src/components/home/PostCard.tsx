import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Music, MoreHorizontal, UserPlus, UserCheck, Share2 } from 'lucide-react';
import { Post } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useSocial } from '../../context/SocialContext.js';
import { api } from '../../services/api.js';

interface PostCardProps {
  post: Post;
  onOpenComments: (postId: string) => void;
  onSendToFriend?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenComments, onSendToFriend }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const { pushScreen, showToast, refreshData } = useSocial();

  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(currentUser ? post.likedBy.includes(currentUser.id) : false);
  const [isSaved, setIsSaved] = useState(currentUser ? post.savedBy?.includes(currentUser.id) : false);

  const isFollowing = currentUser?.followingIds?.includes(post.userId);
  const isSelf = currentUser?.id === post.userId;

  const handleLikeToggle = async () => {
    if (!currentUser) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await api.toggleLikePost(post.id, currentUser.id);
    } catch (e) {
      console.error('Like toggle error', e);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || isSelf) return;
    try {
      if (isFollowing) {
        await api.unfollowUser(post.userId, currentUser.id);
        const updated = {
          ...currentUser,
          followingIds: (currentUser.followingIds || []).filter((id) => id !== post.userId),
          followingCount: Math.max(0, currentUser.followingCount - 1),
        };
        updateCurrentUser(updated);
        showToast(`Unfollowed @${post.username}`);
      } else {
        const res = await api.followUser(post.userId, currentUser.id);
        if (res.status === 'requested') {
          showToast(`Follow request sent to @${post.username}`);
        } else {
          const updated = {
            ...currentUser,
            followingIds: [...(currentUser.followingIds || []), post.userId],
            followingCount: currentUser.followingCount + 1,
          };
          updateCurrentUser(updated);
          showToast(`Now following @${post.username}`);
        }
      }
      refreshData();
    } catch (e) {
      showToast('Error updating follow status');
    }
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    showToast(isSaved ? 'Removed from saved collection' : 'Saved to collection!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Post by @${post.username}`, text: post.caption, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Post link copied to clipboard!');
    }
  };

  const handleAudioClick = () => {
    showToast(`Audio: ${post.audioName || 'Original Audio'} by ${post.audioAuthor || post.userFullName}. Saved to your audio library!`);
  };

  return (
    <article className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 text-gray-900 overflow-hidden">
      {/* Header: Author Info */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            id={`btn-post-avatar-${post.id}`}
            onClick={() => pushScreen({ name: 'user_profile', userId: post.userId })}
            className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0"
          >
            <img src={post.userAvatar} alt={post.username} className="w-full h-full object-cover" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => pushScreen({ name: 'user_profile', userId: post.userId })}
                className="font-bold text-sm text-gray-900 hover:underline tracking-tight"
              >
                {post.userFullName}
              </button>
              <span className="text-xs text-gray-500">@{post.username}</span>
            </div>
            {post.location && <p className="text-[11px] text-gray-400">{post.location}</p>}
          </div>
        </div>

        {/* Follow Button & Menu */}
        <div className="flex items-center gap-2">
          {!isSelf && (
            <button
              onClick={handleFollowToggle}
              id={`btn-post-follow-${post.id}`}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                isFollowing
                  ? 'bg-gray-100 border border-gray-200 text-gray-800 hover:bg-gray-200'
                  : 'bg-black hover:bg-neutral-800 text-white shadow-sm'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  Follow
                </>
              )}
            </button>
          )}

          <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media Player Container */}
      <div className="relative w-full bg-gray-950 aspect-square sm:aspect-4/3 overflow-hidden">
        {post.mediaType === 'video' ? (
          <video src={post.mediaUrl} controls autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" />
        )}

        {/* Song/Audio Bar for Videos */}
        {(post.mediaType === 'video' || post.audioName) && (
          <button
            onClick={handleAudioClick}
            className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-2 text-xs text-gray-900 hover:bg-white transition-all shadow-sm"
          >
            <Music className="w-3.5 h-3.5 text-rose-500 animate-spin" />
            <span className="font-medium text-[11px] truncate max-w-[200px]">
              {post.audioName || 'Original Sound'} • {post.audioAuthor || post.userFullName}
            </span>
          </button>
        )}
      </div>

      {/* Actions Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            id={`btn-like-post-${post.id}`}
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 transition-transform active:scale-125 ${
              isLiked ? 'text-red-500 font-bold' : 'text-gray-700 hover:text-red-500'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {/* Comment */}
          <button
            id={`btn-comment-post-${post.id}`}
            onClick={() => onOpenComments(post.id)}
            className="flex items-center gap-1.5 text-gray-700 hover:text-black transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* Send to Friend */}
          <button
            id={`btn-send-post-${post.id}`}
            onClick={() => (onSendToFriend ? onSendToFriend(post) : handleShare())}
            className="flex items-center gap-1.5 text-gray-700 hover:text-black transition-colors"
          >
            <Send className="w-6 h-6" />
          </button>

          {/* External Share */}
          <button onClick={handleShare} className="text-gray-500 hover:text-black">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Save to Collection */}
        <button
          id={`btn-save-post-${post.id}`}
          onClick={handleSaveToggle}
          className={`transition-all ${isSaved ? 'text-black fill-black' : 'text-gray-500 hover:text-black'}`}
        >
          <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-black' : ''}`} />
        </button>
      </div>

      {/* Details & Caption */}
      <div className="px-4 pb-4 space-y-1.5">
        {/* Likes Count */}
        <p className="text-xs font-bold text-gray-900">{likesCount.toLocaleString()} likes</p>

        {/* Caption & Hashtags */}
        {post.caption && (
          <p className="text-xs text-gray-800 leading-relaxed">
            <span className="font-bold mr-1.5 text-gray-900">@{post.username}</span>
            {post.caption}
          </p>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {post.hashtags.map((ht) => (
              <button
                key={ht}
                onClick={() => pushScreen({ name: 'search' })}
                className="text-[11px] font-semibold text-gray-900 hover:underline"
              >
                {ht}
              </button>
            ))}
          </div>
        )}

        {/* Comments Link */}
        {post.commentsCount > 0 && (
          <button
            onClick={() => onOpenComments(post.id)}
            className="text-xs text-gray-500 hover:text-gray-900 pt-1 font-medium block"
          >
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-gray-400 font-medium tracking-tight uppercase pt-0.5">
          {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </p>
      </div>
    </article>
  );
};

