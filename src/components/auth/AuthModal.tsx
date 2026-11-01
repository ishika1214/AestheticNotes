import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login, register, clearError } from '../../store/slices/authSlice';
import {
  HexFace,
  CircleFace,
  BlobFace,
  TriangleFace,
  Starburst,
  Leaf,
  Asterisk,
} from '../ui/Doodles';

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
    <div className="min-h-screen bg-[var(--bg)] p-3 text-[var(--text)] sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-6xl gap-5 sm:min-h-[calc(100vh-2.5rem)] md:grid-cols-2">
        {/* ART PANEL */}
        <div className="grain relative hidden overflow-hidden rounded-[40px] bg-[#f9e4cf] p-12 text-[#0b3b3c] md:flex md:flex-col md:gap-16 dark:bg-[#143b3c] dark:text-[#f6efe6]">
          <Link to="/" className="relative z-10 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <CircleFace className="h-8 w-8" color="#f27a1a" mood="happy" />
            Aesthetic
          </Link>

          <div className="relative z-10 max-w-sm">
            <h2 className="text-4xl font-semibold leading-tight tracking-tight">
              Your thoughts deserve a softer place to land.
            </h2>
            <p className="mt-4 opacity-80">Notes, novels and diaries with a gentle AI by your side.</p>
          </div>

          <TriangleFace className="absolute right-8 top-8 w-24 rotate-12" />
          <HexFace className="float-soft absolute bottom-28 right-[-20px] w-36" />
          <BlobFace className="absolute bottom-[-40px] left-[30%] w-44" />
          <CircleFace className="absolute bottom-[-30px] left-[-30px] w-36" />
          <Starburst className="absolute bottom-[34%] left-[38%] w-16" />
          <Leaf className="absolute bottom-[-10px] right-[24%] w-28" />
          <Asterisk className="absolute bottom-[30%] left-[12%] w-10" />
        </div>

        {/* FORM */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-[40px] px-5 py-12 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <Link to="/" className="mb-10 flex items-center gap-2 text-xl font-semibold md:hidden">
              <CircleFace className="h-7 w-7" color="#f27a1a" mood="happy" />
              Aesthetic
            </Link>

            {/* Mode switch */}
            <div className="mb-8 inline-flex rounded-full bg-[var(--surface)] p-1 shadow-[var(--shadow)]">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setAuthMode(m);
                    dispatch(clearError());
                  }}
                  className="relative rounded-full px-5 py-2 text-sm font-medium transition-colors"
                  style={{ color: authMode === m ? 'var(--accent-contrast)' : 'var(--muted)' }}
                >
                  {authMode === m && (
                    <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-full bg-[var(--accent)]" />
                  )}
                  <span className="relative">{m === 'login' ? 'Sign in' : 'Sign up'}</span>
                </button>
              ))}
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {authMode === 'login' ? 'Welcome back' : 'Create your space'}
            </h1>
            <p className="mt-2 text-[var(--muted)]">
              {authMode === 'login'
                ? 'Sign in to pick up where you left off.'
                : 'Join to start organising your thoughts.'}
            </p>

            <form onSubmit={handleAuth} className="mt-8 flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {authMode === 'register' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <input
                      type="text"
                      placeholder="Username"
                      required
                      value={authForm.username}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, username: e.target.value })
                      }
                      className="field"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                type="email"
                placeholder="Email address"
                required
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                className="field"
              />

              <input
                type="password"
                placeholder="Password"
                required
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                className="field"
              />

              {error && (
                <p className="rounded-2xl bg-[#fbdcdc] px-4 py-3 text-sm text-[#8a2a33] dark:bg-[#3b2427] dark:text-[#f6c1c6]">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-pill mt-4 w-full py-3.5">
                {loading
                  ? 'Just a moment…'
                  : authMode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[var(--muted)]">
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  dispatch(clearError());
                }}
                className="font-medium text-[var(--text)] underline underline-offset-4"
              >
                {authMode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
