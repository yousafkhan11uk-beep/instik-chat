import React from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] flex flex-col items-center justify-center p-6 text-gray-900 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        onAnimationComplete={() => {
          setTimeout(onComplete, 800);
        }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 mb-6 bg-black rounded-2xl flex items-center justify-center shadow-lg">
          <div className="w-8 h-8 border-2 border-white rotate-45" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl font-bold tracking-tight uppercase text-gray-900 mb-2"
        >
          Mok Social
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-xs text-gray-500 font-medium tracking-widest uppercase"
        >
          Connect • Share • Experience
        </motion.p>
      </motion.div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
};

