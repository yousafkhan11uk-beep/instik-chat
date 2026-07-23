import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  User,
  Post,
  Story,
  PostComment,
  ChatMessage,
  Conversation,
  AppNotification,
  CallSession,
  ContentReport,
  SavedCollection,
} from './src/types/index.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// In-memory Database with local file persistence
const DB_FILE = path.join(process.cwd(), 'data_db.json');

interface LocalDB {
  users: (User & { passwordHash?: string })[];
  posts: Post[];
  stories: Story[];
  comments: PostComment[];
  messages: ChatMessage[];
  conversations: Conversation[];
  notifications: AppNotification[];
  calls: CallSession[];
  reports: ContentReport[];
  collections: SavedCollection[];
  otps: Record<string, { code: string; expiresAt: number }>;
  rateLimits: Record<string, { count: number; resetAt: number }>;
}

const defaultDB: LocalDB = {
  users: [
    {
      id: 'usr_admin',
      fullName: 'Mok Admin',
      username: 'admin',
      email: 'admin@mok.app',
      phone: '+15550001111',
      bio: 'Official Administrator of Mok Social Platform.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      isPrivate: false,
      isVerified: true,
      role: 'admin',
      followersCount: 1540,
      followingCount: 12,
      postsCount: 3,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      followingIds: ['usr_sarah', 'usr_alex'],
      followerIds: ['usr_sarah', 'usr_alex', 'usr_lucas', 'usr_elena'],
      passwordHash: 'Admin@2026',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_sarah',
      fullName: 'Sarah Chen',
      username: 'sarah_dev',
      email: 'sarah@example.com',
      bio: 'Frontend Architect & UI Designer ✨ Building the future of social apps.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      isPrivate: false,
      isVerified: true,
      role: 'user',
      followersCount: 890,
      followingCount: 140,
      postsCount: 8,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      followingIds: ['usr_admin', 'usr_alex'],
      followerIds: ['usr_admin', 'usr_alex'],
      passwordHash: 'Mok@2026',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_alex',
      fullName: 'Alex Rivera',
      username: 'alex_art',
      email: 'alex@example.com',
      bio: 'Digital artist & photographer 📷 Capturing life in motion.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      isPrivate: false,
      isVerified: false,
      role: 'user',
      followersCount: 1200,
      followingCount: 310,
      postsCount: 12,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      followingIds: ['usr_sarah'],
      followerIds: ['usr_sarah', 'usr_admin'],
      passwordHash: 'Mok@2026',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_lucas',
      fullName: 'Lucas Vane',
      username: 'lucas_music',
      email: 'lucas@example.com',
      bio: 'Music Producer 🎵 Lo-Fi Beats & Synthwave. Stream my new single below!',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      isPrivate: false,
      isVerified: true,
      role: 'user',
      followersCount: 3400,
      followingCount: 220,
      postsCount: 15,
      isOnline: false,
      lastSeen: new Date(Date.now() - 15 * 60000).toISOString(),
      followingIds: [],
      followerIds: ['usr_admin'],
      passwordHash: 'Mok@2026',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_elena',
      fullName: 'Elena Rostova',
      username: 'elena.tech',
      email: 'elena@example.com',
      bio: 'AI Research Scientist 🤖 Exploring neural representations and generative creative models.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      isPrivate: true,
      isVerified: false,
      role: 'user',
      followersCount: 450,
      followingCount: 90,
      postsCount: 4,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      followingIds: [],
      followerIds: [],
      passwordHash: 'Mok@2026',
      createdAt: new Date().toISOString(),
    },
  ],
  posts: [
    {
      id: 'post_1',
      userId: 'usr_sarah',
      userFullName: 'Sarah Chen',
      username: 'sarah_dev',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      mediaType: 'image',
      caption: 'Testing the vibrant new interface on Mok Social! Responsive layouts and glassmorphism accents. 🚀',
      hashtags: ['#MokSocial', '#UIUX', '#DesignSystem', '#React'],
      location: 'San Francisco, CA',
      likesCount: 142,
      likedBy: ['usr_admin', 'usr_alex', 'usr_lucas'],
      commentsCount: 3,
      sharesCount: 18,
      savesCount: 24,
      savedBy: ['usr_admin'],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'post_2',
      userId: 'usr_alex',
      userFullName: 'Alex Rivera',
      username: 'alex_art',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      mediaType: 'video',
      caption: 'Sunset mountain hyperlapse recording. Nature never fails to amaze. 🏔️✨',
      hashtags: ['#Hyperlapse', '#Nature', '#Cinematic', '#Travel'],
      location: 'Swiss Alps',
      audioName: 'Midnight Chill (Lo-Fi Remix)',
      audioAuthor: 'Lucas Vane',
      likesCount: 289,
      likedBy: ['usr_sarah', 'usr_lucas'],
      commentsCount: 5,
      sharesCount: 42,
      savesCount: 51,
      savedBy: [],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'post_3',
      userId: 'usr_lucas',
      userFullName: 'Lucas Vane',
      username: 'lucas_music',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
      mediaType: 'image',
      caption: 'Studio session complete! New album dropping next Friday. Drop your favorite emoji if you want a sneak peek! 🎶🎧',
      hashtags: ['#MusicProducer', '#StudioLife', '#Synthwave', '#NewRelease'],
      likesCount: 512,
      likedBy: ['usr_admin', 'usr_sarah', 'usr_alex'],
      commentsCount: 12,
      sharesCount: 88,
      savesCount: 65,
      savedBy: [],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ],
  stories: [
    {
      id: 'story_1',
      userId: 'usr_sarah',
      userFullName: 'Sarah Chen',
      username: 'sarah_dev',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      mediaType: 'image',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 21).toISOString(),
      views: [],
    },
    {
      id: 'story_2',
      userId: 'usr_alex',
      userFullName: 'Alex Rivera',
      username: 'alex_art',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
      mediaType: 'image',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 18).toISOString(),
      views: [],
    },
  ],
  comments: [
    {
      id: 'cmt_1',
      postId: 'post_1',
      userId: 'usr_alex',
      userFullName: 'Alex Rivera',
      username: 'alex_art',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      text: 'This UI looks insanely clean and responsive! High five 🙌',
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      likesCount: 8,
      likedBy: ['usr_sarah'],
    },
    {
      id: 'cmt_2',
      postId: 'post_1',
      userId: 'usr_admin',
      userFullName: 'Mok Admin',
      username: 'admin',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      text: 'Welcome to Mok Social! Let us know if you need any features.',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      likesCount: 15,
      likedBy: ['usr_sarah', 'usr_alex'],
    },
  ],
  messages: [
    {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'usr_sarah',
      senderName: 'Sarah Chen',
      senderUsername: 'sarah_dev',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      type: 'text',
      content: 'Hey! Did you check out the new chat layout on Mok Social?',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      status: 'seen',
    },
  ],
  conversations: [
    {
      id: 'conv_1',
      participants: [
        {
          id: 'usr_admin',
          fullName: 'Mok Admin',
          username: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          isPrivate: false,
          role: 'admin',
          followersCount: 1540,
          followingCount: 12,
          postsCount: 3,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'usr_sarah',
          fullName: 'Sarah Chen',
          username: 'sarah_dev',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
          isPrivate: false,
          role: 'user',
          followersCount: 890,
          followingCount: 140,
          postsCount: 8,
          createdAt: new Date().toISOString(),
        },
      ],
      participantIds: ['usr_admin', 'usr_sarah'],
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      unreadCount: { usr_admin: 1, usr_sarah: 0 },
      isMuted: {},
      isPendingRequest: false,
    },
  ],
  notifications: [
    {
      id: 'notif_1',
      userId: 'usr_admin',
      senderId: 'usr_sarah',
      senderFullName: 'Sarah Chen',
      senderUsername: 'sarah_dev',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      type: 'like',
      text: 'liked your post.',
      targetPostId: 'post_1',
      isRead: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'notif_2',
      userId: 'usr_admin',
      senderId: 'usr_alex',
      senderFullName: 'Alex Rivera',
      senderUsername: 'alex_art',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      type: 'follow',
      text: 'started following you.',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ],
  calls: [],
  reports: [],
  collections: [
    {
      id: 'col_1',
      userId: 'usr_admin',
      name: 'Design Inspiration',
      postIds: ['post_1'],
      createdAt: new Date().toISOString(),
    },
  ],
  otps: {},
  rateLimits: {},
};

function loadDB(): LocalDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...defaultDB, ...parsed };
    }
  } catch (e) {
    console.error('Error reading db file, fallback to defaultDB', e);
  }
  saveDB(defaultDB);
  return defaultDB;
}

function saveDB(db: LocalDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving db file', e);
  }
}

let db = loadDB();

// Helper: Username rules validation
function isValidUsername(username: string): { valid: boolean; message?: string } {
  if (!username) return { valid: false, message: 'Username is required.' };
  if (username !== username.toLowerCase()) {
    return { valid: false, message: 'Username must contain only lowercase letters.' };
  }
  if (/\s/.test(username)) {
    return { valid: false, message: 'Username cannot contain spaces.' };
  }
  const regex = /^[a-z0-9_.]+$/;
  if (!regex.test(username)) {
    return { valid: false, message: 'Only lowercase letters, numbers, underscore (_), and dot (.) are allowed.' };
  }
  return { valid: true };
}

// Helper: Generate 3-5 username suggestions
function generateUsernameSuggestions(baseUsername: string): string[] {
  const clean = baseUsername.toLowerCase().replace(/[^a-z0-9_.]/g, '') || 'mok';
  const candidates = [
    `${clean}_01`,
    `${clean}.ai01`,
    `official_${clean}`,
    `${clean}_786`,
    `real.${clean}`,
    `${clean}_app`,
  ];
  return candidates.filter((cand) => !db.users.some((u) => u.username === cand)).slice(0, 5);
}

// Helper: Password complexity validation
function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long.' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number.' };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (e.g. Mok@2026).' };
  }
  return { valid: true };
}

// ----------------- API ROUTES -----------------

// Username availability check
app.get('/api/users/check-username', (req, res) => {
  const username = (req.query.username as string || '').trim().toLowerCase();
  const ruleCheck = isValidUsername(username);
  if (!ruleCheck.valid) {
    return res.json({ available: false, error: ruleCheck.message, suggestions: generateUsernameSuggestions(username) });
  }
  const exists = db.users.some((u) => u.username === username);
  if (exists) {
    return res.json({
      available: false,
      error: 'This username is already taken.',
      suggestions: generateUsernameSuggestions(username),
    });
  }
  return res.json({ available: true, suggestions: [] });
});

// Send OTP
app.post('/api/auth/send-otp', (req, res) => {
  const { destination, type } = req.body; // type: 'email' | 'phone'
  if (!destination) return res.status(400).json({ error: 'Email or phone number is required.' });

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
  db.otps[destination] = { code, expiresAt: Date.now() + 10 * 60000 };
  saveDB(db);

  return res.json({
    success: true,
    message: `Verification code sent to ${destination}`,
    demoCode: code, // returned for seamless user testing
  });
});

// Sign Up
app.post('/api/auth/signup', (req, res) => {
  const { fullName, username, contact, contactType, password, otp } = req.body;

  if (!fullName || !username || !contact || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const uCheck = isValidUsername(username);
  if (!uCheck.valid) {
    return res.status(400).json({ error: uCheck.message, suggestions: generateUsernameSuggestions(username) });
  }

  const userExists = db.users.some((u) => u.username === username);
  if (userExists) {
    return res.status(400).json({
      error: 'This username is already taken.',
      suggestions: generateUsernameSuggestions(username),
    });
  }

  const pCheck = isValidPassword(password);
  if (!pCheck.valid) {
    return res.status(400).json({ error: pCheck.message });
  }

  // OTP check
  const storedOtp = db.otps[contact];
  if (!storedOtp || storedOtp.code !== otp || Date.now() > storedOtp.expiresAt) {
    return res.status(400).json({ error: 'Invalid or expired verification code.' });
  }

  delete db.otps[contact];

  const newUser: User & { passwordHash: string } = {
    id: `usr_${Date.now()}`,
    fullName,
    username: username.toLowerCase(),
    email: contactType === 'email' ? contact : undefined,
    phone: contactType === 'phone' ? contact : undefined,
    bio: `Hey there! I am using Mok Social.`,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`,
    isPrivate: false,
    role: 'user',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    followingIds: [],
    followerIds: [],
    passwordHash: password,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDB(db);

  const { passwordHash, ...userWithoutPassword } = newUser;
  return res.json({ success: true, user: userWithoutPassword });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { loginInput, password } = req.body;
  if (!loginInput || !password) {
    return res.status(400).json({ error: 'Username/Email/Phone and Password are required.' });
  }

  const cleanInput = loginInput.trim().toLowerCase();
  const user = db.users.find(
    (u) =>
      u.username === cleanInput ||
      (u.email && u.email.toLowerCase() === cleanInput) ||
      (u.phone && u.phone === cleanInput)
  );

  if (!user) {
    return res.status(404).json({ error: 'Account not found. Please create a new account.' });
  }

  if (user.passwordHash !== password) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  user.isOnline = true;
  user.lastSeen = new Date().toISOString();
  saveDB(db);

  const { passwordHash, ...userWithoutPassword } = user;
  return res.json({ success: true, user: userWithoutPassword, redirectToAdmin: user.role === 'admin' });
});

// Forgot Password - Reset
app.post('/api/auth/reset-password', (req, res) => {
  const { contact, otp, newPassword } = req.body;
  const storedOtp = db.otps[contact];
  if (!storedOtp || storedOtp.code !== otp || Date.now() > storedOtp.expiresAt) {
    return res.status(400).json({ error: 'Invalid or expired OTP code.' });
  }

  const pCheck = isValidPassword(newPassword);
  if (!pCheck.valid) return res.status(400).json({ error: pCheck.message });

  const user = db.users.find((u) => u.email === contact || u.phone === contact);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  user.passwordHash = newPassword;
  delete db.otps[contact];
  saveDB(db);

  return res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
});

// User Search
app.get('/api/users/search', (req, res) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  if (!q) {
    return res.json({ users: db.users.slice(0, 10).map(({ passwordHash, ...u }) => u) });
  }
  const results = db.users
    .filter((u) => u.username.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q))
    .map(({ passwordHash, ...u }) => u);
  return res.json({ users: results });
});

// Get User Profile
app.get('/api/users/:id', (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id || u.username === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...uNoPass } = user;
  return res.json({ user: uNoPass });
});

// Edit Profile
app.put('/api/users/:id/profile', (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { fullName, username, bio, avatar } = req.body;

  if (username && username !== user.username) {
    const uCheck = isValidUsername(username);
    if (!uCheck.valid) return res.status(400).json({ error: uCheck.message, suggestions: generateUsernameSuggestions(username) });
    const exists = db.users.some((u) => u.id !== user.id && u.username === username);
    if (exists) {
      return res.status(400).json({ error: 'This username is already taken.', suggestions: generateUsernameSuggestions(username) });
    }
    user.username = username.toLowerCase();
  }

  if (fullName) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
  if (avatar) user.avatar = avatar;

  saveDB(db);
  const { passwordHash, ...uNoPass } = user;
  return res.json({ success: true, user: uNoPass });
});

// Follow / Unfollow System
app.post('/api/users/:id/follow', (req, res) => {
  const { followerId } = req.body;
  const targetUser = db.users.find((u) => u.id === req.params.id);
  const current = db.users.find((u) => u.id === followerId);

  if (!targetUser || !current) return res.status(404).json({ error: 'User not found' });

  if (targetUser.isPrivate) {
    // Follow request
    targetUser.followRequestIds = targetUser.followRequestIds || [];
    if (!targetUser.followRequestIds.includes(followerId)) {
      targetUser.followRequestIds.push(followerId);
    }
    current.pendingFollowRequestsSent = current.pendingFollowRequestsSent || [];
    if (!current.pendingFollowRequestsSent.includes(targetUser.id)) {
      current.pendingFollowRequestsSent.push(targetUser.id);
    }

    // Add Notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: targetUser.id,
      senderId: current.id,
      senderFullName: current.fullName,
      senderUsername: current.username,
      senderAvatar: current.avatar,
      type: 'follow_request',
      text: 'sent you a follow request.',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveDB(db);
    return res.json({ status: 'requested' });
  } else {
    // Direct follow
    if (!current.followingIds?.includes(targetUser.id)) {
      current.followingIds = [...(current.followingIds || []), targetUser.id];
      current.followingCount = current.followingIds.length;
    }
    if (!targetUser.followerIds?.includes(current.id)) {
      targetUser.followerIds = [...(targetUser.followerIds || []), current.id];
      targetUser.followersCount = targetUser.followerIds.length;
    }

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: targetUser.id,
      senderId: current.id,
      senderFullName: current.fullName,
      senderUsername: current.username,
      senderAvatar: current.avatar,
      type: 'follow',
      text: 'started following you.',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveDB(db);
    return res.json({ status: 'following' });
  }
});

app.post('/api/users/:id/unfollow', (req, res) => {
  const { followerId } = req.body;
  const targetUser = db.users.find((u) => u.id === req.params.id);
  const current = db.users.find((u) => u.id === followerId);

  if (!targetUser || !current) return res.status(404).json({ error: 'User not found' });

  current.followingIds = (current.followingIds || []).filter((id) => id !== targetUser.id);
  current.followingCount = current.followingIds.length;

  targetUser.followerIds = (targetUser.followerIds || []).filter((id) => id !== current.id);
  targetUser.followersCount = targetUser.followerIds.length;

  if (targetUser.followRequestIds) {
    targetUser.followRequestIds = targetUser.followRequestIds.filter((id) => id !== followerId);
  }
  if (current.pendingFollowRequestsSent) {
    current.pendingFollowRequestsSent = current.pendingFollowRequestsSent.filter((id) => id !== targetUser.id);
  }

  saveDB(db);
  return res.json({ status: 'none' });
});

// Posts API
app.get('/api/posts', (req, res) => {
  const { hashtag, userId } = req.query;
  let list = db.posts;
  if (hashtag) {
    list = list.filter((p) => p.hashtags.some((h) => h.toLowerCase() === (hashtag as string).toLowerCase()));
  }
  if (userId) {
    list = list.filter((p) => p.userId === userId);
  }
  return res.json({ posts: list });
});

app.post('/api/posts', (req, res) => {
  const { userId, mediaUrl, mediaType, caption, hashtags, location, audioName, audioAuthor, isDraft } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newPost: Post = {
    id: `post_${Date.now()}`,
    userId: user.id,
    userFullName: user.fullName,
    username: user.username,
    userAvatar: user.avatar,
    mediaUrl,
    mediaType: mediaType || 'image',
    caption: caption || '',
    hashtags: hashtags || [],
    location,
    audioName,
    audioAuthor,
    likesCount: 0,
    likedBy: [],
    commentsCount: 0,
    sharesCount: 0,
    savesCount: 0,
    savedBy: [],
    createdAt: new Date().toISOString(),
    isDraft,
  };

  if (!isDraft) {
    user.postsCount += 1;
    db.posts.unshift(newPost);
  }

  saveDB(db);
  return res.json({ success: true, post: newPost });
});

app.post('/api/posts/:id/like', (req, res) => {
  const { userId } = req.body;
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const idx = post.likedBy.indexOf(userId);
  let isLiked = false;
  if (idx >= 0) {
    post.likedBy.splice(idx, 1);
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likedBy.push(userId);
    post.likesCount += 1;
    isLiked = true;

    // Notification
    const sender = db.users.find((u) => u.id === userId);
    if (sender && post.userId !== userId) {
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: post.userId,
        senderId: sender.id,
        senderFullName: sender.fullName,
        senderUsername: sender.username,
        senderAvatar: sender.avatar,
        type: 'like',
        text: 'liked your post.',
        targetPostId: post.id,
        targetPostPreview: post.mediaUrl,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  saveDB(db);
  return res.json({ likesCount: post.likesCount, isLiked });
});

// Comments API
app.get('/api/posts/:id/comments', (req, res) => {
  const comments = db.comments.filter((c) => c.postId === req.params.id);
  return res.json({ comments });
});

app.post('/api/posts/:id/comments', (req, res) => {
  const { userId, text, parentId } = req.body;
  const post = db.posts.find((p) => p.id === req.params.id);
  const user = db.users.find((u) => u.id === userId);

  if (!post || !user) return res.status(404).json({ error: 'Post or user not found' });

  const newCmt: PostComment = {
    id: `cmt_${Date.now()}`,
    postId: post.id,
    userId: user.id,
    userFullName: user.fullName,
    username: user.username,
    userAvatar: user.avatar,
    text,
    parentId,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    likedBy: [],
  };

  db.comments.push(newCmt);
  post.commentsCount += 1;

  if (post.userId !== user.id) {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: post.userId,
      senderId: user.id,
      senderFullName: user.fullName,
      senderUsername: user.username,
      senderAvatar: user.avatar,
      type: 'comment',
      text: `commented: "${text.length > 30 ? text.substring(0, 30) + '...' : text}"`,
      targetPostId: post.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  saveDB(db);
  return res.json({ success: true, comment: newCmt });
});

app.delete('/api/posts/:id/comments/:commentId', (req, res) => {
  const { commentId, id } = req.params;
  const idx = db.comments.findIndex((c) => c.id === commentId);
  if (idx >= 0) {
    db.comments.splice(idx, 1);
    const post = db.posts.find((p) => p.id === id);
    if (post) post.commentsCount = Math.max(0, post.commentsCount - 1);
    saveDB(db);
  }
  return res.json({ success: true });
});

// Stories API
app.get('/api/stories', (req, res) => {
  const now = new Date().toISOString();
  // Filter active (<24h)
  const activeStories = db.stories.filter((s) => s.expiresAt > now);
  return res.json({ stories: activeStories });
});

app.post('/api/stories', (req, res) => {
  const { userId, mediaUrl, mediaType } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const newStory: Story = {
    id: `story_${Date.now()}`,
    userId: user.id,
    userFullName: user.fullName,
    username: user.username,
    userAvatar: user.avatar,
    mediaUrl,
    mediaType: mediaType || 'image',
    createdAt: now.toISOString(),
    expiresAt,
    views: [],
  };

  db.stories.unshift(newStory);
  saveDB(db);
  return res.json({ success: true, story: newStory });
});

// Chat & Messages API
app.get('/api/conversations', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const convs = db.conversations.filter((c) => c.participantIds.includes(userId));
  return res.json({ conversations: convs });
});

app.get('/api/conversations/:id/messages', (req, res) => {
  const msgs = db.messages.filter((m) => m.conversationId === req.params.id);
  return res.json({ messages: msgs });
});

app.post('/api/conversations/:id/messages', (req, res) => {
  const { senderId, type, content, fileName, fileSize, voiceDuration, replyToMessageId } = req.body;
  const sender = db.users.find((u) => u.id === senderId);
  const conv = db.conversations.find((c) => c.id === req.params.id);

  if (!sender || !conv) return res.status(404).json({ error: 'Sender or conversation not found' });

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}`,
    conversationId: conv.id,
    senderId: sender.id,
    senderName: sender.fullName,
    senderUsername: sender.username,
    senderAvatar: sender.avatar,
    type: type || 'text',
    content,
    fileName,
    fileSize,
    voiceDuration,
    replyToMessageId,
    createdAt: new Date().toISOString(),
    status: 'delivered',
  };

  db.messages.push(newMsg);
  conv.lastMessage = newMsg;
  conv.updatedAt = newMsg.createdAt;

  // Increment unread count for other participants
  conv.participantIds.forEach((pId) => {
    if (pId !== senderId) {
      conv.unreadCount[pId] = (conv.unreadCount[pId] || 0) + 1;
    }
  });

  saveDB(db);
  return res.json({ success: true, message: newMsg });
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  const userId = req.query.userId as string;
  const notifs = db.notifications.filter((n) => n.userId === userId);
  return res.json({ notifications: notifs });
});

app.post('/api/notifications/mark-read', (req, res) => {
  const { userId } = req.body;
  db.notifications.forEach((n) => {
    if (n.userId === userId) n.isRead = true;
  });
  saveDB(db);
  return res.json({ success: true });
});

// Reports API
app.post('/api/reports', (req, res) => {
  const { reporterId, reporterUsername, targetType, targetId, reason, details } = req.body;
  const newReport: ContentReport = {
    id: `rep_${Date.now()}`,
    reporterId,
    reporterUsername,
    targetType,
    targetId,
    reason,
    details,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.reports.unshift(newReport);
  saveDB(db);
  return res.json({ success: true, report: newReport });
});

// Admin API
app.get('/api/admin/analytics', (req, res) => {
  const totalUsers = db.users.length;
  const dailyActiveUsers = db.users.filter((u) => u.isOnline).length || Math.ceil(totalUsers * 0.7);
  const newRegistrationsToday = db.users.filter((u) => {
    const diff = Date.now() - new Date(u.createdAt).getTime();
    return diff < 86400000;
  }).length;

  return res.json({
    totalUsers,
    dailyActiveUsers,
    newRegistrationsToday,
    postsUploaded: db.posts.length,
    storiesUploaded: db.stories.length,
    messagesSent: db.messages.length,
  });
});

app.get('/api/admin/reports', (req, res) => {
  return res.json({ reports: db.reports });
});

app.post('/api/admin/announcement', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  // Send to all users
  db.users.forEach((u) => {
    db.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random()}`,
      userId: u.id,
      senderId: 'usr_admin',
      senderFullName: 'Mok Social Admin',
      senderUsername: 'admin',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      type: 'channel_invite',
      text: `📢 Announcement: ${text}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  saveDB(db);
  return res.json({ success: true });
});

// Start Express Server with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
