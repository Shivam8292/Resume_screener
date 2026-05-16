import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, LogIn, UserPlus, Github } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for confirmation!');
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-20 p-8 bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Organization Portal</h2>
        <p className="text-sm text-[var(--text-secondary)]">Manage candidates and historical data</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input 
            type="email" 
            placeholder="Work Email" 
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-sunken)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#6366f1] outline-none"
            value={email}
            onChange={(e) => setEmail(email)}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-sunken)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[#6366f1] outline-none"
            value={password}
            onChange={(e) => setPassword(password)}
          />
        </div>

        {error && <p className="text-red-500 text-xs italic">{error}</p>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-[#6366f1] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#4f46e5] transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : isLogin ? <><LogIn size={18}/> Login</> : <><UserPlus size={18}/> Register</>}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]"></div></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[var(--bg-card)] px-2 text-[var(--text-secondary)]">Or continue with</span></div>
      </div>

      <button 
        onClick={handleGoogleLogin}
        className="w-full py-3 bg-[var(--bg-sunken)] border border-[var(--border)] rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--bg-base)] transition-all"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
        Google
      </button>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-[#6366f1] font-semibold hover:underline">
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </motion.div>
  );
}
