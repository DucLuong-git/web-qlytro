import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, Bookmark, MapPin, Filter, Home, Building2, Shield, Star, Zap, TrendingUp } from 'lucide-react';
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
  { label: 'Tất Cả', icon: Home, color: 'from-indigo-500 to-violet-600', filter: '' },
  { label: 'Chung Cư', icon: Building2, color: 'from-emerald-500 to-teal-600', filter: 'Chung Cư Mini' },
  { label: 'Phòng Trọ', icon: Home, color: 'from-orange-500 to-rose-500', filter: 'Phòng trọ' },
  { label: 'KTX', icon: Shield, color: 'from-blue-500 to-cyan-600', filter: 'KTX' },
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">

      {/* ─── HERO SWIPER: full-width, no container constraint ─── */}
      <div className="relative w-full" style={{ height: '480px' }}>
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        >
          {HERO_SLIDES.map((slide, i) => (
            <SwiperSlide key={i} style={{ width: '100%', height: '100%' }}>
              <div className="relative w-full h-full">
                {/* Background image */}
                <img
                  src={slide.bg}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-5xl">
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                  >
                    <span className="inline-flex items-center gap-2 text-xs font-black text-indigo-300 uppercase tracking-[0.3em] mb-4 bg-indigo-900/50 px-4 py-2 rounded-full border border-indigo-700/50 backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      {i + 1}/{HERO_SLIDES.length} · Đức Lương Home
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight drop-shadow-2xl">
                      {slide.title}
                    </h1>
                    <p className="text-slate-300 text-base sm:text-lg font-medium mb-8 max-w-xl">
                      {slide.sub}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/20">
                        <Zap className="w-4 h-4 text-yellow-400" /> {available} phòng đang trống
                      </span>
                      <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/20">
                        <TrendingUp className="w-4 h-4 text-emerald-400" /> {rooms.length}+ căn hộ
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ─── SEARCH BAR: below hero, full-width background ─── */}
      <div className="bg-white dark:bg-slate-800 shadow-xl border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo tên phòng, quận, địa chỉ..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-400 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
                className="pl-11 pr-8 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-400 cursor-pointer appearance-none w-full md:w-auto"
              >
                <option value="all">Tất cả giá</option>
                <option value="u300">Dưới $300</option>
                <option value="300-600">$300 – $600</option>
                <option value="a600">Trên $600</option>
              </select>
            </div>
            <Link
              to="/rooms"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Search className="w-4 h-4" /> Tìm Ngay
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">

        {/* ─── CATEGORY SWIPER ─── */}
        <div className="mb-10">
          <Swiper spaceBetween={12} slidesPerView="auto" freeMode className="w-full pb-4">
            {CATEGORIES.map(cat => (
              <SwiperSlide key={cat.label} style={{ width: 'auto' }}>
                <motion.button
                  whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat.filter)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap border-2 shadow-sm
                    ${activeCategory === cat.filter
                      ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg`
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
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
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {filtered.length} <span className="text-indigo-600 dark:text-indigo-400">phòng</span> phù hợp
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">Cập nhật mới nhất hôm nay</p>
          </div>
          <div className="flex gap-2">
            {['grid', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`p-2.5 rounded-xl border-2 transition-all ${view === v ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300'}`}
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
                <button onClick={() => { setSearchTerm(''); setPriceFilter('all'); setActiveCategory(''); }} className="mt-6 bg-indigo-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-500/30 hover:-translate-y-0.5">
                  Xóa Bộ Lọc
                </button>
              </motion.div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((room, i) => (
                  <motion.div key={room.id} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                    <Link to={`/rooms/${room.id}`}
                      className="group block bg-white dark:bg-slate-800 rounded-[1.8rem] overflow-hidden border-2 border-slate-100 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 h-full"
                    >
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden">
                        <img src={room.image || getImage(room.id)} alt={room.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/5" />

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide shadow-lg backdrop-blur-sm border
                            ${room.status === 'Available'
                              ? 'bg-emerald-500/90 text-white border-emerald-400'
                              : 'bg-orange-500/90 text-white border-orange-400'
                            }`}>
                            {room.status === 'Available' ? '✓ Phòng Trống' : '◷ Đang Thuê'}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          <button onClick={e => { e.preventDefault(); toggle(setLikes, likes, room.id); }}
                            className={`p-2.5 rounded-xl backdrop-blur-md transition-all shadow-md hover:scale-110
                              ${likes.includes(room.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white/20 text-white hover:bg-white hover:text-red-500'}`}
                          >
                            <Heart className={`w-4 h-4 ${likes.includes(room.id) ? 'fill-white' : ''}`} />
                          </button>
                          <button onClick={e => { e.preventDefault(); toggle(setBookmarks, bookmarks, room.id); }}
                            className={`p-2.5 rounded-xl backdrop-blur-md transition-all shadow-md hover:scale-110
                              ${bookmarks.includes(room.id)
                                ? 'bg-indigo-500 text-white'
                                : 'bg-white/20 text-white hover:bg-white hover:text-indigo-600'}`}
                          >
                            <Bookmark className={`w-4 h-4 ${bookmarks.includes(room.id) ? 'fill-white' : ''}`} />
                          </button>
                        </div>

                        {/* Type tag */}
                        {room.type && (
                          <div className="absolute bottom-3 right-3">
                            <span className="text-[10px] font-black text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg uppercase tracking-widest border border-white/20">{room.type}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{room.name}</h3>
                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs mb-4 font-medium">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-500 flex-shrink-0" />
                          <span className="truncate">{room.district || 'Khu vực trung tâm'}</span>
                        </div>

                        {/* Amenities mini tags */}
                        {room.amenities?.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mb-4">
                            {room.amenities.slice(0, 3).map(a => (
                              <span key={a} className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-800">{a}</span>
                            ))}
                            {room.amenities.length > 3 && <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">+{room.amenities.length - 3}</span>}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                          <div>
                            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formatPrice(room.price)}</span>
                            <span className="text-xs text-slate-400 font-medium ml-1">/tháng</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">4.{(parseInt(room.id) || 5) % 10}</span>
                          </div>
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
                      className="group flex bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5"
                    >
                      <div className="relative w-48 md:w-64 flex-shrink-0 overflow-hidden">
                        <img src={room.image || getImage(room.id)} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent group-hover:from-indigo-900/20 transition-all" />
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-black shadow-md
                          ${room.status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                          {room.status === 'Available' ? 'Trống' : 'Thuê'}
                        </span>
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 flex-1 mr-4">{room.name}</h3>
                            <div className="flex gap-1.5">
                              <button onClick={e => { e.preventDefault(); toggle(setLikes, likes, room.id); }} className={`p-2 rounded-xl transition-all ${likes.includes(room.id) ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500'}`}>
                                <Heart className={`w-4 h-4 ${likes.includes(room.id) ? 'fill-white' : ''}`} />
                              </button>
                              <button onClick={e => { e.preventDefault(); toggle(setBookmarks, bookmarks, room.id); }} className={`p-2 rounded-xl transition-all ${bookmarks.includes(room.id) ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-indigo-500'}`}>
                                <Bookmark className={`w-4 h-4 ${bookmarks.includes(room.id) ? 'fill-white' : ''}`} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-3 font-medium">
                            <MapPin className="w-4 h-4 mr-1.5 text-indigo-500" /> {room.district} {room.address && `· ${room.address}`}
                          </div>
                          {room.amenities?.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {room.amenities.slice(0, 5).map(a => (
                                <span key={a} className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-xl border border-indigo-100 dark:border-indigo-800">{a}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                          <div>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatPrice(room.price)}</span>
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
