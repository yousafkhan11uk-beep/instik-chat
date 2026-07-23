import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Video, MessageCircle, Globe } from 'lucide-react';
import { LoginForm } from './LoginForm.js';
import { SignUpForm } from './SignUpForm.js';

export const WelcomeScreen: React.FC = () => {
  const [view, setView] = useState<'welcome' | 'login' | 'signup'>('welcome');

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <LoginForm onSwitchToSignUp={() => setView('signup')} />
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <SignUpForm onSwitchToLogin={() => setView('login')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center pt-10 text-center"
      >
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-md mb-4">
          <div className="w-7 h-7 border-2 border-white rotate-45" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight uppercase text-gray-900">
          Mok Social
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">Clean Minimalism Realtime Social</p>
      </motion.div>

      {/* Hero Features Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3 my-auto py-6"
      >
        <div className="p-4 bg-white border border-gray-200 rounded-2xl flex flex-col items-center text-center shadow-sm">
          <Video className="w-6 h-6 text-black mb-2" />
          <h3 className="text-xs font-bold text-gray-900">HD Stories & Video</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Share moments in high definition</p>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-2xl flex flex-col items-center text-center shadow-sm">
          <MessageCircle className="w-6 h-6 text-black mb-2" />
          <h3 className="text-xs font-bold text-gray-900">Realtime Chat</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Voice messages, calls & stickers</p>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-2xl flex flex-col items-center text-center shadow-sm">
          <Users className="w-6 h-6 text-black mb-2" />
          <h3 className="text-xs font-bold text-gray-900">Global Community</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Connect with friends worldwide</p>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-2xl flex flex-col items-center text-center shadow-sm">
          <Globe className="w-6 h-6 text-black mb-2" />
          <h3 className="text-xs font-bold text-gray-900">Offline Library</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Save & enjoy media offline</p>
        </div>
      </motion.div>

      {/* Bottom Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-3 pb-8"
      >
        <button
          onClick={() => setView('login')}
          id="btn-welcome-login"
          className="w-full py-4 bg-black hover:bg-neutral-800 text-white font-bold rounded-2xl text-sm transition-all shadow-sm active:scale-[0.99]"
        >
          Log In
        </button>

        <button
          onClick={() => setView('signup')}
          id="btn-welcome-signup"
          className="w-full py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-2xl text-sm transition-all border border-gray-200 active:scale-[0.99]"
        >
          Sign Up
        </button>

        <p className="text-[11px] text-center text-gray-400 pt-2">
          By signing up, you agree to our <span className="underline cursor-pointer text-gray-600">Terms</span> & <span className="underline cursor-pointer text-gray-600">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
};

