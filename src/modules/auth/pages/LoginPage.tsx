import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:9001/auth/login', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Please check your login credentials');
      }

      setSuccess(true);
      
      // Store tokens
      const tokens = data.data;
      if (tokens && tokens.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
      }
      if (tokens && tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }

      // Success delay for nice animation experience
      setTimeout(() => {
        onLoginSuccess();
        navigate('/');
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas relative overflow-hidden px-4">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />

      {/* Login Card Container */}
      <div className="w-full max-w-md bg-white border border-slate-100/80 rounded-2xl shadow-soft p-8 md:p-10 transition-all duration-300 relative z-10 hover:shadow-xl">
        
        {/* Brand/Logo Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            {/* Custom Logo SVG mimicking FitCore style */}
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M20.57 14.86L22 13.43l-5.43-5.43c-.39-.39-1.02-.39-1.41 0L12 11.14 8.84 7.97c-.39-.39-1.02-.39-1.41 0L2 13.4l1.43 1.43L8.13 10.1l3.16 3.16c.39.39 1.02.39 1.41 0l3.16-3.16 4.71 4.76z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">
              Fit<span className="text-primary">Core</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm text-center">
            Welcome back! Please enter your details to sign in.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication failed</p>
              <p className="text-red-600/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
            <div>
              <p className="font-semibold">Login successful</p>
              <p className="text-emerald-600/90 mt-0.5">Redirecting you to the dashboard...</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Email / Username
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fitcore.io"
                disabled={isLoading || success}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-slate-50 transition-all text-sm"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <a href="#" className="text-xs font-medium text-primary hover:text-primary-hover transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading || success}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:bg-slate-50 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || success}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-6 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
