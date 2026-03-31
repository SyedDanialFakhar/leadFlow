// src/components/auth/SignupForm.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { useToastContext } from '@/components/ui/ToastProvider';
import { Zap, Eye, EyeOff, Mail, Lock, User, Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export function SignupForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation
  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasNumber: /\d/.test(formData.password),
    hasLetter: /[a-zA-Z]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    const err = await signUp(formData.email, formData.password, formData.fullName);
    
    if (err) {
      setError(err);
      setLoading(false);
      showToast(err, 'error');
    } else {
      // Success - show toast and optionally navigate to login or stay
      showToast('Account created! Please check your email for a confirmation link.', 'success');
      setLoading(false);
      // Wait a bit or redirect to login
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error on input
  };

  return (
    <div className="w-full space-y-6 rounded-2xl border bg-card p-8 shadow-xl">
      {/* Logo & Title */}
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5">
          <Zap className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-primary">LeadFlow</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start generating leads in minutes
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Sign up failed</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        )}

        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-foreground">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              className={cn(
                "w-full rounded-lg border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "transition-all duration-200"
              )}
              placeholder="Charlie Smith"
              required
              autoComplete="name"
              disabled={loading}
            />
          </div>
        </div>

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
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
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
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              className={cn(
                "w-full rounded-lg border bg-background pl-10 pr-12 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "transition-all duration-200"
              )}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Password Requirements */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              <PasswordRequirement met={passwordRequirements.minLength}>
                At least 8 characters
              </PasswordRequirement>
              <PasswordRequirement met={passwordRequirements.hasNumber}>
                Contains a number
              </PasswordRequirement>
              <PasswordRequirement met={passwordRequirements.hasLetter}>
                Contains a letter
              </PasswordRequirement>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-foreground">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className={cn(
                "w-full rounded-lg border bg-background pl-10 pr-12 py-2.5 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "transition-all duration-200",
                formData.confirmPassword && !passwordsMatch && "border-destructive"
              )}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Password Match Indicator */}
          {formData.confirmPassword && (
            <div className="mt-2">
              <PasswordRequirement met={passwordsMatch}>
                Passwords match
              </PasswordRequirement>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isPasswordValid || !passwordsMatch}
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
              <span>Creating account...</span>
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground">
        By signing up, you agree to our{' '}
        <button className="text-primary hover:underline">Terms of Service</button>
        {' '}and{' '}
        <button className="text-primary hover:underline">Privacy Policy</button>
      </p>
    </div>
  );
}

// Helper component for password requirements
function PasswordRequirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={met ? 'text-green-600' : 'text-muted-foreground'}>
        {children}
      </span>
    </div>
  );
}