// src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { useToastContext } from '@/components/ui/ToastProvider';
import { Zap, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';

export function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToastContext();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const err = await signIn(email, password);
    
    if (err) {
      setError(err);
      setLoading(false);
      showToast(err, 'error');
    } else {
      // Success - show toast and navigate
      showToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="w-full space-y-6 rounded-2xl border bg-card p-8 shadow-xl">
      {/* Logo & Title */}
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5">
          <Zap className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-primary">LeadFlow</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Authentication failed</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "w-full rounded-lg border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "transition-all duration-200"
              )}
              placeholder="you@company.com.au"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "w-full rounded-lg border bg-background pl-10 pr-12 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "transition-all duration-200"
              )}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground",
            "hover:bg-primary/90 transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-lg shadow-primary/20"
          )}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="text-primary-foreground" />
              <span>Signing in...</span>
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Forgot Password */}
      <div className="text-center">
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
          onClick={() => {
            // TODO: Implement forgot password
            alert('Forgot password feature coming soon!');
          }}
        >
          Forgot your password?
        </button>
      </div>
    </div>
  );
}