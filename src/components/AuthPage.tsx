import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, MapPin, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { signUp as localSignUp, signIn as localSignIn } from '../db';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';
import ParticleBackground from './ParticleBackground';

interface AuthPageProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (isSignUp && !name) {
      setError('Please enter your full name to register.');
      setLoading(false);
      return;
    }

    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await (supabase as any).auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        try {
          localSignUp(name, email, password);
        } catch (localErr) {
        }

        if (data?.user) {
          setSuccess('Account created successfully! Logging you in...');
          
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            name: name.trim(),
            headline: "Explorer | Ready to embark on new adventures 🌍🎒",
            avatarUrl: "",
            coverUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=200&fit=crop&q=80",
            connectionsCount: 12,
            location: ""
          };

          try {
            await (supabase as any).from('profiles').upsert({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              headline: profile.headline,
              avatarUrl: profile.avatarUrl,
              coverUrl: profile.coverUrl,
              connectionsCount: profile.connectionsCount,
              location: profile.location
            });
          } catch (dbErr) {
            console.error('Error auto-creating profile in database:', dbErr);
          }

          setTimeout(() => {
            onAuthSuccess(profile);
          }, 1000);
        } else {
          setSuccess('Account created successfully!');
          setIsSignUp(false);
          setLoading(false);
        }
      } else {
        const { data, error: signInError } = await (supabase as any).auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        if (data?.user) {
          setSuccess('Welcome back! Logging you in...');
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || "Explorer",
            headline: "Explorer | Ready to embark on new adventures 🌍🎒",
            avatarUrl: "",
            coverUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=200&fit=crop&q=80",
            connectionsCount: 12,
            location: ""
          };

          setTimeout(() => {
            onAuthSuccess(profile);
          }, 1000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden select-none" id="auth-root">
      <ParticleBackground />
      <div className="absolute top-[5%] left-[-15%] w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-[#f36c21]/15 to-pink-600/8 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute bottom-[10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-indigo-600/15 to-[#70b5f9]/15 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      <div className="w-full max-w-md glass-modal rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 border border-white/10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg viewBox="0 0 200 200" className="h-12 w-12 filter drop-shadow-[0_2px_8px_rgba(243,108,33,0.3)]" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 52 110 L 152 72 L 118 124 Z" fill="#f36c21" />
              <path d="M 52 110 L 118 124 L 80 132 Z" fill="#d35400" />
              <path d="M 80 132 L 84 148 L 118 124 Z" fill="#f36c21" />
            </svg>
            <span className="font-black text-3xl tracking-tight text-[#f36c21] font-sans">
              Raahi
            </span>
          </div>
          <p className="text-xs text-[#a3a8ae] max-w-xs mt-1 font-sans font-medium">
            {isSignUp 
              ? "Create an account to start mapping your journeys, tracking checklists, and sharing travel milestones." 
              : "Sign in to access your personal active routes, completed travel archives, and journey statistics."
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/45 border border-red-900/30 rounded-xl text-xs text-red-400 flex items-start gap-2 animate-shake" id="auth-error-alert">
            <span className="font-bold text-sm leading-none mt-0.5">⚠️</span>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-950/45 border border-emerald-900/30 rounded-xl text-xs text-emerald-400 flex items-start gap-2" id="auth-success-alert">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <p className="font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-black text-[#c9ced3] uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mayukh Mondal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#8b949e] glass-input border-white/10 focus:border-[#f36c21] outline-none transition-all font-sans"
                  id="auth-input-name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-[#c9ced3] uppercase tracking-widest mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#8b949e] glass-input border-white/10 focus:border-[#f36c21] outline-none transition-all font-sans"
                id="auth-input-email"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#c9ced3] uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-[#8b949e] glass-input border-white/10 focus:border-[#f36c21] outline-none transition-all font-sans"
                id="auth-input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-white cursor-pointer"
                id="auth-toggle-pwd"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f36c21] hover:bg-[#ff7e36] text-white text-sm font-black py-3 rounded-xl cursor-pointer transition-all mt-2 shadow-lg hover:shadow-[#f36c21]/30 flex items-center justify-center gap-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed border border-[#f36c21]/20 hover:-translate-y-0.5 transform duration-300"
            id="auth-submit-btn"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <Compass className="h-4 w-4 animate-spin-slow" />
                <span>Sign In to Adventure</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/8 text-center">
          <p className="text-xs text-[#8b949e] font-medium">
            {isSignUp ? "Already have an account?" : "New to Raahi?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
              }}
              className="text-[#f36c21] hover:underline font-bold cursor-pointer ml-1 outline-none"
              id="auth-toggle-mode-btn"
            >
              {isSignUp ? "Sign In" : "Sign Up now"}
            </button>
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-center z-10">
        <p className="text-[10px] text-[#484f58] tracking-widest uppercase font-mono">
          Raahi Travel Planner • Live Your Journey
        </p>
      </div>
    </div>
  );
}
