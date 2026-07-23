import React, { useState } from 'react';
import { X, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'contact' | 'otp' | 'reset'>('contact');
  const [contact, setContact] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setError('Please enter your email or phone number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const type = contact.includes('@') ? 'email' : 'phone';
      const res = await api.sendOtp(contact, type);
      if (res.success) {
        setDemoOtp(res.demoCode || '');
        setStep('otp');
      } else {
        setError(res.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setError(err.message || 'Error requesting OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }
    setError('');
    setStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.resetPassword(contact, otpCode, newPassword);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 w-full max-w-md rounded-3xl p-6 shadow-xl relative text-gray-900">
        <button
          onClick={onClose}
          id="btn-close-forgot-pw"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gray-100 text-black rounded-2xl border border-gray-200">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Reset Password</h2>
            <p className="text-xs text-gray-500">Step {step === 'contact' ? '1' : step === 'otp' ? '2' : '3'} of 3</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">{error}</div>}

        {step === 'contact' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email or Phone Number</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Enter registered email or phone"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black text-gray-900 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              id="btn-send-reset-otp"
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs text-gray-500">
              We sent a verification code to <span className="text-gray-900 font-semibold">{contact}</span>.
            </p>

            {demoOtp && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-gray-700">
                <span>Verification Code: <strong className="text-black text-sm font-mono tracking-wider">{demoOtp}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoOtp)}
                  className="text-[11px] underline font-bold text-black hover:text-gray-700"
                >
                  Auto-fill
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-black focus:outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              id="btn-verify-reset-otp"
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              Verify Code
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars (e.g. Mok@2026)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black text-gray-900 pr-10 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="btn-confirm-new-pw"
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Updating Password...' : 'Confirm New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

