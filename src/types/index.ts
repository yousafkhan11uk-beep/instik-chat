export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar: string;
  isPrivate: boolean;
  isVerified?: boolean;
  role: UserRole;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isOnline?: boolean;
  lastSeen?: string;
  followingIds?: string[];
  followerIds?: string[];
  followRequestIds?: string[]; // users who requested to follow this user
  pendingFollowRequestsSent?: string[]; // users this user requested to follow
  blockedUserIds?: string[];
  savedPostIds?: string[];
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  userFullName: string;
  username: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string; // ISO string
  expiresAt: string; // ISO string 24h later
  views: { userId: string; username: string; userAvatar: string; viewedAt: string }[];
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userFullName: string;
  username: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[];
  parentId?: string; // for nested replies
}

export interface Post {
  id: string;
  userId: string;
  userFullName: string;
  username: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  hashtags: string[];
  location?: string;
  audioName?: string;
  audioAuthor?: string;
  likesCount: number;
  likedBy: string[];
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  savedBy: string[];
  createdAt: string;
  isDraft?: boolean;
  taggedUsers?: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'document' | 'sticker' | 'gif';
  content: string; // text or media URL/data
  fileName?: string;
  fileSize?: string;
  voiceDuration?: number; // seconds
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'seen';
  replyToMessageId?: string;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  isEdited?: boolean;
}

export interface Conversation {
  id: string;
  participants: User[]; // participants in chat
  participantIds: string[];
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessage?: ChatMessage;
  updatedAt: string;
  unreadCount: Record<string, number>; // userId -> count
  isMuted?: Record<string, boolean>; // userId -> isMuted
  isPendingRequest?: boolean; // if true, message request
  requestedBy?: string;
}

export interface AppNotification {
  id: string;
  userId: string; // recipient
  senderId: string;
  senderFullName: string;
  senderUsername: string;
  senderAvatar: string;
  type:
    | 'follow'
    | 'follow_request'
    | 'follow_accept'
    | 'like'
    | 'comment'
    | 'reply'
    | 'share'
    | 'save'
    | 'mention'
    | 'story_like'
    | 'story_reply'
    | 'message_reaction'
    | 'group_invite'
    | 'channel_invite';
  text: string;
  targetPostId?: string;
  targetStoryId?: string;
  targetConversationId?: string;
  targetPostPreview?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'declined' | 'missed';
  startedAt?: string;
  durationSeconds?: number;
}

export interface SavedCollection {
  id: string;
  userId: string;
  name: string;
  coverImage?: string;
  postIds: string[];
  createdAt: string;
}

export interface OfflineMediaItem {
  id: string;
  title: string;
  category: 'video' | 'photo' | 'audio';
  url: string;
  fileSize: number; // in bytes
  duration?: string;
  addedAt: string;
  thumbnailUrl?: string;
  isFavorite?: boolean;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: 'user' | 'post' | 'story' | 'comment' | 'message';
  targetId: string;
  targetOwnerUsername?: string;
  reason: 'Spam' | 'Harassment' | 'Fake Account' | 'Hate Content' | 'Violence' | 'Other';
  details?: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  createdAt: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  dailyActiveUsers: number;
  newRegistrationsToday: number;
  postsUploaded: number;
  storiesUploaded: number;
  messagesSent: number;
}
