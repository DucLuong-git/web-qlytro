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
    <div className="min-h-screen bg-[#f0f4f9] dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[500px] bg-white dark:bg-slate-800 rounded-[28px] p-8 sm:p-12 my-8"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#1a73e8] flex items-center justify-center shadow-sm">
            <div className="w-8 h-8 rounded-full border-4 border-[#8ab4f8] bg-[#1a73e8]" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-normal text-center text-[#202124] dark:text-white mb-2 tracking-tight">
          Tạo tài khoản
        </h1>
        <p className="text-center text-[15px] text-[#5f6368] dark:text-slate-400 mb-8">
          để tiếp tục sử dụng dịch vụ
        </p>

        <form onSubmit={handleRegister} className="space-y-6" noValidate>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="text-[#d93025] text-sm text-center bg-[#fce8e6] py-2 px-3 rounded-lg font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
            <div>
              <div className="relative group">
                <input
                  type="text" name="name" id="name" required maxLength={80}
                  value={formData.name} onChange={handleChange} disabled={loading}
                  className={`block w-full px-0 py-3 text-[#202124] dark:text-white bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors ${fieldErrors.name ? 'border-[#d93025]' : 'border-[#e0e0e0] dark:border-slate-600 focus:border-[#1a73e8]'}`}
                  placeholder=" "
                />
                <label
                  htmlFor="name"
                  className={`absolute text-[15px] duration-200 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${fieldErrors.name ? 'text-[#d93025]' : 'text-[#5f6368] dark:text-slate-400 peer-focus:text-[#1a73e8]'}`}
                >
                  Họ và Tên
                </label>
              </div>
              <FieldError field="name" />
            </div>

            {/* Phone Input */}
            <div>
              <div className="relative group">
                <input
                  type="tel" name="phone" id="phone" required maxLength={15}
                  value={formData.phone} onChange={handleChange} disabled={loading}
                  className={`block w-full px-0 py-3 text-[#202124] dark:text-white bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors ${fieldErrors.phone ? 'border-[#d93025]' : 'border-[#e0e0e0] dark:border-slate-600 focus:border-[#1a73e8]'}`}
                  placeholder=" "
                />
                <label
                  htmlFor="phone"
                  className={`absolute text-[15px] duration-200 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${fieldErrors.phone ? 'text-[#d93025]' : 'text-[#5f6368] dark:text-slate-400 peer-focus:text-[#1a73e8]'}`}
                >
                  Số điện thoại
                </label>
              </div>
              <FieldError field="phone" />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <div className="relative group">
              <input
                type="email" name="email" id="email" required maxLength={100} autoComplete="email"
                value={formData.email} onChange={handleChange} disabled={loading}
                className={`block w-full px-0 py-3 text-[#202124] dark:text-white bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors ${fieldErrors.email ? 'border-[#d93025]' : 'border-[#e0e0e0] dark:border-slate-600 focus:border-[#1a73e8]'}`}
                placeholder=" "
              />
              <label
                htmlFor="email"
                className={`absolute text-[15px] duration-200 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${fieldErrors.email ? 'text-[#d93025]' : 'text-[#5f6368] dark:text-slate-400 peer-focus:text-[#1a73e8]'}`}
              >
                Địa chỉ Email
              </label>
            </div>
            <FieldError field="email" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password Input */}
            <div>
              <div className="relative group">
                <input
                  type={showPw ? 'text' : 'password'} name="password" id="password" required maxLength={128} autoComplete="new-password"
                  value={formData.password} onChange={handleChange} disabled={loading}
                  className={`block w-full px-0 py-3 pr-8 text-[#202124] dark:text-white bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors ${fieldErrors.password ? 'border-[#d93025]' : 'border-[#e0e0e0] dark:border-slate-600 focus:border-[#1a73e8]'}`}
                  placeholder=" "
                />
                <label
                  htmlFor="password"
                  className={`absolute text-[15px] duration-200 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${fieldErrors.password ? 'text-[#d93025]' : 'text-[#5f6368] dark:text-slate-400 peer-focus:text-[#1a73e8]'}`}
                >
                  Mật khẩu
                </label>
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-3 text-[#5f6368] hover:text-[#202124] dark:hover:text-white transition-colors"
                  tabIndex="-1"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldError field="password" />
              {strength && (
                <div className="mt-2">
                  <div className="w-full bg-[#e0e0e0] dark:bg-slate-700 rounded-full h-1">
                    <div className={`${strength.color.replace('bg-', 'bg-').replace('500', '600')} h-1 rounded-full transition-all duration-500`} style={{ width: strength.w }} />
                  </div>
                  <span className={`text-[11px] font-medium mt-1 inline-block ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <div className="relative group">
                <input
                  type={showConfirm ? 'text' : 'password'} name="confirmPassword" id="confirmPassword" required maxLength={128} autoComplete="new-password"
                  value={formData.confirmPassword} onChange={handleChange} disabled={loading}
                  className={`block w-full px-0 py-3 pr-8 text-[#202124] dark:text-white bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors ${fieldErrors.confirmPassword ? 'border-[#d93025]' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-[#34A853]' : 'border-[#e0e0e0] dark:border-slate-600 focus:border-[#1a73e8]'}`}
                  placeholder=" "
                />
                <label
                  htmlFor="confirmPassword"
                  className={`absolute text-[15px] duration-200 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${fieldErrors.confirmPassword ? 'text-[#d93025]' : 'text-[#5f6368] dark:text-slate-400 peer-focus:text-[#1a73e8]'}`}
                >
                  Xác nhận
                </label>
                <button
                  type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 top-3 text-[#5f6368] hover:text-[#202124] dark:hover:text-white transition-colors"
                  tabIndex="-1"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldError field="confirmPassword" />
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input id="terms" name="terms" type="checkbox" required
              className="mt-0.5 w-4 h-4 rounded border-[#e0e0e0] text-[#1a73e8] focus:ring-[#1a73e8] focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-[13px] text-[#5f6368] dark:text-slate-400 cursor-pointer">
              Tôi đồng ý với{' '}
              <Link to="/info/terms" className="font-medium text-[#1a73e8] hover:text-[#174ea6]">Điều Khoản</Link>
              {' '}và{' '}
              <Link to="/info/privacy" className="font-medium text-[#1a73e8] hover:text-[#174ea6]">Bảo Mật</Link>
            </label>
          </div>

          <div className="flex justify-center -mb-2">
            <Turnstile 
              siteKey="1x00000000000000000000AA"
              onSuccess={(token) => setTurnstileToken(token)} 
              options={{ theme: 'auto', language: 'vi', size: 'compact' }}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a73e8] hover:bg-[#174ea6] text-white font-medium text-[15px] py-2.5 rounded-[4px] transition-colors disabled:opacity-70 flex justify-center items-center h-[44px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "ĐĂNG KÝ"
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[14px] text-[#5f6368] dark:text-slate-400">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-[#1a73e8] hover:text-[#174ea6] transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
