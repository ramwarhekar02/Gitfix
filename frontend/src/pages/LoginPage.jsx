import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { Lock, Mail, Terminal, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if Google GIS is loaded and initialize
    const initializeGoogleSignIn = () => {
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id-here',
          callback: handleGoogleCallback,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-login-btn'),
          {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: '100%',
          }
        );
      }
    };

    // Retry initialization briefly in case GIS script loads asynchronously
    const timer = setTimeout(initializeGoogleSignIn, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleCallback = async (response) => {
    setError('');
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogle(response.credential);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-darkBg px-4 font-sans text-slate-100">
      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-md space-y-6">
        {/* Logo/Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentBlue">
            <Terminal className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to GitFix</h2>
          <p className="text-sm text-slate-400 font-mono">Secure AI Merge Resolution</p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-darkBorder bg-darkPanel/40 p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-accentRed/40 bg-accentRed/5 p-3.5 text-xs text-accentRed font-mono leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Native Google Sign-In Button */}
          <div className="mb-5">
            <div id="google-login-btn" className="w-full h-[40px] overflow-hidden rounded-lg"></div>
          </div>

          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-darkBorder/60"></div>
            <span className="flex-shrink mx-4 text-xs font-mono text-slate-500 uppercase">Or use Credentials</span>
            <div className="flex-grow border-t border-darkBorder/60"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-lg border border-darkBorder bg-slate-950/80 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:border-accentBlue/60 focus:outline-none focus:ring-1 focus:ring-accentBlue/30 transition-all font-sans"
                />
              </div>
            </div>

             <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-darkBorder bg-slate-950/80 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:border-accentBlue/60 focus:outline-none focus:ring-1 focus:ring-accentBlue/30 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-350 transition focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accentBlue px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-accentBlue/50 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 font-mono">
            Don't have an account?{' '}
            <Link to="/register" className="text-accentBlue hover:underline">
              Register Workspace
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
