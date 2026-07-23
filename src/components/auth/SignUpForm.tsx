import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useSocial } from '../../context/SocialContext.js';
import { api } from '../../services/api.js';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToLogin }) => {
  const { signup } = useAuth();
  const { showToast } = useSocial();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    valid?: boolean;
    error?: string;
    suggestions?: string[];
  }>({ checking: false });

  // OTP state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time username check on debounce
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus({ checking: false });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true });
      try {
        const res = await api.checkUsername(username.toLowerCase());
        if (res.available) {
          setUsernameStatus({ checking: false, valid: true });
        } else {
          setUsernameStatus({ checking: false, valid: false, error: res.error, suggestions: res.suggestions });
        }
      } catch (err) {
        setUsernameStatus({ checking: false, valid: false, error: 'Could not check username' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  // Handle Initial Submit -> Trigger OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !username.trim() || !contact.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (usernameStatus.valid === false) {
      setError(usernameStatus.error || 'Please enter a valid, available username.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Password rule check
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('Password must contain at least one special character (e.g. Mok@2026).');
      return;
    }

    // Request OTP
    setLoading(true);
    try {
      const res = await api.sendOtp(contact.trim(), contactType);
      if (res.success) {
        setDemoCode(res.demoCode || '');
        setShowOtpModal(true);
      } else {
        setError(res.message || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Final OTP Verification & Account Creation
  const handleVerifyAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await signup({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        contact: contact.trim(),
        contactType,
        password,
        otp: otpCode.trim(),
      });

      if (res.success) {
        showToast('Account created successfully! Welcome to Mok Social.');
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white border border-gray-200 rounded-3xl shadow-sm text-gray-900">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-2 bg-black rounded-2xl flex items-center justify-center shadow-md">
          <div className="w-5 h-5 border-2 border-white rotate-45" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h2>
        <p className="text-xs text-gray-500 mt-1">Join Mok Social today</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            id="input-signup-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Mok Khan"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black placeholder-gray-400"
          />
        </div>

        {/* Username */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700">Username</label>
            <span className="text-[10px] text-gray-400">a-z, 0-9, _, . (no spaces)</span>
          </div>
          <div className="relative">
            <input
              type="text"
              id="input-signup-username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
              placeholder="e.g. mok_123"
              className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none placeholder-gray-400 ${
                usernameStatus.valid === true
                  ? 'border-emerald-500 focus:border-emerald-600'
                  : usernameStatus.valid === false
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-200 focus:border-black'
              }`}
            />
            {usernameStatus.checking && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            )}
            {usernameStatus.valid === true && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            )}
          </div>

          {usernameStatus.valid === false && (
            <div className="mt-2 space-y-1.5">
              <p className="text-[11px] text-red-600 font-medium">{usernameStatus.error}</p>
              {usernameStatus.suggestions && usernameStatus.suggestions.length > 0 && (
                <div>
                  <p className="text-[11px] text-gray-500">Available suggestions (tap to use):</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {usernameStatus.suggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setUsername(sug)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 rounded-lg text-xs font-mono font-medium transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Selector (Phone or Email) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700">Contact Method</label>
            <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[11px]">
              <button
                type="button"
                onClick={() => setContactType('email')}
                className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
                  contactType === 'email' ? 'bg-black text-white' : 'text-gray-500'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setContactType('phone')}
                className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
                  contactType === 'phone' ? 'bg-black text-white' : 'text-gray-500'
                }`}
              >
                Phone
              </button>
            </div>
          </div>
          <input
            type={contactType === 'email' ? 'email' : 'tel'}
            id="input-signup-contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={contactType === 'email' ? 'yourname@example.com' : '+15550001234'}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black placeholder-gray-400"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="input-signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. Mok@2026"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black pr-10 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="input-signup-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-black pr-10 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          id="btn-signup-submit"
          className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Continue to OTP Verification'
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-xs text-gray-500">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="text-black font-bold hover:underline">
            Log In
          </button>
        </p>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 w-full max-w-sm rounded-3xl p-6 shadow-xl relative text-gray-900">
            <button
              type="button"
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 text-black rounded-2xl flex items-center justify-center border border-gray-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">OTP Verification</h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter the verification code sent to <strong className="text-gray-900">{contact}</strong>
              </p>
            </div>

            {demoCode && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-gray-700">
                <span>Code: <strong className="text-black text-sm font-mono tracking-wider">{demoCode}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoCode)}
                  className="text-[11px] underline font-bold text-black hover:text-gray-700"
                >
                  Auto-fill
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyAndCreate} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-widest text-black focus:outline-none focus:border-black"
              />

              <button
                type="submit"
                disabled={loading}
                id="btn-confirm-otp-signup"
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
              >
                {loading ? 'Creating Account...' : 'Verify & Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

