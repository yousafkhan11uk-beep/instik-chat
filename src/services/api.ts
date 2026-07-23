import { User, Post, Story, PostComment, ChatMessage, Conversation, AppNotification, ContentReport, AdminAnalytics } from '../types/index.js';

export const api = {
  async checkUsername(username: string): Promise<{ available: boolean; error?: string; suggestions: string[] }> {
    const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
    return res.json();
  },

  async sendOtp(destination: string, type: 'email' | 'phone'): Promise<{ success: boolean; message: string; demoCode?: string }> {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, type }),
    });
    return res.json();
  },

  async signUp(data: any): Promise<{ success: boolean; user?: User; error?: string; suggestions?: string[] }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(loginInput: string, password: string): Promise<{ success: boolean; user?: User; error?: string; redirectToAdmin?: boolean }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginInput, password }),
    });
    return res.json();
  },

  async resetPassword(contact: string, otp: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact, otp, newPassword }),
    });
    return res.json();
  },

  async searchUsers(query: string): Promise<{ users: User[] }> {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
    return res.json();
  },

  async getUser(idOrUsername: string): Promise<{ user: User }> {
    const res = await fetch(`/api/users/${encodeURIComponent(idOrUsername)}`);
    return res.json();
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<{ success: boolean; user?: User; error?: string; suggestions?: string[] }> {
    const res = await fetch(`/api/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async followUser(targetUserId: string, followerId: string): Promise<{ status: 'following' | 'requested' }> {
    const res = await fetch(`/api/users/${targetUserId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId }),
    });
    return res.json();
  },

  async unfollowUser(targetUserId: string, followerId: string): Promise<{ status: 'none' }> {
    const res = await fetch(`/api/users/${targetUserId}/unfollow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId }),
    });
    return res.json();
  },

  async getPosts(filter?: { hashtag?: string; userId?: string }): Promise<{ posts: Post[] }> {
    const params = new URLSearchParams();
    if (filter?.hashtag) params.append('hashtag', filter.hashtag);
    if (filter?.userId) params.append('userId', filter.userId);
    const res = await fetch(`/api/posts?${params.toString()}`);
    return res.json();
  },

  async createPost(postData: any): Promise<{ success: boolean; post: Post }> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    return res.json();
  },

  async toggleLikePost(postId: string, userId: string): Promise<{ likesCount: number; isLiked: boolean }> {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async getComments(postId: string): Promise<{ comments: PostComment[] }> {
    const res = await fetch(`/api/posts/${postId}/comments`);
    return res.json();
  },

  async addComment(postId: string, userId: string, text: string, parentId?: string): Promise<{ success: boolean; comment: PostComment }> {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text, parentId }),
    });
    return res.json();
  },

  async deleteComment(postId: string, commentId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
    return res.json();
  },

  async getStories(): Promise<{ stories: Story[] }> {
    const res = await fetch('/api/stories');
    return res.json();
  },

  async createStory(storyData: any): Promise<{ success: boolean; story: Story }> {
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyData),
    });
    return res.json();
  },

  async getConversations(userId: string): Promise<{ conversations: Conversation[] }> {
    const res = await fetch(`/api/conversations?userId=${encodeURIComponent(userId)}`);
    return res.json();
  },

  async getMessages(conversationId: string): Promise<{ messages: ChatMessage[] }> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    return res.json();
  },

  async sendMessage(conversationId: string, messageData: any): Promise<{ success: boolean; message: ChatMessage }> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    return res.json();
  },

  async getNotifications(userId: string): Promise<{ notifications: AppNotification[] }> {
    const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
    return res.json();
  },

  async markNotificationsRead(userId: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async submitReport(data: any): Promise<{ success: boolean; report: ContentReport }> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const res = await fetch('/api/admin/analytics');
    return res.json();
  },

  async sendAdminAnnouncement(text: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/admin/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.json();
  },
};
