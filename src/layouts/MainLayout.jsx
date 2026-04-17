import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Bell, Menu as MenuIcon, X, Home, Search, User, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useNotificationStore } from '../store/notificationStore';

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { darkMode, toggleTheme } = useThemeStore();
  const { notifications, addNotification, markAllRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        "Có phòng mới trống ở khu vực trung tâm!", 
        "Giá phòng số 102 vừa giảm", 
        "Ai đó vừa phản hồi bình luận của bạn"
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      addNotification(randomMsg, 'info');
    }, 60000); 
    return () => clearInterval(interval);
  }, [addNotification]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) markAllRead();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 pb-16 md:pb-0 overflow-x-hidden w-full">
      <header className="bg-white/95 dark:bg-slate-900/95 shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 w-full backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-black text-sm shadow-sm group-hover:scale-105 transition-transform tracking-tight">DL</div>
              <span className="text-xl font-extrabold tracking-tight hidden sm:block text-slate-800 dark:text-white">Đức Lương <span className="text-primary-500 dark:text-primary-400">Home</span></span>
            </Link>
          </div>
          
          <nav className="hidden lg:flex space-x-8 items-center">
            <Link to="/" className="text-sm font-semibold text-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Trang Chủ
            </Link>
            <Link to="/rooms" className="text-sm font-semibold text-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Tìm Phòng
            </Link>
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'STAFF') && (
              <Link to="/post-room" className="text-sm font-semibold text-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Đăng Phóng Mới
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
            </button>

            <div className="relative">
              <button onClick={handleNotificationClick} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative">
                <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Thông báo mới</h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline" onClick={markAllRead}>Đánh dấu đã đọc</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">Bạn không có thông báo nào!</p>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <Link 
                          to="/dashboard" 
                          key={n.id} 
                          onClick={() => setShowNotifications(false)}
                          className="block px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{n.message}</p>
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-1 block uppercase tracking-widest">{n.time}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                <div className="flex items-center gap-3 ml-1 relative group cursor-pointer">
                  <div className="hidden md:block text-right">
                    <div className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{user?.name}</div>
                    <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">{user?.role}</div>
                  </div>
                  
                  {/* Dropdown Profile */}
                  <div className="absolute right-0 top-full mt-4 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2 space-y-1">
                      <Link to="/dashboard" className="block px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">Bảng Điều Khiển</Link>
                      <Link to="/profile" className="block px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">Hồ Sơ Cá Nhân</Link>
                      
                      {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                        <>
                          <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
                          <Link to="/admin" className="block px-4 py-2.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-colors">Quản Trị Hệ Thống</Link>
                          <Link to="/post-room" className="block px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">Đăng Phòng Mới</Link>
                        </>
                      )}
                      
                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        Đăng Xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
               <div className="hidden sm:flex items-center gap-3 ml-2">
                <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Đăng Nhập
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-primary-500 text-white px-5 py-2.5 rounded-xl hover:bg-primary-600 transition-all shadow-sm active:scale-95">
                  Đăng Ký Khách Thuê
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link to="/" className="block px-4 py-3 rounded-xl text-base font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white transition-colors">
                Trang Chủ
              </Link>
              <Link to="/rooms" className="block px-4 py-3 rounded-xl text-base font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Tìm Phòng Của Bạn
              </Link>
              
              {isAuthenticated ? (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-4 mx-2"></div>
                  <div className="px-4 mb-2 text-xs font-black text-slate-400 uppercase tracking-wider">Cá Nhân</div>
                  <Link to="/dashboard" className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Bảng Điều Khiển
                  </Link>
                  <Link to="/profile" className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Hồ Sơ Của Tôi
                  </Link>
                  
                  {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                    <>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-4 mx-2"></div>
                      <div className="px-4 mb-2 text-xs font-black text-slate-400 uppercase tracking-wider">Quản Trị Tổ Chức</div>
                      <Link to="/admin" className="block px-4 py-3 rounded-xl text-base font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 transition-colors">
                        Trang Quản Trị Hệ Thống
                      </Link>
                      <Link to="/post-room" className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Đăng Phòng Mới
                      </Link>
                    </>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="px-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">{user?.name}</div>
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{user?.role}</div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="text-sm font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl transition-colors"
                      >
                        Đăng Xuất
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 px-2">
                  <Link to="/login" className="flex justify-center items-center py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Đăng Nhập
                  </Link>
                  <Link to="/register" className="flex justify-center items-center py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all">
                    Đăng Ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-black text-sm shadow-sm tracking-tight">DL</div>
                <span className="font-extrabold text-white text-xl tracking-tight">Đức Lương <span className="text-primary-500">Home</span></span>
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Nền tảng tìm kiếm và quản lý phòng trọ số 1 dành cho sinh viên và người lao động trẻ. Uy tín, nhanh chóng, minh bạch.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Dịch Vụ</h4>
              <ul className="space-y-3 text-sm text-slate-400 font-medium">
                <li><Link to="/rooms" className="hover:text-indigo-400 transition-colors">Tìm Phòng Trọ</Link></li>
                <li><Link to="/rooms?type=Chung Cư Mini" className="hover:text-indigo-400 transition-colors">Chung Cư Mini</Link></li>
                <li><Link to="/rooms?type=KTX" className="hover:text-indigo-400 transition-colors">Ký Túc Xá Sinh Viên</Link></li>
                <li><Link to="/post-room" className="hover:text-indigo-400 transition-colors">Đăng Tin Cho Thuê</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-3 text-sm text-slate-400 font-medium">
                <li><Link to="/info/terms" className="hover:text-primary-400 transition-colors">Quy chế hoạt động</Link></li>
                <li><Link to="/info/faq" className="hover:text-primary-400 transition-colors">Câu hỏi thường gặp</Link></li>
                <li><Link to="/info/privacy" className="hover:text-primary-400 transition-colors">Chính sách bảo mật</Link></li>
                <li><Link to="/report" className="hover:text-rose-400 transition-colors">Báo cáo vi phạm</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Liên Hệ</h4>
              <ul className="space-y-3 text-sm text-slate-400 font-medium">
                <li>Email: hotro@fplweb.vn</li>
                <li>Hotline: 1900 1234 56</li>
                <li>Địa chỉ: Quận 1, TP Hồ Chí Minh</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-xs font-semibold text-slate-500">
               &copy; {new Date().getFullYear()} Bản quyền thuộc về <span className="text-primary-500 font-bold">Đức Lương Home</span>. Giải Pháp Quản Lý Phòng Trọ Thông Minh.
             </p>
             <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primary-600 transition-colors cursor-pointer border border-slate-700"></div>
               <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primary-600 transition-colors cursor-pointer border border-slate-700"></div>
               <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-primary-600 transition-colors cursor-pointer border border-slate-700"></div>
             </div>
          </div>
        </div>
      </footer>

      {/* ─── MOBILE BOTTOM NAV BAR (Native App Feel) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50 flex items-center justify-around px-2 pb-safe">
        <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
          <Home className={`w-5 h-5 ${location.pathname === '/' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-bold">Trang Chủ</span>
        </Link>
        <Link to="/rooms" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/rooms' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
          <Search className={`w-5 h-5 ${location.pathname === '/rooms' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-bold">Tìm Phòng</span>
        </Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
              <LayoutDashboard className={`w-5 h-5 ${location.pathname === '/dashboard' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-bold">Quản Lý</span>
            </Link>
            <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
              <User className={`w-5 h-5 ${location.pathname === '/profile' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-bold">Cá Nhân</span>
            </Link>
          </>
        ) : (
          <Link to="/login" className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400">
            <LogIn className="w-5 h-5 stroke-2" />
            <span className="text-[10px] font-bold">Đăng Nhập</span>
          </Link>
        )}
      </nav>

    </div>
  );
};

export default MainLayout;
