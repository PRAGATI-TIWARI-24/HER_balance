import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Browser } from '@capacitor/browser';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ── 📱 Native App Deep Link Listener (APK Redirect Handling) ──
  useEffect(() => {
    let appUrlSub = null;

    if (Capacitor.isNativePlatform()) {
      appUrlSub = CapApp.addListener('appUrlOpen', async ({ url }) => {
        if (url && (url.includes('auth-callback') || url.includes('#access_token') || url.includes('access_token='))) {
          try {
            await Browser.close();
          } catch (e) {
            console.log('Browser already closed:', e);
          }

          // URL fragment se access_token aur refresh_token parse karna
          const hashIndex = url.indexOf('#');
          if (hashIndex !== -1) {
            const hash = url.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken && isSupabaseConfigured && supabase) {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });

              if (!error && data?.user) {
                const userName = data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || 'User';
                onLoginSuccess(data.user.id, userName);
              }
            }
          }
        }
      });
    }

    return () => {
      if (appUrlSub && typeof appUrlSub.remove === 'function') {
        appUrlSub.remove();
      }
    };
  }, [onLoginSuccess]);

  if (!isOpen) return null;

  // ── 🌐 Google 1-Tap OAuth Login Handler (Hybrid: Web + Native Android) ──
  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert("Supabase client configure nahi hai! Supabase URL aur Anon Key verify karein.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const isNative = Capacitor.isNativePlatform();
      const redirectUrl = isNative 
        ? 'com.herbalance.app://auth-callback' 
        : window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: isNative // Android par webview redirection ko rokne ke liye
        }
      });

      if (error) throw error;

      // Android native environment mein secure Chrome Custom Tab open karein
      if (isNative && data?.url) {
        await Browser.open({ url: data.url, windowName: '_self' });
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      setErrorMessage(err.message || "Google sign-in fail ho gaya.");
    } finally {
      setLoading(false);
    }
  };

  // ── Email / Password Auth Handler ──
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      // Local fallback mode
      onLoginSuccess(email || 'guest_user', fullName || 'Beautiful');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        const userName = data.user?.user_metadata?.full_name || fullName || 'User';
        onLoginSuccess(data.user?.id, userName);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        const userName = data.user?.user_metadata?.full_name || 'User';
        onLoginSuccess(data.user?.id, userName);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMessage(err.message || "Authentication error! Credentials check karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#FCFBF5] text-[#5B0015] w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EDE5CD] relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5B0015]/70 hover:text-[#5B0015] w-8 h-8 rounded-full flex items-center justify-center bg-[#F7F2E0] border border-[#EDE5CD] text-xs font-bold cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center mb-5">
          <span className="text-3xl">🌸</span>
          <h3 className="text-xl font-black text-[#5B0015] mt-1">
            {isSignUp ? 'Create HerBalance Account' : 'Welcome to HerBalance'}
          </h3>
          <p className="text-xs text-[#5B0015]/70 font-medium mt-0.5">
            {isSignUp ? 'Start your hormonal care journey' : 'Access your daily cycle & routine'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* ── 🚀 GOOGLE 1-TAP LOGIN BUTTON ── */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-[#F7F2E0] text-[#5B0015] border-2 border-[#EDE5CD] font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm mb-4 cursor-pointer active:scale-98 disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-1 items-center mb-4">
          <div className="flex-grow border-t border-[#EDE5CD]"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#5B0015]/50">Or with email</span>
          <div className="flex-grow border-t border-[#EDE5CD]"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="text-[10px] font-bold text-[#5B0015]/75 uppercase">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Pragati"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] bg-white rounded-xl outline-none focus:ring-1 focus:ring-[#80AEE8] font-bold text-[#5B0015]"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-[#5B0015]/75 uppercase">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] bg-white rounded-xl outline-none focus:ring-1 focus:ring-[#80AEE8] font-bold text-[#5B0015]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#5B0015]/75 uppercase">Password</label>
            <input
              type="password"
              required
              minLength="6"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] bg-white rounded-xl outline-none focus:ring-1 focus:ring-[#80AEE8] font-bold text-[#5B0015]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-3 rounded-xl text-xs transition-colors shadow-md mt-1 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setErrorMessage(''); }}
            className="text-xs text-[#5B0015]/80 font-bold hover:text-[#5B0015] underline cursor-pointer"
          >
            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}