import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Turnstile } from '@marsidev/react-turnstile';
import { motion } from 'framer-motion';

const sanitize = (str) => str.replace(/[<>"']/g, '');
const loginAttempts = { count: 0, resetAt: 0 };
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const LoginPage = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [turnstileToken, setTurnstile]  = useState('');
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const navigate  = useNavigate();
  const location  = useLocation();
  const login     = useAuthStore(s => s.login);
  const from      = location.state?.from?.pathname || '/dashboard';

  const isLocked = useCallback(() => {
    if (Date.now() < lockoutUntil) return true;
    if (Date.now() > loginAttempts.resetAt) loginAttempts.count = 0;
    return false;
  }, [lockoutUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isLocked()) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000);
      return setError(`Tài khoản tạm khóa. Thử lại sau ${remaining} phút.`);
    }
    const safeEmail = sanitize(email.trim().toLowerCase());
    if (!safeEmail || !password) return setError('Vui lòng nhập đầy đủ email và mật khẩu.');
    if (!turnstileToken) return setError('Vui lòng xác minh bạn không phải robot.');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: safeEmail, password });
      if (data.success && data.user) {
        loginAttempts.count = 0;
        login(data.user);
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        loginAttempts.count++;
        loginAttempts.resetAt = Date.now() + LOCKOUT_MS;
        const serverError = err.response.data.message;
        if (loginAttempts.count >= MAX_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_MS);
          setError(`Bạn đã thử ${MAX_ATTEMPTS} lần. Tài khoản bị khóa 15 phút.`);
        } else {
          setError(`${serverError} (Còn ${MAX_ATTEMPTS - loginAttempts.count} lần thử)`);
        }
      } else {
        setError('Không thể kết nối máy chủ. Vui lòng kiểm tra đường truyền.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[450px] bg-white dark:bg-slate-800 rounded-[28px] p-10 sm:p-12"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#1a73e8] flex items-center justify-center shadow-sm">
            <div className="w-8 h-8 rounded-full border-4 border-[#8ab4f8] bg-[#1a73e8]" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-normal text-center text-[#202124] dark:text-white mb-2 tracking-tight">
          Đăng Nhập
        </h1>
        <p className="text-center text-[15px] text-[#5f6368] dark:text-slate-400 mb-8">
          để tiếp tục vào tài khoản của bạn
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on" noValidate>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="text-[#d93025] text-sm text-center bg-[#fce8e6] py-2 px-3 rounded-lg font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Email Input */}
          <div className="relative group">
            <input
              type="email"
              name="email"
              id="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
              className="block w-full px-0 py-3 text-[#202124] dark:text-white bg-transparent border-0 border-b-2 border-[#e0e0e0] dark:border-slate-600 appearance-none focus:outline-none focus:ring-0 focus:border-[#1a73e8] peer transition-colors"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="absolute text-[15px] text-[#5f6368] dark:text-slate-400 duration-200 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#1a73e8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Email
            </label>
          </div>

          {/* Password Input */}
          <div className="relative group">
            <input
              type={showPw ? 'text' : 'password'}
              name="password"
              id="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              disabled={loading}
              className="block w-full px-0 py-3 text-[#202124] dark:text-white bg-transparent border-0 border-b-2 border-[#e0e0e0] dark:border-slate-600 appearance-none focus:outline-none focus:ring-0 focus:border-[#1a73e8] peer transition-colors"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="absolute text-[15px] text-[#5f6368] dark:text-slate-400 duration-200 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#1a73e8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Mật khẩu
            </label>
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-0 top-3 text-[#5f6368] hover:text-[#202124] dark:hover:text-white transition-colors"
              tabIndex="-1"
            >
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-[#e0e0e0] text-[#1a73e8] focus:ring-[#1a73e8] focus:ring-offset-0 cursor-pointer" />
              <span className="text-[13px] text-[#5f6368] dark:text-slate-400 group-hover:text-[#202124] dark:group-hover:text-slate-200 transition-colors">
                Duy trì đăng nhập
              </span>
            </label>
            <Link to="/forgot-password" className="text-[13px] font-medium text-[#1a73e8] hover:text-[#174ea6] transition-colors uppercase tracking-wide">
              Quên mật khẩu?
            </Link>
          </div>

          <div className="flex justify-center -mb-2">
            <Turnstile
              siteKey="1x00000000000000000000AA"
              onSuccess={token => setTurnstile(token)}
              options={{ theme: 'auto', language: 'vi', size: 'compact' }}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || isLocked()}
              className="w-full bg-[#1a73e8] hover:bg-[#174ea6] text-white font-medium text-[15px] py-2.5 rounded-[4px] transition-colors disabled:opacity-70 flex justify-center items-center h-[44px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "ĐĂNG NHẬP"
              )}
            </button>
          </div>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#e0e0e0] dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-[#5f6368] dark:text-slate-400 text-sm">hoặc</span>
            <div className="flex-grow border-t border-[#e0e0e0] dark:border-slate-700"></div>
          </div>

          <div className="space-y-3">
            <button type="button" className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-[#dadce0] dark:border-slate-600 rounded-[4px] py-2.5 text-[#3c4043] dark:text-slate-200 text-sm font-medium hover:bg-[#f8f9fa] dark:hover:bg-slate-700 transition-colors h-[44px]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Tiếp tục với Google
            </button>
            <button type="button" className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-[#dadce0] dark:border-slate-600 rounded-[4px] py-2.5 text-[#3c4043] dark:text-slate-200 text-sm font-medium hover:bg-[#f8f9fa] dark:hover:bg-slate-700 transition-colors h-[44px]">
              <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Tiếp tục với Facebook
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[14px] text-[#5f6368] dark:text-slate-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-[#1a73e8] hover:text-[#174ea6] transition-colors">
              Tạo tài khoản
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
