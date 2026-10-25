import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types/auth';
import { authService } from '../services/authService';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile, rememberMe: boolean) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotPasswordNotice(false);
    setIsLoading(true);

    try {
      const res = await authService.login(email, password, rememberMe);
      if (res.success && res.user) {
        onLoginSuccess(res.user, rememberMe);
      } else {
        setIsLoading(false);
        setErrorMessage(res.error || 'Invalid email or password. Please verify your credentials and try again.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('An unexpected error occurred during authentication.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Institutional Login Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          
          {/* Card Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 text-center">
            <div className="h-12 w-12 rounded-lg bg-slate-900 mx-auto flex items-center justify-center text-white shadow-sm mb-3">
              <ShieldCheck className="w-7 h-7 text-sky-400" />
            </div>
            
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Body Check
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Secure Body Check Review
            </p>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-5">

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Forgot Password Notice */}
            {forgotPasswordNotice && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  Password self-service is managed by your organization's IT administrator. Please contact your support desk for credential assistance.
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="name@organization.org"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordNotice(true)}
                    className="text-[11px] text-sky-700 hover:text-sky-900 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-500"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-sky-700 hover:bg-sky-800 disabled:bg-sky-400 text-white text-sm font-semibold rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
};
