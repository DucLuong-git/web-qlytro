import { Link } from 'react-router-dom';
import { Search, MapPin, Shield, Star, Zap, ChevronRight, Home, Building2, Wallet } from 'lucide-react';
import AIChatbot from '../components/AIChatbot';
import { motion } from 'framer-motion';

const HomePage = () => {
  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex items-center justify-center min-h-[600px] lg:min-h-[700px]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-[2px]"></div>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="container relative z-10 mx-auto px-4 sm:px-6 w-full max-w-5xl text-center"
        >
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-xl">
            Tìm Phòng Trọ Nhanh Chóng, <br className="hidden md:block" /> <span className="text-indigo-400">Không Lo Về Giá</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto drop-shadow-md">
            Nền tảng quản lý & cho thuê phòng trọ uy tín, kết nối trực tiếp chủ nhà và người thuê với hàng ngàn phòng trống được cập nhật mỗi ngày.
          </motion.p>

          {/* Search Box */}
          <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-3xl shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative flex items-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-inner transition-all">
              <MapPin className="w-6 h-6 text-indigo-500 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Nhập tên đường, quận, huyện..." 
                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-medium placeholder-slate-400 ml-3 outline-none"
              />
            </div>
            <div className="flex-1 relative flex items-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all">
              <Home className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <select className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-medium ml-3 outline-none cursor-pointer">
                <option value="">Loại phòng (Tất cả)</option>
                <option value="tro">Phòng trọ</option>
                <option value="chungcu">Chung cư mini</option>
                <option value="ktx">Ký túc xá (Sleep Box)</option>
              </select>
            </div>
             <div className="flex-1 relative flex items-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all">
              <Wallet className="w-6 h-6 text-orange-500 flex-shrink-0" />
              <select className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-medium ml-3 outline-none cursor-pointer">
                <option value="">Mức giá</option>
                <option value="u3m">Dưới 3 triệu</option>
                <option value="3-5m">3 - 5 triệu</option>
                <option value="a5m">Trên 5 triệu</option>
              </select>
            </div>
            <Link 
              to="/rooms" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl md:rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/40 flex items-center justify-center whitespace-nowrap active:scale-95"
            >
              <Search className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Tìm kiếm</span>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-200">
            <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm cursor-default hover:bg-white/20 transition-colors">🔥 Gần đại học FPT</span>
            <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm cursor-default hover:bg-white/20 transition-colors">✨ Phòng mới chốt</span>
            <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm cursor-default hover:bg-white/20 transition-colors">⚡️ Chung cư Quận 1</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-800 -mt-10 rounded-t-[40px] relative z-20 border-t border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Danh Mục Nổi Bật</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">Chọn ngay cho mình một không gian sống phù hợp với túi tiền và phong cách sống.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeUp} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
               <Link to="/rooms" className="block outline-none bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 group cursor-pointer text-center relative z-20 transition-all h-full">
                 <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:-translate-y-4 group-hover:scale-110 transition-transform duration-300">
                   <Home className="w-12 h-12" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Phòng Trọ Tiêu Chuẩn</h3>
                 <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">Phòng trọ giá rẻ, tiết kiệm chi phí, phù hợp với tập thể sinh viên và người lao động xa quê.</p>
                 <span className="text-indigo-600 dark:text-indigo-400 font-bold inline-flex items-center group-hover:translate-x-2 transition-transform uppercase tracking-widest text-sm">
                   Xem Các Sản Phẩm <ChevronRight className="w-5 h-5 ml-1" />
                 </span>
               </Link>
            </motion.div>
            
            <motion.div variants={fadeUp} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
               <Link to="/rooms" className="block outline-none bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-10 border-[3px] border-emerald-500/20 dark:border-emerald-500/30 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/20 group cursor-pointer text-center relative overflow-hidden z-20 transition-all h-full">
                 <div className="absolute top-6 right-6 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full animate-bounce shadow-md">HOT</div>
                 <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:-translate-y-4 group-hover:scale-110 transition-transform duration-300">
                   <Building2 className="w-12 h-12" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Chung Cư Mini</h3>
                 <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">Căn hộ khép kín đầy đủ nội thất, tự do giờ giấc, có lực lượng bảo an giữ camera 24/7.</p>
                 <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center group-hover:translate-x-2 transition-transform uppercase tracking-widest text-sm">
                   Dành Cho Tuổi Trẻ <ChevronRight className="w-5 h-5 ml-1" />
                 </span>
               </Link>
            </motion.div>

             <motion.div variants={fadeUp} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
               <Link to="/rooms" className="block outline-none bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 group cursor-pointer text-center relative z-20 transition-all h-full">
                 <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:-translate-y-4 group-hover:scale-110 transition-transform duration-300">
                   <Shield className="w-12 h-12" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Phòng Ký Túc Xá</h3>
                 <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">Hệ thống giường tầng rèm kéo cao cấp (Sleep box), phòng máy lạnh suốt 24h & Có phục vụ ăn uống.</p>
                 <span className="text-orange-600 dark:text-orange-400 font-bold inline-flex items-center group-hover:translate-x-2 transition-transform uppercase tracking-widest text-sm">
                   Trải Nghiệm An Tâm <ChevronRight className="w-5 h-5 ml-1" />
                 </span>
               </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="container mx-auto px-4 sm:px-6 max-w-7xl text-center"
        >
           <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-20 tracking-tight">Vì Sao Chọn FPL Web?</h2>
           <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             variants={staggerContainer}
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
           >
              {[
                { icon: Shield, title: 'Bảo Đảm An Toàn', desc: '100% tài sản và thông tin đã được thẩm duyệt.' },
                { icon: Zap, title: 'Cập Nhật Nhanh Chóng', desc: 'Dữ liệu được làm mới liên tục với vô vàn lựa chọn.' },
                { icon: Star, title: 'Tìm Kiếm Dễ Dàng', desc: 'Công cụ AI hỗ trợ bộ lọc để cá nhân hoá sở thích.' },
                { icon: Wallet, title: 'Thanh Toán Ngân Hàng', desc: 'Ký hợp đồng và thanh toán VNPay Online trực tiếp.' }
              ].map((ft, idx) => (
                <motion.div key={idx} variants={fadeUp} className="flex flex-col items-center group">
                   <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] group-hover:shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 border border-slate-100 dark:border-slate-700 transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110">
                      <ft.icon className="w-10 h-10" />
                   </div>
                   <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{ft.title}</h4>
                   <p className="text-slate-500 dark:text-slate-400 max-w-[220px] font-medium leading-relaxed">{ft.desc}</p>
                </motion.div>
              ))}
           </motion.div>
        </motion.div>
      </section>

      {/* Footer Call to Action */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center rounded-[3rem] mx-4 sm:mx-10 mb-10 shadow-2xl overflow-hidden relative border-4 border-indigo-400/20"
      >
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"
          />
          <motion.div 
             animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
             transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
             className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight drop-shadow-lg">Bạn Có Nhà Trống Cho Thuê?</h2>
          <p className="text-indigo-100 text-xl font-medium mb-12 opacity-90 drop-shadow-sm leading-relaxed max-w-3xl mx-auto">Vươn ra biển lớn. Bắt đầu phân phối sản phẩm lưu trú của mình đến tay hàng triệu sinh viên trên toàn quốc với App Quản Lý Thu Tiền tự động miễn phí!</p>
          <div className="flex justify-center">
            <Link to="/post-room" className="inline-flex py-5 px-10 rounded-full bg-white text-indigo-700 font-extrabold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 transition-all shadow-xl active:scale-95 leading-none items-center">
               <Building2 className="w-6 h-6 mr-3" /> Đăng Ký Quản Trị Tổ Chức FPL Ngay
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Floating AI Chatbot cho User */}
      <AIChatbot type="user" />
    </div>
  );
};

export default HomePage;
