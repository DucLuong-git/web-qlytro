import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Phone, Lock, Save, Camera, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

// Shared input class - fix text color cho cả light và dark mode
const inputCls = "w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-400";
const inputWithIconCls = "w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-400";

const ProfilePage = () => {
  const { user, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const [pwData, setPwData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login({ ...user, name: profileData.name, phone: profileData.phone });
      setLoading(false);
      showToast('Hồ sơ cá nhân đã được cập nhật thành công!');
    }, 1000);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    if (pwData.newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Mật khẩu đã được cập nhật thành công!');
    }, 1200);
  };

  if (!user) return null;

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', Icon: User },
    { id: 'security', label: 'Bảo mật & Mật khẩu', Icon: Lock },
  ];

  const pwStrength = () => {
    const pw = pwData.newPassword;
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Yếu', color: 'bg-red-500', width: '25%' };
    if (pw.length < 8) return { label: 'Trung Bình', color: 'bg-yellow-500', width: '55%' };
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Khá', color: 'bg-blue-500', width: '75%' };
    return { label: 'Mạnh', color: 'bg-emerald-500', width: '100%' };
  };
  const strength = pwStrength();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-in fade-in duration-500">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-white animate-in slide-in-from-top-3 duration-300
          ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8 flex items-center">
        Thiết Lập Tài Khoản
        <ShieldCheck className="w-8 h-8 ml-3 text-emerald-500" />
      </h1>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="md:flex">
          {/* Sidebar */}
          <div className="md:w-[35%] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 p-8 sm:p-10 bg-slate-50 dark:bg-slate-900/50">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="relative group cursor-pointer mb-5">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt={user?.name}
                  className="w-32 h-32 rounded-full border-[6px] border-white dark:border-slate-700 shadow-xl object-cover bg-white group-hover:scale-105 transition-transform"
                />
                <button type="button" className="absolute bottom-2 right-0 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{user?.email}</p>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full mt-3 uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm">
                {user?.role}
              </span>
            </div>

            {/* Tab Nav */}
            <nav className="space-y-2">
              {tabs.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center px-5 py-4 font-bold rounded-2xl transition-all hover:scale-[1.02]
                    ${activeTab === id
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md border border-indigo-100 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'
                    }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" /> {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Panel */}
          <div className="md:w-[65%] p-8 sm:p-12">
            {/* --- TAB: PROFILE --- */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">
                  Thông Tin Cá Nhân
                </h3>
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Họ và Tên</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 pointer-events-none" />
                        <input
                          type="text" name="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className={inputWithIconCls}
                          placeholder="Tên của bạn..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Số Điện Thoại</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 pointer-events-none" />
                        <input
                          type="text" name="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className={inputWithIconCls}
                          placeholder="VD: 0901 234 567"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                      Email <span className="text-slate-400 font-medium">(Chỉ Đọc)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 pointer-events-none" />
                      <input
                        type="email" value={profileData.email} disabled
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-600/50 text-slate-500 dark:text-slate-300 font-bold outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit" disabled={loading}
                      className="flex items-center px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-600/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70"
                    >
                      {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Đang lưu...</> : <><Save className="w-5 h-5 mr-2" /> Lưu Thay Đổi</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- TAB: SECURITY / PASSWORD --- */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-700 pb-4">
                  Bảo Mật & Đổi Mật Khẩu
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Mật khẩu mạnh giúp bảo vệ tài khoản của bạn. Khuyến nghị thay đổi định kỳ 3 tháng/lần.</p>

                <form onSubmit={handlePasswordSave} className="space-y-6">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Mật Khẩu Hiện Tại <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-400 pointer-events-none" />
                      <input
                        required
                        type={showPw.current ? 'text' : 'password'}
                        value={pwData.currentPassword}
                        onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
                        placeholder="Nhập mật khẩu hiện tại..."
                        className={`${inputWithIconCls} pr-12`}
                      />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        {showPw.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Mật Khẩu Mới <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 pointer-events-none" />
                      <input
                        required
                        type={showPw.new ? 'text' : 'password'}
                        value={pwData.newPassword}
                        onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                        placeholder="Nhập mật khẩu mới..."
                        className={`${inputWithIconCls} pr-12`}
                      />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        {showPw.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Password Strength Bar */}
                    {strength && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Độ mạnh mật khẩu</span>
                          <span className={`text-xs font-black ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div className={`${strength.color} h-2 rounded-full transition-all duration-500`} style={{ width: strength.width }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Xác Nhận Mật Khẩu Mới <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 pointer-events-none" />
                      <input
                        required
                        type={showPw.confirm ? 'text' : 'password'}
                        value={pwData.confirmPassword}
                        onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })}
                        placeholder="Nhập lại mật khẩu mới..."
                        className={`${inputWithIconCls} pr-12 ${pwData.confirmPassword && pwData.newPassword !== pwData.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}`}
                      />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        {showPw.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {pwData.confirmPassword && pwData.newPassword !== pwData.confirmPassword && (
                      <p className="text-red-500 text-xs font-bold mt-1 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Mật khẩu xác nhận chưa khớp!</p>
                    )}
                    {pwData.confirmPassword && pwData.newPassword === pwData.confirmPassword && (
                      <p className="text-emerald-500 text-xs font-bold mt-1 flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mật khẩu khớp!</p>
                    )}
                  </div>

                  {/* Security Tips */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800">
                    <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-300 mb-2 flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> Gợi ý bảo mật</h4>
                    <ul className="text-xs text-indigo-600 dark:text-indigo-400 font-medium space-y-1">
                      <li>• Sử dụng ít nhất 8 ký tự bao gồm chữ hoa, chữ thường và số</li>
                      <li>• Tránh dùng tên, ngày sinh hoặc các thông tin dễ đoán</li>
                      <li>• Không dùng chung mật khẩu với các tài khoản khác</li>
                    </ul>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit" disabled={loading}
                      className="flex items-center px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-rose-600/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70"
                    >
                      {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Đang cập nhật...</> : <><Lock className="w-5 h-5 mr-2" /> Xác Nhận Đổi Mật Khẩu</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
