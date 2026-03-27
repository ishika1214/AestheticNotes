import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login, register, clearError } from '../../store/slices/authSlice';
import authbackground from '../../assets/Aesthetic-Logo.png';

export default function AuthModal() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      dispatch(login({ email: authForm.email, password: authForm.password }));
    } else {
      dispatch(register(authForm));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="
          relative w-full min-h-screen md:h-[90vh]
          flex flex-col md:flex-row
          bg-white dark:bg-black overflow-hidden
        "
      >
        {/* LEFT SIDE (DESKTOP) */}
        <div
          className="hidden md:flex w-1/2 items-center justify-center p-8"
          style={{
            backgroundImage: `url(${authbackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <h2 className="text-3xl font-bold text-white drop-shadow-xl text-center">
            Welcome to your Notes Manager
          </h2>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative w-full md:w-1/2 min-h-screen flex items-center justify-center p-4 sm:p-8 md:p-12">
          {/* MOBILE BACKGROUND */}
          <div
            className="absolute inset-0 md:hidden"
            style={{
              backgroundImage: `url(${authbackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* FORM CARD */}
          <div
            className="
              relative z-10 w-full max-w-sm rounded-2xl p-6
              backdrop-blur-xl

              bg-transparent
              md:bg-white/80 md:dark:bg-black/70

              border border-transparent
              dark:border-white/15

              dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_40px_rgba(0,0,0,0.6)]
            "
          >
            {/* HEADER */}
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-4"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <UserIcon className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>

              <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
                {authMode === 'login'
                  ? 'Sign in to access your notes'
                  : 'Join us to start organizing your thoughts'}
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              {authMode === 'register' && (
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={authForm.username}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, username: e.target.value })
                  }
                  className={inputClass}
                />
              )}

              <input
                type="email"
                placeholder="Email Address"
                required
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                className={inputClass}
              />

              <input
                type="password"
                placeholder="Password"
                required
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                className={inputClass}
              />

              {error && (
                <p className="text-red-500 text-xs text-center font-medium">
                  {error}
                </p>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-4 rounded-xl font-black uppercase tracking-[0.1em] text-xs text-white mt-4
                  transition-all active:scale-95 disabled:opacity-50
                  shadow-2xl shadow-[var(--accent)]/20
                "
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {loading
                  ? 'Processing...'
                  : authMode === 'login'
                  ? 'Sign In'
                  : 'Sign Up'}
              </button>
            </form>

            {/* SWITCH */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  dispatch(clearError());
                }}
                className="text-sm text-stone-600 dark:text-stone-400 hover:text-[var(--accent)] transition-colors"
              >
                {authMode === 'login'
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* INPUT STYLE */
const inputClass = `
  w-full px-4 py-3 rounded-xl outline-none transition-all

  bg-stone-100
  md:bg-white
  dark:bg-stone-900/60

  border border-stone-200
  dark:border-white/10

  text-stone-900
  dark:text-stone-100

  placeholder:text-stone-500
  dark:placeholder:text-stone-400

  focus:ring-2
  focus:ring-[var(--accent)]
`;