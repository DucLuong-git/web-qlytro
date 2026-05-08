import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Building2, Shield, Star, Zap, Wallet, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import AIChatbot from '../components/AIChatbot';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Hero slides ── */
const HERO_SLIDES = [
  {
    bg: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1800&q=85',
    tag: 'Chung Cư Mini · Nội Thất Đầy Đủ',
    title: 'Không Gian Sống\nHiện Đại',
    sub: 'Căn hộ khép kín, view đẹp, bảo an 24/7 — chuẩn sống cho thế hệ trẻ.',
  },
  {
    bg: 'https://images.unsplash.com/photo-1502672260266-1c1b6612ce56?w=1800&q=85',
    tag: 'Phòng Trọ · Giá Tốt Nhất',
    title: 'Tìm Phòng Nhanh,\nGiá Minh Bạch',
    sub: 'Hàng ngàn phòng trống cập nhật mỗi ngày, kết nối trực tiếp không qua trung gian.',
  },
  {
    bg: 'https://images.unsplash.com/photo-1484154218962-a13f7ea07cb1?w=1800&q=85',
    tag: 'Ký Túc Xá · Sleep Box',
    title: 'An Toàn &\nTiết Kiệm',
    sub: 'Hệ thống Sleep Box cao cấp, máy lạnh 24h, phục vụ ăn uống — dành cho sinh viên FPT.',
  },
];

/* ── Category filters ── */
const CATEGORIES = [
  { label: 'Tất Cả',    icon: Home,      value: '' },
  { label: 'Chung Cư',  icon: Building2, value: 'Chung Cư Mini' },
  { label: 'Phòng Trọ', icon: Home,      value: 'Phòng trọ' },
  { label: 'KTX',       icon: Shield,    value: 'KTX' },
];

/* ── Features ── */
const FEATURES = [
  { icon: Shield, label: 'Bảo Đảm An Toàn',    desc: '100% tài sản và thông tin đã được thẩm duyệt kỹ lưỡng.' },
  { icon: Zap,    label: 'Cập Nhật Tức Thì',    desc: 'Dữ liệu làm mới liên tục với vô vàn lựa chọn phòng trống.' },
  { icon: Star,   label: 'AI Hỗ Trợ Tìm Kiếm', desc: 'Chatbot AI cá nhân hoá gợi ý phòng theo sở thích của bạn.' },
  { icon: Wallet, label: 'Thanh Toán Ngân Hàng', desc: 'Ký hợp đồng & thanh toán VNPay Online an toàn, nhanh chóng.' },
];

/* ── Animation variants ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
};
const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

/* ══════════════════════════════════════════════ */
export default function HomePage() {
  const [slide, setSlide]       = useState(0);
  const [direction, setDir]     = useState(1);
  const [searchTerm, setSearch] = useState('');
  const [roomType, setRoomType] = useState('');
  const [priceRange, setPrice]  = useState('');
  const timerRef = useRef(null);
  const navigate  = useNavigate();

  /* Auto-advance hero carousel */
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDir(1);
      setSlide(s => (s + 1) % HERO_SLIDES.length);
    }, 5500);
  };
  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setDir(idx > slide ? 1 : -1);
    setSlide(idx);
    startTimer();
  };
  const prev = () => goTo((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => goTo((slide + 1) % HERO_SLIDES.length);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (roomType)   params.set('type', roomType);
    if (priceRange) params.set('price', priceRange);
    navigate(`/rooms?${params.toString()}`);
  };

  /* Slide variants */
  const slideVariants = {
    enter:  (d) => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.4, 0, 0.2, 1] } },
    exit:   (d) => ({ opacity: 0, x: d > 0 ? -80 : 80, transition: { duration: 0.45 } }),
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">

      {/* ═══════════════════════ HERO CAROUSEL ═══════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ height: 'clamp(560px, 80vh, 760px)' }}>
        {/* Slides */}
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={slide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <img
              src={HERO_SLIDES[slide].bg}
              alt={HERO_SLIDES[slide].title}
              className="w-full h-full object-cover"
              loading={slide === 0 ? 'eager' : 'lazy'}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/50 to-slate-900/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-5 sm:px-10 lg:px-20 max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${slide}`}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15 } }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
              className="max-w-2xl"
            >
              {/* Slide tag */}
              <span className="inline-flex items-center gap-2 text-[11px] font-700 text-white/90 uppercase tracking-[0.25em] mb-5 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff385c] animate-pulse" />
                {HERO_SLIDES[slide].tag}
              </span>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-5 tracking-tight drop-shadow-xl whitespace-pre-line">
                {HERO_SLIDES[slide].title}
              </h1>

              {/* Sub */}
              <p className="text-base sm:text-lg text-white/80 font-medium mb-8 max-w-xl leading-relaxed">
                {HERO_SLIDES[slide].sub}
              </p>

              {/* Quick CTA */}
              <Link
                to="/rooms"
                className="btn-primary inline-flex gap-2 text-sm"
                style={{ borderRadius: 'var(--radius-pill)' }}
              >
                Khám Phá Ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrow controls */}
        <button
          onClick={prev}
          className="btn-icon absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="btn-icon absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-6 right-6 sm:right-10 z-20 text-white/60 text-xs font-semibold tracking-widest">
          {String(slide + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
        </div>
      </section>

      {/* ═══════════════════════ SEARCH BAR ═══════════════════════ */}
      <section className="relative z-30 -mt-10 px-4 sm:px-6 lg:px-10 pb-4">
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-[var(--hairline-gray)] dark:border-slate-700 flex flex-col md:flex-row gap-0 overflow-hidden"
        >
          {/* Location */}
          <div className="flex items-center gap-3 flex-1 px-5 py-4 border-b md:border-b-0 md:border-r border-[var(--hairline-gray)] dark:border-slate-700 hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-700/50 transition-colors">
            <MapPin className="w-5 h-5 text-[var(--rausch)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="block text-[11px] font-600 text-[var(--ash-gray)] uppercase tracking-wider mb-0.5">Địa điểm</span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tên đường, quận, huyện..."
                className="w-full bg-transparent border-none text-sm font-500 text-[var(--ink-black)] dark:text-white placeholder:text-[var(--stone-gray)] focus:outline-none"
              />
            </div>
          </div>

          {/* Room type */}
          <div className="flex items-center gap-3 flex-1 px-5 py-4 border-b md:border-b-0 md:border-r border-[var(--hairline-gray)] dark:border-slate-700 hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-700/50 transition-colors">
            <Home className="w-5 h-5 text-[var(--ash-gray)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="block text-[11px] font-600 text-[var(--ash-gray)] uppercase tracking-wider mb-0.5">Loại phòng</span>
              <select
                value={roomType}
                onChange={e => setRoomType(e.target.value)}
                className="w-full bg-transparent border-none text-sm font-500 text-[var(--ink-black)] dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="">Tất cả loại phòng</option>
                <option value="Phòng trọ">Phòng Trọ</option>
                <option value="Chung Cư Mini">Chung Cư Mini</option>
                <option value="KTX">Ký Túc Xá (Sleep Box)</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 flex-1 px-5 py-4 border-b md:border-b-0 md:border-r border-[var(--hairline-gray)] dark:border-slate-700 hover:bg-[var(--soft-cloud)] dark:hover:bg-slate-700/50 transition-colors">
            <Wallet className="w-5 h-5 text-[var(--ash-gray)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="block text-[11px] font-600 text-[var(--ash-gray)] uppercase tracking-wider mb-0.5">Mức giá</span>
              <select
                value={priceRange}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-transparent border-none text-sm font-500 text-[var(--ink-black)] dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="">Tất cả mức giá</option>
                <option value="u3m">Dưới 3 triệu</option>
                <option value="3-5m">3 – 5 triệu</option>
                <option value="a5m">Trên 5 triệu</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary m-3 rounded-xl px-8 shrink-0 text-sm"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Tìm Kiếm</span>
          </button>
        </motion.form>

        {/* Quick tags */}
        <div className="max-w-5xl mx-auto mt-3 flex flex-wrap gap-2 px-1">
          {['🔥 Gần FPT', '✨ Mới đăng', '⚡ Quận 1', '🏠 Còn trống'].map(tag => (
            <button
              key={tag}
              onClick={() => navigate('/rooms')}
              className="text-xs font-600 text-[var(--ash-gray)] dark:text-slate-400 bg-[var(--soft-cloud)] dark:bg-slate-800 px-3 py-1.5 rounded-full border border-[var(--hairline-gray)] dark:border-slate-700 hover:border-[var(--rausch)] hover:text-[var(--rausch)] transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ CATEGORIES ═══════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-10 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-xs font-700 text-[var(--rausch)] uppercase tracking-[0.22em] mb-3">
              Danh Mục
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[var(--ink-black)] dark:text-white tracking-tight mb-4">
              Tìm Không Gian Phù Hợp
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--ash-gray)] max-w-lg mx-auto font-500 text-base leading-relaxed">
              Chọn ngay loại phòng phù hợp với phong cách sống và ngân sách của bạn.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Home,
                label: 'Phòng Trọ Tiêu Chuẩn',
                desc: 'Phòng trọ giá tốt, phù hợp sinh viên và người lao động trẻ xa nhà.',
                cta: 'Xem phòng trọ',
                accent: '#ff385c',
                bg: 'from-rose-50 to-white',
                darkBg: 'dark:from-rose-950/30 dark:to-slate-900',
                filter: 'Phòng trọ',
              },
              {
                icon: Building2,
                label: 'Chung Cư Mini',
                desc: 'Căn hộ khép kín đầy đủ nội thất, tự do giờ giấc, bảo an camera 24/7.',
                cta: 'Xem chung cư',
                accent: '#ff385c',
                bg: 'from-pink-50 to-white',
                darkBg: 'dark:from-pink-950/20 dark:to-slate-900',
                filter: 'Chung Cư Mini',
                hot: true,
              },
              {
                icon: Shield,
                label: 'Ký Túc Xá Sleep Box',
                desc: 'Giường tầng rèm kéo cao cấp, máy lạnh 24h, phục vụ ăn uống tận nơi.',
                cta: 'Xem KTX',
                accent: '#ff385c',
                bg: 'from-orange-50 to-white',
                darkBg: 'dark:from-orange-950/20 dark:to-slate-900',
                filter: 'KTX',
              },
            ].map((cat, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Link
                  to={`/rooms?type=${encodeURIComponent(cat.filter)}`}
                  className={`group flex flex-col h-full bg-gradient-to-br ${cat.bg} ${cat.darkBg} rounded-[22px] p-8 border border-[var(--hairline-gray)] dark:border-slate-800 hover:border-[var(--rausch)]/40 hover:shadow-2xl hover:shadow-[var(--rausch)]/8 transition-all duration-300 relative overflow-hidden`}
                >
                  {cat.hot && (
                    <span className="absolute top-5 right-5 text-[10px] font-800 text-white bg-[var(--rausch)] px-2.5 py-1 rounded-full tracking-wider">
                      HOT
                    </span>
                  )}
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                    style={{ background: `${cat.accent}15`, color: cat.accent }}
                  >
                    <cat.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-800 text-[var(--ink-black)] dark:text-white mb-3">{cat.label}</h3>
                  <p className="text-sm text-[var(--ash-gray)] font-500 leading-relaxed mb-6 flex-1">{cat.desc}</p>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-700 group-hover:gap-3 transition-all"
                    style={{ color: cat.accent }}
                  >
                    {cat.cta} <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ WHY CHOOSE US ═══════════════════════ */}
      <section className="py-20 bg-[var(--soft-cloud)] dark:bg-slate-900 border-y border-[var(--hairline-gray)] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-xs font-700 text-[var(--rausch)] uppercase tracking-[0.22em] mb-3">
              Vì Sao Chọn Chúng Tôi
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[var(--ink-black)] dark:text-white tracking-tight">
              Trải Nghiệm Khác Biệt
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {FEATURES.map((ft, i) => (
              <motion.div
                key={i} variants={fadeUp}
                className="feature-icon-wrap flex flex-col items-center text-center group"
              >
                <div className="feature-icon mb-5">
                  <ft.icon className="w-6 h-6 text-[var(--ash-gray)] group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-base font-700 text-[var(--ink-black)] dark:text-white mb-2">{ft.label}</h4>
                <p className="text-sm text-[var(--ash-gray)] font-500 leading-relaxed max-w-[220px]">{ft.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ STATS BAND ═══════════════════════ */}
      <section className="py-12 bg-white dark:bg-slate-950 border-b border-[var(--hairline-gray)] dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '2,000+', lbl: 'Phòng Đã Đăng' },
            { num: '98%',    lbl: 'Hài Lòng' },
            { num: '500+',   lbl: 'Chủ Nhà Uy Tín' },
            { num: '24/7',   lbl: 'Hỗ Trợ Online' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="text-3xl font-900 text-[var(--ink-black)] dark:text-white mb-1 tracking-tight">{s.num}</div>
              <div className="text-sm text-[var(--ash-gray)] font-500">{s.lbl}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ CTA BANNER ═══════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-10 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="relative rounded-[28px] overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #ff385c 0%, #e00b41 50%, #92174d 100%)' }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-black/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-10 md:p-14">
              <div className="flex-1 text-center md:text-left">
                <p className="text-white/70 text-xs font-700 uppercase tracking-[0.2em] mb-3">Cho Chủ Nhà</p>
                <h2 className="text-3xl md:text-4xl font-900 text-white mb-4 tracking-tight leading-tight">
                  Bạn Có Nhà Trống<br className="hidden md:block" /> Cho Thuê?
                </h2>
                <p className="text-white/80 font-500 max-w-md leading-relaxed text-sm md:text-base">
                  Đăng tin miễn phí, quản lý thu tiền tự động — kết nối với hàng ngàn sinh viên đang tìm phòng mỗi ngày.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  to="/post-room"
                  className="inline-flex items-center gap-2 bg-white text-[var(--rausch)] font-800 px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all active:scale-95 text-sm"
                >
                  <Building2 className="w-5 h-5" />
                  Đăng Phòng Ngay
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Chatbot */}
      <AIChatbot type="user" />
    </div>
  );
}
