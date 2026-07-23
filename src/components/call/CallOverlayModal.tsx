import React, { useState, useEffect } from 'react';
import { PhoneOff, PhoneCall, Mic, MicOff, Volume2, VolumeX, Camera, SwitchCamera } from 'lucide-react';
import { useSocial } from '../../context/SocialContext.js';

export const CallOverlayModal: React.FC = () => {
  const { activeCall, endCall, acceptCall, declineCall } = useSocial();

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(activeCall?.type === 'video');
  const [isFrontCam, setIsFrontCam] = useState(true);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (activeCall?.status === 'connected') {
      timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall?.status]);

  if (!activeCall) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] flex flex-col justify-between p-6 text-gray-900 overflow-hidden">
      {/* Background Video Simulation if Video Call */}
      {activeCall.type === 'video' && isVideoOn && (
        <div className="absolute inset-0 z-0 bg-gray-100">
          <img
            src={activeCall.receiverAvatar}
            alt="Video Feed"
            className="w-full h-full object-cover filter blur-sm scale-105 opacity-30"
          />
          <div className="absolute top-6 right-6 w-28 h-40 rounded-2xl border-2 border-gray-300 overflow-hidden shadow-xl bg-white">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"
              alt="Self Camera"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="relative z-10 text-center pt-8">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
          {activeCall.type === 'video' ? 'Video Call' : 'Audio Call'}
        </p>
        <h2 className="text-2xl font-black text-gray-900">{activeCall.receiverName}</h2>
        <p className="text-xs text-gray-500 mt-1 font-mono">
          {activeCall.status === 'ringing'
            ? 'Ringing...'
            : activeCall.status === 'connected'
            ? formatDuration(duration)
            : activeCall.status}
        </p>
      </div>

      {/* Center Avatar / Calling Ringing Pulse */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="relative w-32 h-32 rounded-full p-1 bg-white border-2 border-gray-200 shadow-xl">
          <img src={activeCall.receiverAvatar} alt="Receiver" className="w-full h-full object-cover rounded-full" />
          {activeCall.status === 'ringing' && (
            <div className="absolute inset-0 rounded-full border-2 border-black animate-ping opacity-30" />
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl p-4 max-w-sm mx-auto w-full space-y-4 shadow-xl">
        {/* Toggle Buttons */}
        <div className="flex items-center justify-around">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl border transition-all ${
              isMuted ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-3.5 rounded-2xl border transition-all ${
              isSpeaker ? 'bg-black border-black text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {activeCall.type === 'video' && (
            <>
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  !isVideoOn ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Camera className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsFrontCam(!isFrontCam)}
                className="p-3.5 rounded-2xl bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Accept / Decline / End */}
        <div className="flex items-center justify-center gap-6 pt-2">
          {activeCall.status === 'ringing' ? (
            <>
              <button
                onClick={declineCall}
                id="btn-decline-call"
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              <button
                onClick={acceptCall}
                id="btn-accept-call"
                className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md animate-bounce"
              >
                <PhoneCall className="w-6 h-6" />
              </button>
            </>
          ) : (
            <button
              onClick={endCall}
              id="btn-end-call"
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

