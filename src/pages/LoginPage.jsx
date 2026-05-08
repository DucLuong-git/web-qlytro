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
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center relative overflow-hidden bg-[var(--soft-cloud)] dark:bg-slate-950 py-12 px-4">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #ff385c22 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #92174d22 0%, transparent 70%)' }} />
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex flex-col items-center gap-3 group">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-xl group-hover:scale-105 transition-transform"
              style={{ background: 'var(--brand-gradient)', boxShadow: '0 8px 32px rgba(255,56,92,0.35)' }}
            >
              DL
            </div>
            <span className="text-2xl font-black text-[var(--ink-black)] dark:text-white tracking-tight">
              Đức Lương <span style={{ color: 'var(--rausch)' }}>Home</span>
            </span>
          </Link>
          <h1 className="text-xl font-800 text-[var(--ink-black)] dark:text-white mt-4 mb-1">Đăng Nhập</h1>
          <p className="text-sm text-[var(--ash-gray)] font-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-700 hover:underline" style={{ color: 'var(--rausch)' }}>
              Đăng ký miễn phí
            </Link>
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-[var(--hairline-gray)] dark:border-slate-700 p-8"
          style={{ boxShadow: 'var(--shadow-2)' }}
        >
          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs font-700 mb-6 px-4 py-2 rounded-xl border"
            style={{ color: '#15803d', background: '#f0fdf4', borderColor: '#bbf7d0' }}
          >
            <ShieldCheck className="w-4 h-4" />
            Kết nối bảo mật · Phiên làm việc mã hoá
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="on" noValidate>
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm font-500"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: 'var(--error-red)' }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-700 text-[var(--ink-black)] dark:text-white">Địa Chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--stone-gray)] pointer-events-none" />
                <input
                  type="email" name="email" autoComplete="email" required maxLength={100}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="admin@test.com"
                  disabled={loading}
                  className="form-input pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-700 text-[var(--ink-black)] dark:text-white">Mật Khẩu</label>
                <Link to="/forgot-password" className="text-xs font-600 hover:underline" style={{ color: 'var(--rausch)' }}>
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--stone-gray)] pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'} name="password"
                  autoComplete="current-password" required maxLength={128}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  disabled={loading}
                  className="form-input pl-11 pr-12"
                />
                <button
                  type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--stone-gray)] hover:text-[var(--ash-gray)] transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Turnstile */}
            <div className="flex justify-center pt-1">
              <Turnstile
                siteKey="1x00000000000000000000AA"
                onSuccess={token => setTurnstile(token)}
                options={{ theme: 'auto', language: 'vi' }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isLocked()}
              className="btn-primary w-full justify-center rounded-xl py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Đăng Nhập Tài Khoản
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>

            {/* Demo hint */}
            <div className="text-center p-3 rounded-xl" style={{ background: 'var(--soft-cloud)' }}>
              <p className="text-xs text-[var(--ash-gray)] font-500">
                🔑 Demo: <strong className="text-[var(--ink-black)] dark:text-white">admin@test.com</strong> / <strong className="text-[var(--ink-black)] dark:text-white">password123</strong>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
