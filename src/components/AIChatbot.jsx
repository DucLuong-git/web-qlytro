import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, User, Sparkles, ExternalLink, Home, BarChart2, FileText, Users, Settings, Maximize2, Minimize2, Trash2, ChevronDown } from 'lucide-react';
import api from '../services/api';

// ─── Utility: parse price mentions ───────────────────────────────────────────
const extractPrice = (text) => {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(tr|triệu|m|million)?/i);
  if (!m) return null;
  const num = parseFloat(m[1].replace(',', '.'));
  return (m[2] ? num * 1000000 : num > 100 ? num : num * 1000000);
};

const extractDistrict = (text) => {
  const patterns = [
    /quận\s*(\d+|bình thạnh|tân bình|gò vấp|phú nhuận|thủ đức|bình dương)/i,
    /(bình thạnh|tân bình|gò vấp|phú nhuận|thủ đức|bình dương)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0];
  }
  return null;
};

// ─── Suggestion chips ────────────────────────────────────────────────────────
const USER_CHIPS = [
  'Phòng trống ở Quận 1?', 'Tìm phòng dưới 3 triệu', 'Phòng có máy lạnh',
  'Xem tất cả phòng', 'Liên hệ hỗ trợ', 'Chính sách thanh toán',
];
const ADMIN_CHIPS = [
  'Doanh thu tháng này?', 'Phòng đang trống?', 'Số khách hàng',
  'Đến trang logs', 'Quản lý phòng', 'Thêm phòng mới',
];

// ─── Route Actions ────────────────────────────────────────────────────────────
const ACTION_ROUTES = {
  '/rooms': 'Danh sách phòng',
  '/post-room': 'Đăng phòng mới',
  '/dashboard': 'Trang cá nhân',
  '/login': 'Đăng nhập',
  '/register': 'Đăng ký',
  '/info/terms': 'Điều khoản',
  '/info/privacy': 'Chính sách',
  '/info/faq': 'FAQ',
  '/report': 'Báo cáo vi phạm',
  '/admin': 'Dashboard Admin',
  '/admin/rooms': 'Quản lý phòng',
  '/admin/tenants': 'Quản lý khách',
  '/admin/invoices': 'Hóa đơn',
  '/admin/logs': 'Lịch sử hoạt động',
  '/admin/settings': 'Cài đặt',
};

// ─── AI Engine: query DB + generate contextual response ──────────────────────
const generateUserReply = async (input, navigate) => {
  const low = input.toLowerCase();
  
  // Navigation intents
  const navMap = [
    { keys: ['xem phòng', 'danh sách phòng', 'tất cả phòng', 'tìm phòng', 'khám phá'], route: '/rooms', label: 'Danh Sách Phòng' },
    { keys: ['đăng phòng', 'cho thuê phòng', 'đăng ký phòng'], route: '/post-room', label: 'Đăng Phòng Mới' },
    { keys: ['đăng nhập', 'login'], route: '/login', label: 'Trang Đăng Nhập' },
    { keys: ['đăng ký', 'register', 'tạo tài khoản'], route: '/register', label: 'Trang Đăng Ký' },
    { keys: ['điều khoản', 'terms'], route: '/info/terms', label: 'Điều Khoản Dịch Vụ' },
    { keys: ['chính sách', 'privacy', 'bảo mật'], route: '/info/privacy', label: 'Chính Sách Bảo Mật' },
    { keys: ['faq', 'câu hỏi', 'thắc mắc', 'hỏi đáp'], route: '/info/faq', label: 'FAQ' },
    { keys: ['báo cáo vi phạm', 'tố cáo', 'report'], route: '/report', label: 'Trang Báo Cáo' },
    { keys: ['tài khoản', 'profile', 'hồ sơ'], route: '/dashboard', label: 'Trang Cá Nhân' },
  ];
  
  for (const nav of navMap) {
    if (nav.keys.some(k => low.includes(k))) {
      setTimeout(() => navigate(nav.route), 1800);
      return {
        text: `🔗 Tôi sẽ đưa bạn đến **${nav.label}** ngay!`,
        action: { label: `Đến ${nav.label}`, route: nav.route },
      };
    }
  }

  // Query rooms from DB
  try {
    const { data: rooms } = await api.get('/rooms');
    const available = rooms.filter(r => r.status === 'Available');
    
    // District search
    const district = extractDistrict(low);
    if (district) {
      const matched = available.filter(r => r.district?.toLowerCase().includes(district.toLowerCase()));
      if (matched.length > 0) {
        const top = matched.slice(0, 3);
        const list = top.map(r => `• **${r.name}** – ${r.district} – ${(r.price || 0).toLocaleString('vi-VN')}đ/tháng`).join('\n');
        return {
          text: `🏠 Tôi tìm thấy **${matched.length} phòng** ở ${district}:\n\n${list}\n\nBạn muốn xem chi tiết phòng nào?`,
          action: { label: `Xem tất cả phòng ở ${district}`, route: `/rooms` },
        };
      }
      return {
        text: `😔 Hiện tại chưa có phòng trống ở **${district}**. Bạn có muốn xem phòng ở khu vực khác không?`,
        action: { label: 'Xem tất cả phòng', route: '/rooms' },
      };
    }

    // Price filter
    const priceMax = extractPrice(low);
    const isUnderPrice = low.includes('dưới') || low.includes('dưói') || low.includes('under') || low.includes('giá rẻ') || low.includes('tiết kiệm');
    if (priceMax && isUnderPrice) {
      const matched = available.filter(r => r.price <= priceMax);
      if (matched.length > 0) {
        const fmtPrice = (priceMax / 1000000).toFixed(0) + ' triệu';
        const list = matched.slice(0, 3).map(r => `• **${r.name}** – ${r.district} – ${(r.price || 0).toLocaleString('vi-VN')}đ`).join('\n');
        return {
          text: `💰 Dưới **${fmtPrice}** tôi tìm thấy **${matched.length} phòng**:\n\n${list}`,
          action: { label: 'Xem tất cả', route: '/rooms' },
        };
      }
    }

    // Amenity search
    const amenityMap = { 'máy lạnh': 'Máy Lạnh', 'wifi': 'WiFi Miễn Phí', 'ban công': 'Có Ban Công', 'giữ xe': 'Chỗ Để Xe', 'máy giặt': 'Free Máy Giặt', 'bảo vệ': 'Bảo Vệ 24/7', 'camera': 'Camera An Ninh', 'nội thất': 'Nội Thất Đầy Đủ' };
    for (const [kw, amenity] of Object.entries(amenityMap)) {
      if (low.includes(kw)) {
        const matched = available.filter(r => r.amenities?.includes(amenity));
        if (matched.length > 0) {
          const list = matched.slice(0, 3).map(r => `• **${r.name}** – ${r.district}`).join('\n');
          return {
            text: `✨ Phòng có **${amenity}** (${matched.length} kết quả):\n\n${list}`,
            action: { label: 'Xem tất cả', route: '/rooms' },
          };
        }
      }
    }

    // Stats overview
    if (low.includes('bao nhiêu phòng') || low.includes('số phòng') || low.includes('thống kê')) {
      return {
        text: `📊 Hiện hệ thống có **${rooms.length} phòng** tổng cộng:\n• ✅ Phòng trống: **${available.length}**\n• 🔴 Đang thuê: **${rooms.filter(r => r.status === 'Occupied').length}**\n\nBạn muốn xem danh sách phòng không?`,
        action: { label: 'Xem danh sách', route: '/rooms' },
      };
    }

    // Greeting
    if (low.includes('xin chào') || low.includes('chào') || low.includes('hello') || low.includes('hi')) {
      return { text: `👋 Xin chào! Tôi là **DL Bot** – Trợ lý tìm phòng thông minh của Đức Lương Home.\n\nHiện có **${available.length}** phòng đang trống. Bạn muốn tìm phòng ở đâu, mức giá bao nhiêu ạ?` };
    }

    // Payment
    if (low.includes('thanh toán') || low.includes('vnpay') || low.includes('nạp tiền') || low.includes('hóa đơn')) {
      return { text: '💳 Đức Lương Home hỗ trợ thanh toán qua **VNPay**, chuyển khoản ngân hàng và tiền mặt.\nBạn có thể thanh toán hóa đơn trong trang **Tài Khoản → Dashboard**.' };
    }

    // Giúp Bot thông minh hơn với LLM qua Pollinations AI thay vì chỉ trả lời mẫu cứng
    try {
      const roomInfo = available.slice(0, 3).map(r => `${r.name} giá ${(r.price || 0).toLocaleString('vi-VN')} tại ${r.district}`).join('; ');
      const prompt = `Bạn là DL Bot - trợ lý tư vấn tìm phòng trọ của Đức Lương Home (không phải AI bình thường). 
Hãy trả lời siêu ngắn gọn, thân thiện bằng tiếng Việt.
Thông tin một số phòng đang trống: ${roomInfo}. 
Khách hàng vừa nói: "${input}". Trả lời ngay lập tức:`;
      
      // Dùng GET thuần với endpoint chuẩn mới nhất không có /prompt/ để tránh lỗi CORS Preflight trên trình duyệt.
      const res = await fetch('https://text.pollinations.ai/' + encodeURIComponent(prompt));

      if (res.ok) {
        let aiText = await res.text();
        if (!aiText.includes('THÔNG BÁO QUAN TRỌNG') && !aiText.includes('IMPORTANT NOTICE')) {
          return {
            text: aiText,
            action: { label: 'Xem tất cả phòng', route: '/rooms' },
          };
        }
      }
    } catch (e) {
      console.warn("AI LLM failed, using fallback", e);
    }

    // Default
    return {
      text: `Tôi hiểu bạn đang cần: "${input}". Hiện có **${available.length}** phòng trống.\n\nBạn có thể hỏi tôi chi tiết hơn về một vấn đề hoặc:\n• 🏠 Tìm phòng theo khu vực\n• 💰 Lọc theo mức giá\n• 📍 Điều hướng đến trang bất kỳ`,
      action: { label: 'Khám phá phòng ngay', route: '/rooms' },
    };
  } catch {
    return { text: 'Xin lỗi, tôi đang gặp sự cố kết nối dữ liệu. Vui lòng thử lại sau!' };
  }
};

const generateAdminReply = async (input, navigate) => {
  const low = input.toLowerCase();

  // Navigation intents
  const navMap = [
    { keys: ['quản lý phòng', 'danh sách phòng', 'rooms'], route: '/admin/rooms', label: 'Quản Lý Phòng' },
    { keys: ['khách hàng', 'khách thuê', 'tenants'], route: '/admin/tenants', label: 'Quản Lý Khách Hàng' },
    { keys: ['hóa đơn', 'invoices', 'thanh toán'], route: '/admin/invoices', label: 'Quản Lý Hóa Đơn' },
    { keys: ['logs', 'lịch sử', 'hoạt động', 'audit'], route: '/admin/logs', label: 'Lịch Sử Hoạt Động' },
    { keys: ['cài đặt', 'settings', 'thiết lập'], route: '/admin/settings', label: 'Cài Đặt Hệ Thống' },
    { keys: ['dashboard', 'tổng quan', 'thống kê tổng'], route: '/admin', label: 'Dashboard' },
    { keys: ['trang chủ', 'người dùng', 'về trang web'], route: '/', label: 'Trang Chủ' },
    { keys: ['thêm phòng mới', 'đăng phòng', 'tạo phòng'], route: '/admin/rooms', label: 'Quản Lý Phòng' },
  ];

  for (const nav of navMap) {
    if (nav.keys.some(k => low.includes(k))) {
      setTimeout(() => navigate(nav.route), 1800);
      return {
        text: `🚀 Đang chuyển hướng đến **${nav.label}**...`,
        action: { label: `Đến ${nav.label}`, route: nav.route },
      };
    }
  }

  try {
    const [roomsRes, tenantsRes] = await Promise.all([api.get('/rooms'), api.get('/tenants')]);
    const rooms = roomsRes.data;
    const tenants = tenantsRes.data;
    const occupied = rooms.filter(r => r.status === 'Occupied');
    const available = rooms.filter(r => r.status === 'Available');
    const maintenance = rooms.filter(r => r.status === 'Maintenance');
    const revenue = occupied.reduce((acc, r) => acc + Number(r.price || 0), 0);

    // Revenue query
    if (low.includes('doanh thu') || low.includes('thu nhập') || low.includes('tiền')) {
      return {
        text: `💰 **Báo Cáo Doanh Thu**\n\n• Doanh thu ước tính: **${revenue.toLocaleString('vi-VN')}đ**\n• Phòng đang thuê: **${occupied.length}/${rooms.length}**\n• Tỉ lệ lấp đầy: **${rooms.length ? Math.round((occupied.length / rooms.length) * 100) : 0}%**\n\nBạn muốn xuất báo cáo Excel không?`,
        action: { label: 'Xem Dashboard', route: '/admin' },
      };
    }

    // Room stats
    if (low.includes('phòng trống') || low.includes('available') || low.includes('còn trống')) {
      const list = available.slice(0, 5).map(r => `• **${r.name}** – ${r.district} – ${(r.price || 0).toLocaleString('vi-VN')}đ`).join('\n');
      return {
        text: `🏠 **Phòng Đang Trống (${available.length})**\n\n${list || 'Không có phòng trống'}`,
        action: { label: 'Quản lý phòng', route: '/admin/rooms' },
      };
    }

    // Tenant query
    if (low.includes('khách hàng') || low.includes('tenant') || low.includes('người thuê') || low.includes('số lượng')) {
      return {
        text: `👥 **Thống Kê Khách Hàng**\n\n• Tổng khách hàng: **${tenants.length}**\n• Đang thuê phòng: **${occupied.length}** phòng có tenant\n• Phòng bảo trì: **${maintenance.length}**`,
        action: { label: 'Xem danh sách khách', route: '/admin/tenants' },
      };
    }

    // Overview
    if (low.includes('thống kê') || low.includes('báo cáo') || low.includes('tổng quan') || low.includes('overview')) {
      return {
        text: `📊 **Tổng Quan Hệ Thống**\n\n• 🏠 Tổng phòng: **${rooms.length}**\n• ✅ Đang thuê: **${occupied.length}**\n• 🟡 Phòng trống: **${available.length}**\n• 🔧 Bảo trì: **${maintenance.length}**\n• 👥 Khách hàng: **${tenants.length}**\n• 💰 Doanh thu ước: **${revenue.toLocaleString('vi-VN')}đ**`,
        action: { label: 'Xem Dashboard', route: '/admin' },
      };
    }

    // Greeting
    if (low.includes('chào') || low.includes('hello') || low.includes('hi') || low.includes('xin chào')) {
      return {
        text: `👋 Chào Sếp! Tôi là **DL Admin Bot** – Trợ lý quản trị thông minh.\n\n📊 Hệ thống hiện có:\n• **${rooms.length}** phòng | **${available.length}** đang trống\n• **${tenants.length}** khách hàng\n• Doanh thu ước: **${(revenue / 1000000).toFixed(1)}tr đ**\n\nSếp cần xem thống kê gì ạ?`,
      };
    }

    // Hybrid AI Admin 
    try {
      const prompt = `Bạn là DL Admin Bot - trợ lý đắc lực của Sếp tại Đức Lương Home.
Luôn trả lời thật ngắn gọn, chuyên nghiệp, thông minh, gọi người đối diện là "Sếp" và tự xưng là "Bot".
Dữ liệu hiện tại: Tổng ${rooms.length} phòng, ${available.length} trống, ${tenants.length} khách, doanh thu ${(revenue / 1000000).toFixed(1)} triệu.
Sếp yêu cầu/hỏi: "${input}". Trả lời ngay:`;
      const res = await fetch('https://text.pollinations.ai/' + encodeURIComponent(prompt));

      if (res.ok) {
        let aiText = await res.text();
        if (!aiText.includes('THÔNG BÁO QUAN TRỌNG') && !aiText.includes('IMPORTANT NOTICE')) {
          return {
            text: aiText,
            action: { label: 'Tới Trang Chủ Admin', route: '/admin' },
          };
        }
      }
    } catch (e) {
      console.warn("AI LLM failed, using fallback", e);
    }

    return {
      text: `Sếp vừa nói: "${input}".\n\nSếp có thể bảo tôi điều hướng trực tiếp đến chức năng, hoặc tra cứu cụ thể số liệu.\n• 📊 Doanh thu & thống kê\n• 🏠 Phòng trống/đang thuê\n• 👥 Khách hàng`,
      action: { label: 'Dashboard Tổng', route: '/admin' },
    };
  } catch {
    return { text: 'Xin lỗi, không thể truy vấn dữ liệu lúc này. Kiểm tra kết nối server!' };
  }
};

// ─── Format message text with markdown-like bold ─────────────────────────────
const FormatText = ({ text }) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <span className="whitespace-pre-line leading-relaxed">
      {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold">{p}</strong> : p)}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AIChatbot = ({ type = 'user' }) => {
  const navigate = useNavigate();
  const isAdmin = type === 'admin';

  const initMsg = {
    id: 1, sender: 'ai',
    text: isAdmin
      ? '👋 Chào Sếp! Tôi là **DL Admin Bot**. Hỏi tôi về doanh thu, phòng trống, khách hàng hoặc bảo tôi điều hướng đến bất kỳ trang nào!'
      : '👋 Xin chào! Tôi là **DL Bot** – trợ lý tìm phòng thông minh. Bạn muốn tìm phòng ở đâu, mức giá bao nhiêu ạ?',
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([initMsg]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const chips = isAdmin ? ADMIN_CHIPS : USER_CHIPS;
  const accentFrom = isAdmin ? 'from-emerald-600' : 'from-indigo-600';
  const accentTo = isAdmin ? 'to-teal-500' : 'to-violet-600';
  const accentBg = isAdmin ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30';
  const accentRing = isAdmin ? 'focus:ring-emerald-400' : 'focus:ring-indigo-400';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;
    setShowChips(false);
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    setInputVal('');
    setIsTyping(true);

    try {
      const delay = 800 + Math.random() * 600;
      await new Promise(r => setTimeout(r, delay));
      const reply = isAdmin
        ? await generateAdminReply(text, navigate)
        : await generateUserReply(text, navigate);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', ...reply }]);
    } finally {
      setIsTyping(false);
    }
  }, [isAdmin, isTyping, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputVal);
  };

  const clearChat = () => {
    setMessages([initMsg]);
    setShowChips(true);
  };

  // Cân chỉnh khoảng cách Bottom dành riêng cho Mobile (nhường chỗ cho Bottom Navigation)
  const windowH = isMaximized ? 'h-[85vh]' : 'h-[500px] md:h-[560px] max-h-[85vh]';
  const windowW = isMaximized ? 'w-[calc(100vw-3rem)] sm:w-[560px]' : 'w-[calc(100vw-3rem)] md:w-[350px] sm:w-[420px]';
  const bottomPlacement = 'bottom-20 md:bottom-6';

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed ${bottomPlacement} right-6 p-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 z-50 flex items-center gap-2 text-white ${accentBg} shadow-xl`}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <span className="text-sm font-black hidden sm:inline">AI {isAdmin ? 'Admin' : 'Tư Vấn'}</span>
        </button>
      )}

      {/* Chat Window */}
      <div className={`fixed ${bottomPlacement} right-6 ${windowW} ${windowH} bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right border border-slate-200 dark:border-slate-700 overflow-hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className={`bg-gradient-to-r ${accentFrom} ${accentTo} p-4 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">
                {isAdmin ? '🛠 DL Admin Bot' : '🤖 DL Bot'}
              </h3>
              <p className="text-white/80 text-[11px] font-medium">AI thông minh · Truy vấn dữ liệu thực</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={clearChat} className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white/70 hover:text-white" title="Xóa lịch sử">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={() => setIsMaximized(!isMaximized)} className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white/70 hover:text-white" title="Phóng to">
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/60">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-200`}>
              <div className={`flex gap-2 max-w-[88%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black mt-1
                  ${msg.sender === 'user'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    : `bg-gradient-to-br ${accentFrom} ${accentTo} text-white`
                  }`}>
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className="flex flex-col gap-1.5">
                  {/* Bubble */}
                  <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed
                    ${msg.sender === 'user'
                      ? `bg-gradient-to-br ${accentFrom} ${accentTo} text-white rounded-tr-sm`
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                    }`}>
                    <FormatText text={msg.text} />
                  </div>

                  {/* Action button */}
                  {msg.action && (
                    <button
                      onClick={() => navigate(msg.action.route)}
                      className={`self-start flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md
                        ${isAdmin
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                        }`}
                    >
                      <ExternalLink className="w-3 h-3" /> {msg.action.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex gap-2 max-w-[80%]">
                <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${accentFrom} ${accentTo}`}>
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {showChips && (
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-none">
            {chips.map(chip => (
              <button key={chip} onClick={() => sendMessage(chip)}
                className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all hover:-translate-y-0.5 whitespace-nowrap
                  ${isAdmin
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                  }`}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={isAdmin ? 'Hỏi về doanh thu, phòng, điều hướng...' : 'Tìm phòng, hỏi giá, điều hướng...'}
              className={`flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-opacity-50 transition-all ${accentRing} focus:ring-2`}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className={`p-3 rounded-2xl text-white font-bold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${accentBg}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIChatbot;
