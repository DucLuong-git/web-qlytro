import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, Bookmark, MapPin, Filter, Home, Building2, Shield, Star, Zap, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_SLIDES = [
  { bg: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=90', title: 'Phòng Cao Cấp', sub: 'Chung cư mini đầy đủ nội thất – View đẹp, an toàn' },
  { bg: 'https://images.unsplash.com/photo-1502672260266-1c1b6612ce56?w=1600&q=90', title: 'Giá Siêu Tốt', sub: 'Phòng trọ tiết kiệm cho sinh viên & người lao động' },
  { bg: 'https://images.unsplash.com/photo-1484154218962-a13f7ea07cb1?w=1600&q=90', title: 'An Toàn 24/7', sub: 'Camera, bảo vệ chuyên nghiệp & cộng đồng văn minh' },
];

const CATEGORIES = [
  { label: 'Tất Cả',    icon: Home,      filter: '' },
  { label: 'Chung Cư',  icon: Building2, filter: 'Chung Cư Mini' },
  { label: 'Phòng Trọ', icon: Home,      filter: 'Phòng trọ' },
  { label: 'KTX',       icon: Shield,    filter: 'KTX' },
];

const ROOM_IMAGES = [
  '1522708323590-d24dbb6b0267', '1502672260266-1c1b6612ce56',
  '1497362943212-0fbc329a2442', '1560448204610-111e13e4b478',
  '1484154218962-a13f7ea07cb1', '1493809842364-78817add7ffb',
  '1512918728672-1a02b891d3e2', '1630699144867-37acec751a9d',
];

const getImage = (id) => {
  const idx = Math.abs((parseInt(id, 36) || parseInt(id) || 1)) % ROOM_IMAGES.length;
  return `https://images.unsplash.com/photo-${ROOM_IMAGES[idx]}?w=600&q=80`;
};

const formatPrice = (price) => {
  if (!price) return 'Liên hệ';
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}tr`;
  if (price >= 1000) return `${(price / 1000).toFixed(0)}k`;
  return `${price}$`;
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } })
};

export default function RoomListPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('');
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('bookmarks') || '[]'));
  const [likes, setLikes] = useState(() => JSON.parse(localStorage.getItem('likes') || '[]'));
  const [view, setView] = useState('grid');
  const swiperRef = useRef(null);

  useEffect(() => { fetchRooms(); }, []);
  useEffect(() => { localStorage.setItem('bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('likes', JSON.stringify(likes)); }, [likes]);

  const fetchRooms = async () => {
    setLoading(true);
    try { const { data } = await api.get('/rooms'); setRooms(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggle = (setState, arr, id) => {
    setState(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  };

  const filtered = rooms.filter(r => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || r.name?.toLowerCase().includes(s) || r.district?.toLowerCase().includes(s) || r.address?.toLowerCase().includes(s);
    const matchPrice = priceFilter === 'all' ? true
      : priceFilter === 'u300' ? r.price < 300
      : priceFilter === '300-600' ? r.price >= 300 && r.price <= 600
      : r.price > 600;
    const matchCat = !activeCategory || r.type === activeCategory || r.district?.includes(activeCategory);
    return matchSearch && matchPrice && matchCat;
  });

  const available = rooms.filter(r => r.status === 'Available').length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">

      {/* ─── HERO SWIPER ─── */}
      <div className="relative w-full overflow-hidden" style={{ height: '480px' }}>
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          onSwiper={swiper => { swiperRef.current = swiper; }}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        >
          {HERO_SLIDES.map((slide, i) => (
            <SwiperSlide key={i} style={{ width: '100%', height: '100%' }}>
              <div className="relative w-full h-full bg-slate-900">
                <img
                  src={slide.bg}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-5xl">
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                  >
                    <span className="inline-flex items-center gap-2 text-xs font-black text-white/70 uppercase tracking-[0.25em] mb-4 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--rausch)] animate-pulse" />
                      {i + 1}/{HERO_SLIDES.length} · Đức Lương Home
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight drop-shadow-2xl">
                      {slide.title}
                    </h1>
                    <p className="text-white/75 text-base sm:text-lg font-medium mb-8 max-w-xl">
                      {slide.sub}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                        <Zap className="w-4 h-4" style={{ color: 'var(--rausch)' }} /> {available} phòng đang trống
                      </span>
                      <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                        <TrendingUp className="w-4 h-4" style={{ color: 'var(--rausch)' }} /> {rooms.length}+ căn hộ
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ─── Custom Nav Buttons ─── */}
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Previous slide"
          className="group absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20
            w-11 h-11 rounded-full flex items-center justify-center
            bg-white/15 hover:bg-white/90
            border border-white/30 hover:border-white
            backdrop-blur-md
            text-white hover:text-[var(--ink-black)]
            shadow-lg hover:shadow-xl
            transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={2.5} />
        </button>

        <button
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Next slide"
          className="group absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20
            w-11 h-11 rounded-full flex items-center justify-center
            bg-white/15 hover:bg-white/90
            border border-white/30 hover:border-white
            backdrop-blur-md
            text-white hover:text-[var(--ink-black)]
            shadow-lg hover:shadow-xl
            transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
        </button>
      </div>

      {/* ─── SEARCH BAR ─── */}
      <div className="bg-white dark:bg-slate-900 border-b border-[var(--hairline-gray)] dark:border-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--stone-gray)] pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo tên phòng, quận, địa chỉ..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-input pl-11"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--stone-gray)] pointer-events-none" />
              <select
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
                className="form-input pl-11 pr-8 cursor-pointer appearance-none w-full md:w-44"
              >
                <option value="all">Tất cả giá</option>
                <option value="u300">Dưới 3 triệu</option>
                <option value="300-600">3 – 5 triệu</option>
                <option value="a600">Trên 5 triệu</option>
              </select>
            </div>
            <button
              onClick={() => {}}
              className="btn-primary rounded-xl px-7 text-sm whitespace-nowrap"
            >
              <Search className="w-4 h-4" /> Tìm Ngay
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">

        {/* ─── CATEGORY SWIPER ─── */}
        <div className="mb-10">
          <Swiper spaceBetween={10} slidesPerView="auto" freeMode className="w-full pb-2">
            {CATEGORIES.map(cat => (
              <SwiperSlide key={cat.label} style={{ width: 'auto' }}>
                <motion.button
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat.filter)}
                  className={`cat-tab ${activeCategory === cat.filter ? 'active' : ''}`}
                >
                  <cat.icon className="w-4 h-4" /> {cat.label}
                </motion.button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* ─── HEADER BAR ─── */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-800 text-[var(--ink-black)] dark:text-white">
              {filtered.length} <span style={{ color: 'var(--rausch)' }}>phòng</span> phù hợp
            </h2>
            <p className="text-[var(--ash-gray)] text-sm font-500 mt-0.5">Cập nhật mới nhất hôm nay</p>
          </div>
          <div className="flex gap-2">
            {['grid', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`p-2.5 rounded-xl border transition-all ${
                  view === v
                    ? 'border-[var(--rausch)] text-[var(--rausch)] bg-red-50 dark:bg-red-950/20'
                    : 'border-[var(--hairline-gray)] dark:border-slate-700 text-[var(--ash-gray)] bg-white dark:bg-slate-900 hover:border-[var(--ash-gray)]'
                }`}
              >
                {v === 'grid'
                  ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3A1.5 1.5 0 0115 10.5v3A1.5 1.5 0 0113.5 15h-3A1.5 1.5 0 019 13.5v-3z"/></svg>
                  : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/></svg>
                }
              </button>
            ))}
          </div>
        </div>

        {/* ─── ROOM GRID / LIST ─── */}
        {loading ? (
          <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden animate-pulse border border-slate-100 dark:border-slate-700">
                <div className="h-52 bg-slate-200 dark:bg-slate-700" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-28 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400 shadow-inner">
                  <Search className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Không tìm thấy phòng</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">Thử tìm kiếm với từ khoá khác hoặc thay đổi bộ lọc giá để xem thêm kết quả.</p>
                <button onClick={() => { setSearchTerm(''); setPriceFilter('all'); setActiveCategory(''); }} className="mt-6 bg-emerald-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-500/30 hover:-translate-y-0.5">
                  Xóa Bộ Lọc
                </button>
              </motion.div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((room, i) => (
                  <motion.div key={room.id} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                    <Link to={`/rooms/${room.id}`}
                      className="group listing-card flex flex-col bg-white dark:bg-slate-900 border border-[var(--hairline-gray)] dark:border-slate-800 hover:border-[var(--stone-gray)] dark:hover:border-slate-600 card-lift h-full"
                    >
                      {/* Image */}
                      <div className="card-image relative">
                        <img src={room.image || getImage(room.id)} alt={room.name} loading="lazy" />

                        {/* Status badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`badge ${room.status === 'Available' ? 'badge-available' : 'badge-rented'}`}>
                            {room.status === 'Available' ? '● Còn trống' : '● Đã thuê'}
                          </span>
                        </div>

                        {/* Heart */}
                        <button
                          onClick={e => { e.preventDefault(); toggle(setLikes, likes, room.id); }}
                          className={`btn-icon absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                            likes.includes(room.id) ? '!bg-[var(--rausch)] !text-white border-[var(--rausch)]' : ''
                          }`}
                          style={{ width: 32, height: 32 }}
                        >
                          <Heart className={`w-3.5 h-3.5 ${likes.includes(room.id) ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-600 text-base text-[var(--ink-black)] dark:text-white mb-1 line-clamp-1 group-hover:text-[var(--rausch)] transition-colors">{room.name}</h3>
                        <div className="flex items-center text-[var(--ash-gray)] text-xs mb-3 font-500 gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{room.district || 'Khu vực trung tâm'}</span>
                        </div>

                        {room.amenities?.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mb-3">
                            {room.amenities.slice(0, 2).map(a => (
                              <span key={a} className="text-[10px] font-500 bg-[var(--soft-cloud)] dark:bg-slate-800 text-[var(--ash-gray)] px-2 py-1 rounded-[4px]">{a}</span>
                            ))}
                            {room.amenities.length > 2 && <span className="text-[10px] font-500 text-[var(--mute-gray)] bg-[var(--soft-cloud)] dark:bg-slate-800 px-2 py-1 rounded-[4px]">+{room.amenities.length - 2}</span>}
                          </div>
                        )}

                        <div className="flex items-end justify-between pt-3 border-t border-[var(--hairline-gray)] dark:border-slate-800 mt-auto">
                          <div>
                            <span className="block text-[10px] font-600 text-[var(--mute-gray)] mb-0.5 uppercase tracking-wider">Giá thuê</span>
                            <span className="text-base font-700 text-[var(--ink-black)] dark:text-white">{formatPrice(room.price)}<span className="text-xs font-500 text-[var(--ash-gray)] ml-1">/tháng</span></span>
                          </div>
                          <span className="text-xs font-600 px-3 py-1.5 rounded-[8px] border border-[var(--hairline-gray)] text-[var(--ash-gray)] hover:border-[var(--rausch)] hover:text-[var(--rausch)] transition-colors">Xem ngay</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              // LIST VIEW
              <div className="space-y-4">
                {filtered.map((room, i) => (
                  <motion.div key={room.id} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                    <Link to={`/rooms/${room.id}`}
                      className="group flex bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-0.5"
                    >
                      <div className="relative w-48 md:w-64 flex-shrink-0 overflow-hidden">
                        <img src={room.image || getImage(room.id)} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent group-hover:from-emerald-900/20 transition-all" />
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-black shadow-md
                          ${room.status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                          {room.status === 'Available' ? 'Trống' : 'Thuê'}
                        </span>
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 flex-1 mr-4">{room.name}</h3>
                            <div className="flex gap-1.5">
                              <button onClick={e => { e.preventDefault(); toggle(setLikes, likes, room.id); }} className={`p-2 rounded-xl transition-all ${likes.includes(room.id) ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500'}`}>
                                <Heart className={`w-4 h-4 ${likes.includes(room.id) ? 'fill-white' : ''}`} />
                              </button>
                              <button onClick={e => { e.preventDefault(); toggle(setBookmarks, bookmarks, room.id); }} className={`p-2 rounded-xl transition-all ${bookmarks.includes(room.id) ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-emerald-500'}`}>
                                <Bookmark className={`w-4 h-4 ${bookmarks.includes(room.id) ? 'fill-white' : ''}`} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-3 font-medium">
                            <MapPin className="w-4 h-4 mr-1.5 text-emerald-500" /> {room.district} {room.address && `· ${room.address}`}
                          </div>
                          {room.amenities?.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {room.amenities.slice(0, 5).map(a => (
                                <span key={a} className="text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl border border-emerald-100 dark:border-emerald-800">{a}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                          <div>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(room.price)}</span>
                            <span className="text-sm text-slate-400 ml-1">/tháng</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <span>{room.area || 45} m²</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="font-bold">4.{(parseInt(room.id) || 5) % 10}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
