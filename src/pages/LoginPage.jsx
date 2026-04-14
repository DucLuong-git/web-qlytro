import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Turnstile } from '@marsidev/react-turnstile';

// Sanitize input to prevent XSS
const sanitize = (str) => str.replace(/[<>"']/g, '');

// Rate limiting: max 5 attempts per 15 minutes
const loginAttempts = { count: 0, resetAt: 0 };
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const inputCls = "appearance-none block w-full pl-11 pr-10 py-3.5 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 transition-all";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  // Redirect back to intended page after login
  const from = location.state?.from?.pathname || '/dashboard';

  const isLocked = useCallback(() => {
    if (Date.now() < lockoutUntil) return true;
    if (Date.now() > loginAttempts.resetAt) {
      loginAttempts.count = 0;
    }
    return false;
  }, [lockoutUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check rate limit
    if (isLocked()) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000);
      setError(`Tài khoản tạm khóa do quá nhiều lần thất bại. Thử lại sau ${remaining} phút.`);
      return;
    }

    const safeEmail = sanitize(email.trim().toLowerCase());
    if (!safeEmail || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    
    if (!turnstileToken) {
      setError('Vui lòng xác minh bạn không phải là robot.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: safeEmail, password });
      
      if (data.success && data.user) {
        loginAttempts.count = 0;
        login(data.user); // authStore xử lý state đăng nhập
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        // Tái tạo lại lỗi sai pass / sai mật khẩu từ backend
        loginAttempts.count++;
        loginAttempts.resetAt = Date.now() + LOCKOUT_MS;

        const serverError = err.response.data.message;
        if (loginAttempts.count >= MAX_ATTEMPTS) {
          const lockUntil = Date.now() + LOCKOUT_MS;
          setLockoutUntil(lockUntil);
          setError(`Bạn đã thử ${MAX_ATTEMPTS} lần thất bại. Tài khoản bị tạm khóa 15 phút.`);
        } else {
          const remaining = MAX_ATTEMPTS - loginAttempts.count;
          setError(`${serverError} (Còn ${remaining} lần thử)`);
        }
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.');
        console.error('[Login Error]', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-[20%] right-0 w-[50%] h-[60%] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6 group">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-xl shadow-indigo-600/30 group-hover:scale-110 transition-transform">DL</div>
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Đăng Nhập</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Đăng ký miễn phí</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-in slide-in-from-bottom-8 duration-500 px-4">
        <div className="bg-white dark:bg-slate-800 py-10 px-6 shadow-2xl rounded-[2rem] border border-slate-100 dark:border-slate-700/50">
          
          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mb-6 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-2 border border-emerald-100 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" /> Kết nối bảo mật · Phiên làm việc mã hoá
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} autoComplete="on" noValidate>
            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Địa Chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  type="email" name="email" autoComplete="email"
                  required maxLength={100}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={inputCls}
                  placeholder="admin@test.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Mật Khẩu</label>
                <Link to="/forgot-password" className="text-xs font-medium text-indigo-500 hover:underline">Quên mật khẩu?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'} name="password" autoComplete="current-password"
                  required maxLength={128}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className={inputCls}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Cloudflare Turnstile */}
            <div className="flex justify-center border-t border-slate-100 dark:border-slate-700 pt-3">
              <Turnstile 
                siteKey="1x00000000000000000000AA" // Dummy key cho Testing (luôn vượt qua)
                onSuccess={(token) => setTurnstileToken(token)} 
                options={{
                  theme: 'auto',
                  language: 'vi'
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading || isLocked()}
              className="w-full flex justify-center items-center py-4 rounded-xl shadow-lg shadow-indigo-600/30 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center">
                  Đăng Nhập Tài Khoản
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>

            {/* Demo hint */}
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                🔑 Demo: <strong>admin@test.com</strong> / <strong>password123</strong>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
