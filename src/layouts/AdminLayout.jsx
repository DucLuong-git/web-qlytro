import { useState, useEffect } from 'react';
import { Layout, Menu, Button, ConfigProvider, theme as antTheme, Avatar } from 'antd';
import { 
  BarChartOutlined, 
  HomeOutlined, 
  TeamOutlined, 
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { Moon, Sun } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { darkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <AppstoreOutlined />,
      label: 'Bảng Điều Khiển',
    },
    {
      key: '/admin/rooms',
      icon: <HomeOutlined />,
      label: 'Quản Lý Thuê Cơ Sở',
    },
    {
      key: '/admin/tenants',
      icon: <TeamOutlined />,
      label: 'Quản Lý Khách Hàng',
    },
    {
      key: '/admin/logs',
      icon: <HistoryOutlined />,
      label: 'Lịch Sử Hoạt Động',
    },
  ];

  const isMobile = window.innerWidth < 768;
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SiderContent = (
    <div className="h-full flex flex-col">
      <div className={`h-20 flex items-center justify-center border-b cursor-pointer transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-indigo-50/50 hover:bg-slate-50'}`} onClick={() => navigate('/admin')}>
        <div className="flex items-center gap-3">
          <div className={`transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 text-sm tracking-tight ${collapsed && !isMobile ? 'w-10 h-10' : 'w-10 h-10'}`}>
            DL
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col">
              <span className={`text-base font-extrabold tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Đức Lương <span className="text-indigo-500">Home</span></span>
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Admin System</span>
            </div>
          )}
        </div>
      </div>
      <Menu
        theme={darkMode ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => {
          navigate(key);
          if (isMobile) setCollapsed(true);
        }}
        className="border-none mt-6 px-3 space-y-2 font-bold custom-admin-menu flex-1"
      />
    </div>
  );

  return (
    <ConfigProvider theme={{ algorithm: darkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm }}>
      <Layout className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        
        {/* Mobile Drawer Sidebar */}
        <div className="md:hidden">
          <div 
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${!collapsed ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
            onClick={() => setCollapsed(true)}
          />
          <div className={`fixed top-0 left-0 h-full w-[260px] z-50 transform transition-transform duration-300 ${darkMode ? 'bg-[#141414] border-r border-slate-800' : 'bg-white border-r border-slate-200'} ${!collapsed ? 'translate-x-0' : '-translate-x-full'}`}>
             {SiderContent}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed} 
          theme={darkMode ? 'dark' : 'light'}
          width={260}
          className={`hidden md:block shadow-xl z-20 border-r sticky top-0 h-screen transition-all duration-300 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}
        >
          {SiderContent}
        </Sider>
        
        <Layout className={`relative min-h-screen z-10 flex flex-col transition-all duration-300 flex-1 overflow-x-hidden ${darkMode ? '!bg-slate-900' : '!bg-slate-50'}`}>
          <Header className={`h-20 px-4 sm:px-6 flex justify-between items-center shadow-sm sticky top-0 z-10 border-b backdrop-blur-md ${darkMode ? '!bg-slate-900/90 !border-slate-800' : '!bg-white/90 !border-slate-100/50'}`} style={{ padding: '0 16px' }}>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl transition-all ${darkMode ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                style={{ fontSize: '18px' }}
              />
              <h2 className={`hidden lg:block text-lg font-bold m-0 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Hệ Thống Quản Trị Cấp Cao</h2>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={toggleTheme} 
                className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />}
              </button>

              <Button 
                type="text" 
                onClick={() => navigate('/')}
                className={`hidden md:flex font-bold underline-offset-4 hover:underline transition-all ${darkMode ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Về Trang Khách Thuê
              </Button>
              
              <div className={`flex items-center gap-2 sm:gap-3 border-l pl-2 sm:pl-4 cursor-pointer hover:opacity-80 transition-opacity ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <Avatar src={user?.avatar} size={{ xs: 32, sm: 40 }} className="shadow-md border-2 border-indigo-500 bg-indigo-100 text-indigo-600 font-bold" />
                <div className="hidden md:block text-right leading-tight">
                  <div className={`text-sm font-extrabold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{user?.name}</div>
                  <div className="text-xs font-black text-indigo-500 uppercase tracking-widest">{user?.role}</div>
                </div>
              </div>

              <Button 
                type="primary" 
                danger 
                icon={<LogoutOutlined />} 
                onClick={handleLogout} 
                className="hidden sm:flex rounded-xl px-4 h-10 font-bold shadow-lg shadow-red-500/20 items-center hover:scale-105 transition-transform"
              >
                Đăng Xuất
              </Button>
            </div>
          </Header>
          
          <Content className="m-2 sm:m-4 md:m-8 flex-1 h-full relative z-0 overflow-x-hidden">
            <Outlet />
          </Content>

          <Footer className={`mt-auto border-t p-0 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            {/* Animated gradient top bar */}
            <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-[gradient-shift_4s_linear_infinite]" />

            {/* Stats row */}
            <div className={`grid grid-cols-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              {[
                { label: 'Hệ thống', value: 'Hoạt Động', dot: 'bg-emerald-500' },
                { label: 'Cập nhật lần cuối', value: new Date().toLocaleDateString('vi-VN') },
                { label: 'Phiên bản', value: 'v2.0.0 Stable', dot: 'bg-indigo-500' },
              ].map((s, i) => (
                <div key={i} className={`flex items-center justify-center gap-2 py-2 text-center border-r last:border-r-0 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  {s.dot && <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />}
                  <span className={`text-[10px] font-medium hidden sm:inline ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}:</span>
                  <span className={`text-[10px] font-black ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Main row */}
            <div className={`px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3`}>
              {/* Branding */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/30 flex-shrink-0">DL</div>
                <div>
                  <p className={`text-sm font-extrabold leading-tight m-0 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Đức Lương <span className="text-indigo-500">Home</span>
                  </p>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] m-0">Admin Platform</p>
                </div>
              </div>

              {/* Copyright */}
              <p className={`text-xs font-medium text-center m-0 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                &copy; {new Date().getFullYear()} <span className={`font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Đức Lương Home</span> — Hệ Thống Quản Lý Phòng Trọ Thông Minh
              </p>

              {/* Links */}
              <div className="flex items-center gap-3">
                {[
                  { label: 'Trang Chủ', action: () => navigate('/') },
                  { label: 'Dashboard', action: () => navigate('/admin') },
                  { label: 'Logs', action: () => navigate('/admin/logs') },
                ].map((link, i) => (
                  <button key={i} onClick={link.action}
                    className={`text-[11px] font-bold transition-all hover:text-indigo-500 hover:-translate-y-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
