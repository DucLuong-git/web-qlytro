import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const inputCls = "appearance-none block w-full pl-11 pr-10 py-3.5 border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 transition-all";

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({ email: '', phone: '', newPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' }); // 'error' or 'success'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus({ type: '', msg: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.phone || !formData.newPassword) {
      setStatus({ type: 'error', msg: 'Vui lòng điền đầy đủ các thông tin.' });
      return;
    }
    if (formData.newPassword.length < 6) {
      setStatus({ type: 'error', msg: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      const res = await api.post('/users/reset-password', formData);
      if (res.data.success) {
        setStatus({ type: 'success', msg: 'Khôi phục mật khẩu thành công! Chuyển hướng đến đăng nhập...' });
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Thông tin xác thực không chính xác.' });
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
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Khôi phục mật khẩu</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Xác thực thông tin để tạo lại mật khẩu mới.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-in slide-in-from-bottom-8 duration-500 px-4">
        <div className="bg-white dark:bg-slate-800 py-10 px-6 shadow-2xl rounded-[2rem] border border-slate-100 dark:border-slate-700/50">
          
          <div className="flex items-center justify-center gap-2 mb-6 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-2 border border-emerald-100 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" /> Hệ thống bảo mật thông tin nội bộ
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {status.type === 'error' && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {status.msg}
              </div>
            )}
            
            {status.type === 'success' && (
              <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {status.msg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Email đã đăng ký</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  type="email" name="email" required
                  value={formData.email} onChange={handleChange}
                  className={inputCls} placeholder="Nhập địa chỉ email..."
                  disabled={loading || status.type === 'success'}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">SĐT Đã đăng ký (Mã xác thực)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  type="tel" name="phone" required
                  value={formData.phone} onChange={handleChange}
                  className={inputCls} placeholder="Nhập số điện thoại của bạn..."
                  disabled={loading || status.type === 'success'}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Mật Khẩu Mới</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'} name="newPassword" required maxLength={128}
                  value={formData.newPassword} onChange={handleChange}
                  className={inputCls} placeholder="••••••••"
                  disabled={loading || status.type === 'success'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading || status.type === 'success'}
              className="w-full flex justify-center items-center py-4 rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center">
                  Xác Nhận & Đặt Lại Mật Khẩu
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
             <Link to="/login" className="text-sm font-bold text-indigo-600 hover:underline">
               Quay lại trang đăng nhập
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
