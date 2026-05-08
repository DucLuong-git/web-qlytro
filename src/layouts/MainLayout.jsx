import { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Moon, Sun, Bell, Menu as MenuIcon, X,
  Home, Search, User, LayoutDashboard, LogIn,
  ChevronDown, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useNotificationStore } from '../store/notificationStore';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { darkMode, toggleTheme } = useThemeStore();
  const { notifications, addNotification, markAllRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;
  const isHome = location.pathname === '/';

  /* Scroll detection for navbar style */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* Close menu on route change */
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  /* Notification polling */
  useEffect(() => {
    const msgs = [
      'Có phòng mới trống ở khu vực trung tâm!',
      'Giá phòng số 102 vừa giảm',
      'Ai đó vừa phản hồi bình luận của bạn',
    ];
    const interval = setInterval(() => {
      addNotification(msgs[Math.floor(Math.random() * msgs.length)], 'info');
    }, 60000);
    return () => clearInterval(interval);
  }, [addNotification]);

  /* Click outside to close notif dropdown */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNotificationClick = () => {
    setShowNotifications(v => !v);
    markAllRead();
  };

  /* Nav links */
  const navLinks = [
    { to: '/',      label: 'Trang Chủ' },
    { to: '/rooms', label: 'Tìm Phòng' },
    ...(isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'STAFF')
      ? [{ to: '/post-room', label: 'Đăng Phòng' }]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-[var(--ink-black)] dark:text-slate-100 font-sans transition-colors duration-300 pb-16 md:pb-0 overflow-x-hidden w-full">

      {/* ═══════ HEADER ═══════ */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled || !isHome
            ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-[var(--hairline-gray)] dark:border-slate-800 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between max-w-[1400px]">

          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 rounded-full hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800 text-[var(--ash-gray)] transition-colors"
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm group-hover:scale-105 transition-transform"
                style={{ background: 'var(--brand-gradient)' }}
              >
                DL
              </div>
              <span
                className={`text-lg font-black tracking-tight hidden sm:block transition-colors ${
                  scrolled || !isHome ? 'text-[var(--ink-black)] dark:text-white' : 'text-white'
                }`}
              >
                Đức Lương <span style={{ color: 'var(--rausch)' }}>Home</span>
              </span>
            </Link>
          </div>

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link text-sm transition-colors ${
                  location.pathname === link.to ? 'active' : ''
                } ${
                  scrolled || !isHome
                    ? 'text-[var(--ash-gray)] hover:text-[var(--ink-black)] dark:text-slate-400 dark:hover:text-white'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode
                ? <Sun className="w-4 h-4 text-yellow-500" />
                : <Moon className={`w-4 h-4 ${scrolled || !isHome ? 'text-[var(--ash-gray)]' : 'text-white/70'}`} />
              }
            </button>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleNotificationClick}
                className="relative p-2 rounded-full hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className={`w-4 h-4 ${scrolled || !isHome ? 'text-[var(--ash-gray)]' : 'text-white/70'}`} />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 w-2 h-2 rounded-full border border-white"
                    style={{ background: 'var(--rausch)' }}
                  />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-[var(--hairline-gray)] dark:border-slate-700 overflow-hidden z-50"
                    style={{ boxShadow: 'var(--shadow-2)' }}
                  >
                    <div className="px-4 py-3 border-b border-[var(--hairline-gray)] dark:border-slate-700 flex items-center justify-between">
                      <span className="text-sm font-700 text-[var(--ink-black)] dark:text-white">Thông báo</span>
                      <button onClick={markAllRead} className="text-xs font-600 hover:underline" style={{ color: 'var(--rausch)' }}>
                        Đánh dấu đã đọc
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-[var(--ash-gray)]">Không có thông báo nào.</p>
                      ) : notifications.slice(0, 5).map(n => (
                        <Link
                          key={n.id}
                          to="/dashboard"
                          onClick={() => setShowNotifications(false)}
                          className="flex flex-col px-4 py-3 border-b border-[var(--soft-cloud)] dark:border-slate-800 hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800 transition-colors"
                        >
                          <span className="text-sm font-500 text-[var(--ink-black)] dark:text-slate-200">{n.message}</span>
                          <span className="text-[10px] text-[var(--mute-gray)] mt-0.5 font-500">{n.time}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3 ml-1">
                <div className="h-5 w-px bg-[var(--hairline-gray)] dark:bg-slate-700" />
                <div className="relative group cursor-pointer">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--hairline-gray)] dark:border-slate-700 hover:border-[var(--ash-gray)] transition-colors bg-white dark:bg-slate-900">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-800"
                      style={{ background: 'var(--brand-gradient)' }}
                    >
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-600 text-[var(--ink-black)] dark:text-white max-w-[100px] truncate hidden md:block">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--ash-gray)] hidden md:block" />
                  </button>

                  {/* Dropdown */}
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl border border-[var(--hairline-gray)] dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden"
                    style={{ boxShadow: 'var(--shadow-2)' }}
                  >
                    <div className="px-4 py-3 border-b border-[var(--soft-cloud)] dark:border-slate-800">
                      <div className="text-sm font-700 text-[var(--ink-black)] dark:text-white">{user?.name}</div>
                      <div className="text-[10px] font-700 uppercase tracking-wider mt-0.5" style={{ color: 'var(--rausch)' }}>{user?.role}</div>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link to="/dashboard" className="block px-3 py-2.5 text-sm font-500 text-[var(--ash-gray)] hover:text-[var(--ink-black)] dark:hover:text-white hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800 rounded-xl transition-colors">
                        Bảng Điều Khiển
                      </Link>
                      <Link to="/profile" className="block px-3 py-2.5 text-sm font-500 text-[var(--ash-gray)] hover:text-[var(--ink-black)] dark:hover:text-white hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800 rounded-xl transition-colors">
                        Hồ Sơ Cá Nhân
                      </Link>
                      {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                        <>
                          <div className="h-px bg-[var(--hairline-gray)] dark:bg-slate-700 mx-2 my-1" />
                          <Link to="/admin" className="block px-3 py-2.5 text-sm font-600 hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800 rounded-xl transition-colors" style={{ color: 'var(--rausch)' }}>
                            Quản Trị Hệ Thống
                          </Link>
                          <Link to="/post-room" className="block px-3 py-2.5 text-sm font-500 text-[var(--ash-gray)] hover:text-[var(--ink-black)] dark:hover:text-white hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800 rounded-xl transition-colors">
                            Đăng Phòng Mới
                          </Link>
                        </>
                      )}
                      <div className="h-px bg-[var(--hairline-gray)] dark:bg-slate-700 mx-2 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2.5 text-sm font-600 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                      >
                        Đăng Xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className={`text-sm font-600 px-3 py-2 rounded-full transition-colors ${
                    scrolled || !isHome
                      ? 'text-[var(--ash-gray)] hover:text-[var(--ink-black)] dark:text-slate-400 dark:hover:text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-600 text-white px-4 py-2 rounded-full transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ background: 'var(--rausch)' }}
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden bg-white dark:bg-slate-950 border-t border-[var(--hairline-gray)] dark:border-slate-800 overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-600 transition-colors ${
                      location.pathname === link.to
                        ? 'text-[var(--rausch)] bg-red-50 dark:bg-red-950/30'
                        : 'text-[var(--ash-gray)] hover:text-[var(--ink-black)] dark:hover:text-white hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <>
                    <div className="h-px bg-[var(--hairline-gray)] dark:bg-slate-800 my-3 mx-2" />
                    <div className="px-4 text-[10px] font-800 text-[var(--mute-gray)] uppercase tracking-widest mb-2">Cá Nhân</div>
                    <Link to="/dashboard" className="flex items-center px-4 py-3 rounded-xl text-sm font-500 text-[var(--ash-gray)] hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800 transition-colors">
                      Bảng Điều Khiển
                    </Link>
                    <Link to="/profile" className="flex items-center px-4 py-3 rounded-xl text-sm font-500 text-[var(--ash-gray)] hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800 transition-colors">
                      Hồ Sơ Của Tôi
                    </Link>
                    {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                      <>
                        <div className="h-px bg-[var(--hairline-gray)] dark:bg-slate-800 my-3 mx-2" />
                        <Link to="/admin" className="flex items-center px-4 py-3 rounded-xl text-sm font-700 transition-colors" style={{ color: 'var(--rausch)' }}>
                          Quản Trị Hệ Thống
                        </Link>
                        <Link to="/post-room" className="flex items-center px-4 py-3 rounded-xl text-sm font-500 text-[var(--ash-gray)] hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800 transition-colors">
                          Đăng Phòng Mới
                        </Link>
                      </>
                    )}
                    <div className="mt-4 px-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-700 text-[var(--ink-black)] dark:text-white">{user?.name}</div>
                        <div className="text-[10px] font-700 uppercase tracking-wider" style={{ color: 'var(--rausch)' }}>{user?.role}</div>
                      </div>
                      <button onClick={handleLogout} className="text-sm font-700 text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-xl transition-colors">
                        Đăng Xuất
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--hairline-gray)] dark:border-slate-800">
                    <Link to="/login" className="flex justify-center items-center py-3 border border-[var(--hairline-gray)] dark:border-slate-700 rounded-xl text-sm font-700 text-[var(--ink-black)] dark:text-white transition-colors hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-800">
                      Đăng Nhập
                    </Link>
                    <Link to="/register" className="flex justify-center items-center py-3 rounded-xl text-sm font-700 text-white active:scale-95 transition-all" style={{ background: 'var(--rausch)' }}>
                      Đăng Ký
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════ MAIN ═══════ */}
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-[var(--ink-black)] pt-16 pb-10 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs"
                  style={{ background: 'var(--brand-gradient)' }}
                >DL</div>
                <span className="font-black text-white text-lg tracking-tight">
                  Đức Lương <span style={{ color: 'var(--rausch)' }}>Home</span>
                </span>
              </div>
              <p className="text-sm text-[var(--ash-gray)] font-500 leading-relaxed max-w-[240px]">
                Nền tảng tìm kiếm & quản lý phòng trọ số 1 dành cho sinh viên và người lao động trẻ.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: 'Dịch Vụ',
                links: [
                  { label: 'Tìm Phòng Trọ', to: '/rooms' },
                  { label: 'Chung Cư Mini', to: '/rooms?type=Chung+Cư+Mini' },
                  { label: 'Ký Túc Xá Sinh Viên', to: '/rooms?type=KTX' },
                  { label: 'Đăng Tin Cho Thuê', to: '/post-room' },
                ],
              },
              {
                title: 'Hỗ Trợ',
                links: [
                  { label: 'Quy chế hoạt động', to: '/info/terms' },
                  { label: 'Câu hỏi thường gặp', to: '/info/faq' },
                  { label: 'Chính sách bảo mật', to: '/info/privacy' },
                  { label: 'Báo cáo vi phạm', to: '/report' },
                ],
              },
              {
                title: 'Liên Hệ',
                items: ['hotro@fplweb.vn', '1900 1234 56', 'Quận 1, TP Hồ Chí Minh'],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-700 text-sm mb-5 tracking-wide">{col.title}</h4>
                {col.links ? (
                  <ul className="space-y-3">
                    {col.links.map(link => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          className="text-sm text-[var(--ash-gray)] font-500 hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-3">
                    {col.items.map((item, j) => (
                      <li key={j} className="text-sm text-[var(--ash-gray)] font-500">{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[var(--mute-gray)] font-500">
              © {new Date().getFullYear()} <span style={{ color: 'var(--rausch)' }}>Đức Lương Home</span>. Giải Pháp Quản Lý Phòng Trọ Thông Minh.
            </p>
            <div className="flex gap-3">
              {['FB', 'IG', 'YT'].map(s => (
                <button
                  key={s}
                  className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/16 border border-white/10 text-[var(--ash-gray)] hover:text-white text-[10px] font-700 transition-all hover:-translate-y-0.5 flex items-center justify-center"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════ MOBILE BOTTOM NAV ═══════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-[var(--hairline-gray)] dark:border-slate-800 z-50 flex items-center justify-around px-2">
        {[
          { to: '/',          icon: Home,            label: 'Trang Chủ' },
          { to: '/rooms',     icon: Search,          label: 'Tìm Phòng' },
          ...(isAuthenticated
            ? [
                { to: '/dashboard', icon: LayoutDashboard, label: 'Quản Lý' },
                { to: '/profile',   icon: User,            label: 'Cá Nhân' },
              ]
            : [{ to: '/login', icon: LogIn, label: 'Đăng Nhập' }]
          ),
        ].map(item => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors"
              style={{ color: active ? 'var(--rausch)' : 'var(--mute-gray)' }}
            >
              <item.icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-700">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MainLayout;
