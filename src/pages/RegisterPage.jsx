import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Turnstile } from '@marsidev/react-turnstile';

const sanitize = (str) => str.replace(/[<>"']/g, '').trim();

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^[0-9\s\-\+\(\)]{9,15}$/.test(phone);
const validatePassword = (pw) => pw.length >= 6;

const inputCls = "appearance-none block w-full pl-11 pr-4 py-3.5 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 transition-all";
const inputWithIconRCls = "appearance-none block w-full pl-11 pr-12 py-3.5 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 transition-all";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) errs.name = 'Họ tên phải có ít nhất 2 ký tự.';
    if (!validateEmail(formData.email)) errs.email = 'Địa chỉ email không hợp lệ.';
    if (!validatePhone(formData.phone)) errs.phone = 'Số điện thoại không hợp lệ (9-15 chữ số).';
    if (!validatePassword(formData.password)) errs.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const pwStrength = () => {
    const pw = formData.password;
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Yếu', color: 'bg-red-500', w: '25%' };
    if (pw.length < 8) return { label: 'Trung Bình', color: 'bg-yellow-500', w: '55%' };
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Khá', color: 'bg-blue-500', w: '75%' };
    return { label: 'Mạnh', color: 'bg-emerald-500', w: '100%' };
  };
  const strength = pwStrength();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (!turnstileToken) {
      setError('Vui lòng hoàn thành xác minh Cloudflare (Bạn không phải là máy).');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const safeEmail = sanitize(formData.email.toLowerCase());
      const safeName = sanitize(formData.name);

      // Check duplicate email
      const { data: existing } = await api.get(`/users?email=${encodeURIComponent(safeEmail)}`);
      if (existing.length > 0) {
        setFieldErrors(prev => ({ ...prev, email: 'Email này đã được đăng ký trong hệ thống.' }));
        setLoading(false);
        return;
      }

      const newUser = {
        name: safeName,
        email: safeEmail,
        phone: sanitize(formData.phone),
        password: formData.password, // In prod: hash with bcrypt on backend
        role: 'TENANT',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(safeName)}`,
        createdAt: new Date().toISOString(),
      };

      const { data: createdUser } = await api.post('/users', newUser);
      login(createdUser); // authStore strips password
      navigate('/dashboard');
    } catch (err) {
      setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
      console.error('[Register Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ field }) => fieldErrors[field] ? (
    <p className="text-red-500 text-xs font-bold mt-1 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" />{fieldErrors[field]}</p>
  ) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex items-center justify-center mb-6 group">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-xl shadow-indigo-600/30 group-hover:scale-110 transition-transform">DL</div>
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tạo Tài Khoản Mới</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Đăng nhập tại đây</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 animate-in slide-in-from-bottom-8 duration-500 px-4">
        <div className="bg-white dark:bg-slate-800 py-10 px-6 shadow-2xl rounded-[2rem] border border-slate-100 dark:border-slate-700/50">
          
          <div className="flex items-center justify-center gap-2 mb-6 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-2 border border-emerald-100 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" /> Thông tin được mã hoá & bảo mật hoàn toàn
          </div>

          <form className="space-y-5" onSubmit={handleRegister} noValidate>
            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Họ và Tên <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <input type="text" name="name" required maxLength={80}
                    value={formData.name} onChange={handleChange}
                    className={`${inputCls} ${fieldErrors.name ? 'border-red-400' : ''}`}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <FieldError field="name" />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Số Điện Thoại <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <input type="tel" name="phone" required maxLength={15}
                    value={formData.phone} onChange={handleChange}
                    className={`${inputCls} ${fieldErrors.phone ? 'border-red-400' : ''}`}
                    placeholder="0901 234 567"
                  />
                </div>
                <FieldError field="phone" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Địa Chỉ Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input type="email" name="email" required maxLength={100}
                  value={formData.email} onChange={handleChange}
                  className={`${inputCls} ${fieldErrors.email ? 'border-red-400' : ''}`}
                  placeholder="ban@email.com"
                  autoComplete="email"
                />
              </div>
              <FieldError field="email" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Mật Khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <input type={showPw ? 'text' : 'password'} name="password" required maxLength={128}
                    value={formData.password} onChange={handleChange}
                    className={`${inputWithIconRCls} ${fieldErrors.password ? 'border-red-400' : ''}`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-1.5">
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                      <div className={`${strength.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: strength.w }} />
                    </div>
                    <span className={`text-[10px] font-black ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                  </div>
                )}
                <FieldError field="password" />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Xác Nhận Mật Khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" required maxLength={128}
                    value={formData.confirmPassword} onChange={handleChange}
                    className={`${inputWithIconRCls} ${fieldErrors.confirmPassword ? 'border-red-400' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-emerald-400' : ''}`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-emerald-500 text-xs font-bold flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mật khẩu khớp!</p>
                )}
                <FieldError field="confirmPassword" />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 py-1">
              <input id="terms" name="terms" type="checkbox" required
                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer leading-relaxed">
                Tôi đồng ý với{' '}
                <Link to="/info/terms" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Điều Khoản Dịch Vụ</Link>
                {' '}và{' '}
                <Link to="/info/privacy" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Chính Sách Bảo Mật</Link>
              </label>
            </div>

            {/* Cloudflare Turnstile */}
            <div className="flex justify-center border-t border-slate-100 dark:border-slate-700 pt-3 pb-1">
              <Turnstile 
                siteKey="1x00000000000000000000AA" // Dummy key
                onSuccess={(token) => setTurnstileToken(token)} 
                options={{
                  theme: 'auto',
                  language: 'vi'
                }}
              />
            </div>

            <button type="submit" disabled={loading}
              className="group w-full flex justify-center items-center py-4 rounded-xl shadow-lg shadow-indigo-600/30 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center">
                  Tạo Tài Khoản Ngay <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
