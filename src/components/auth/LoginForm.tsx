import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSocial } from '../../context/SocialContext.js';
import { ForgotPasswordModal } from './ForgotPasswordModal.js';

interface LoginFormProps {
  onSwitchToSignUp: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignUp }) => {
  const { login } = useAuth();
  const { pushScreen, showToast } = useSocial();

  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPw, setShowForgotPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await login(loginInput.trim(), password.trim(), rememberMe);
      if (res.success) {
        showToast('Welcome back to Mok Social!');
        if (res.redirectToAdmin) {
          pushScreen({ name: 'admin_dashboard' });
        }
      } else {
        setError(res.error || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white border border-gray-200 rounded-3xl shadow-sm text-gray-900">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-3 bg-black rounded-2xl flex items-center justify-center shadow-md">
          <div className="w-6 h-6 border-2 border-white rotate-45" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Log In</h2>
        <p className="text-xs text-gray-500 mt-1">Enter your credentials to continue</p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username / Phone / Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Username, Email, or Phone</label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              id="input-login-identity"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="e.g. mok_123 or admin"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-black text-gray-900 placeholder-gray-400 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="input-login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-black text-gray-900 placeholder-gray-400 transition-colors"
            />
            <button
              type="button"
              id="btn-login-toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between pt-1 pb-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
            <input
              type="checkbox"
              id="checkbox-remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-50 border-gray-300 text-black focus:ring-0 accent-black"
            />
            Remember Me
          </label>

          <button
            type="button"
            id="btn-forgot-password"
            onClick={() => setShowForgotPw(true)}
            className="text-xs font-semibold text-gray-900 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          id="btn-login-submit"
          disabled={loading}
          className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Log In'
          )}
        </button>
      </form>

      {/* Admin Quick Login Hint */}
      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <p className="text-[11px] text-gray-500">
          Demo Admin Account: <span className="text-gray-900 font-mono">admin</span> / <span className="text-gray-900 font-mono">Admin@2026</span>
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Don't have an account?{' '}
          <button
            type="button"
            id="btn-switch-signup"
            onClick={onSwitchToSignUp}
            className="text-black font-bold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>

      {showForgotPw && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPw(false)}
          onSuccess={() => {
            setShowForgotPw(false);
            showToast('Password reset! Please log in with your new password.');
          }}
        />
      )}
    </div>
  );
};

