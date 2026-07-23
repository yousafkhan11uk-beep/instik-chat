import React, { useState, useEffect } from 'react';
import { Mic, Trash2, Send } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoice: (durationSeconds: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendVoice, onCancel }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-2xl p-3 w-full">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        <span className="text-xs font-mono font-bold text-gray-900">{formatTime(seconds)}</span>
        <span className="text-xs text-gray-500">Recording voice message...</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Cancel Recording"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSendVoice(Math.max(1, seconds))}
          className="p-2 bg-black hover:bg-neutral-800 text-white rounded-full font-bold shadow-xs active:scale-95 transition-all"
          title="Send Voice Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

