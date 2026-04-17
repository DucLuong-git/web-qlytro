import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, BookmarkPlus, MapPin, ArrowLeft, Send, CheckCircle2, Home as HomeIcon } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('bookmarks')) || []);
  const [likes, setLikes] = useState(() => JSON.parse(localStorage.getItem('likes')) || []);
  const [comments, setComments] = useState(() => JSON.parse(localStorage.getItem(`comments_${id}`)) || []);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchRoom();
  }, [id]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('likes', JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    localStorage.setItem(`comments_${id}`, JSON.stringify(comments));
  }, [comments, id]);

  const fetchRoom = async () => {
    try {
      const { data } = await api.get(`/rooms/${id}`);
      setRoom(data);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin phòng:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (roomId) => {
    const imageIds = ['1522708323590-d24dbb6b0267', '1502672260266-1c1b6612ce56', '1497362943212-0fbc329a2442', '1560448204610-111e13e4b478', '1484154218962-a13f7ea07cb1'];
    const idx = (Number(roomId) || 1) % imageIds.length;
    return `https://images.unsplash.com/photo-${imageIds[idx]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(room.id)) {
      setBookmarks(bookmarks.filter(bId => bId !== room.id));
    } else {
      setBookmarks([...bookmarks, room.id]);
    }
  };

  const toggleLike = () => {
    if (likes.includes(room.id)) {
      setLikes(likes.filter(lId => lId !== room.id));
    } else {
      setLikes([...likes, room.id]);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const commentObj = {
      id: Date.now().toString(),
      text: newComment,
      author: user?.name || 'Người dùng ẩn danh',
      date: new Date().toLocaleDateString('vi-VN'),
    };
    
    setComments([commentObj, ...comments]);
    setNewComment('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 w-full flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
        <div className="text-slate-500 dark:text-slate-400 font-bold">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-32 flex flex-col items-center">
        <HomeIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Không tìm thấy phòng tương ứng</h2>
        <button onClick={() => navigate('/rooms')} className="mt-4 text-indigo-600 hover:text-indigo-800 font-bold">Trở Lại Dan Mục</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 w-full animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6 font-semibold bg-white dark:bg-slate-800 px-5 py-2.5 rounded-full shadow-sm w-fit border border-slate-100 dark:border-slate-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay Trở Về
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/60 transition-colors">
        <div className="relative h-64 sm:h-80 md:h-[450px] w-full group">
          <img 
            src={getImageUrl(room.id)} 
            alt={room.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30"></div>
          
          <div className="absolute top-6 right-6 flex gap-3">
            <button 
              onClick={toggleLike}
              className="p-3.5 rounded-full bg-white/20 hover:bg-white/90 backdrop-blur-md shadow-lg text-white hover:text-red-500 transition-all hover:scale-110 active:scale-95"
            >
              <Heart className={`w-6 h-6 ${likes.includes(room.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button 
              onClick={toggleBookmark}
              className="p-3.5 rounded-full bg-white/20 hover:bg-white/90 backdrop-blur-md shadow-lg text-white hover:text-primary-600 transition-all hover:scale-110 active:scale-95"
            >
              <BookmarkPlus className={`w-6 h-6 ${bookmarks.includes(room.id) ? 'fill-primary-600 text-primary-600' : ''}`} />
            </button>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 lg:hidden">
             <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 truncate drop-shadow-md">{room.name}</h1>
             <div className="flex gap-2">
                 <span className={`px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-sm backdrop-blur-sm ${room.status === 'Available' ? 'bg-emerald-500/90 border border-emerald-400' : 'bg-orange-500/90 border border-orange-400'}`}>
                  {room.status === 'Available' ? 'Phòng Trống' : 'Đang Thuê'}
                 </span>
             </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="hidden lg:flex flex-col md:flex-row justify-between items-start md:items-start gap-6 mb-8 border-b border-slate-100 dark:border-slate-700 pb-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase text-white shadow-sm ${room.status === 'Available' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                  {room.status === 'Available' ? 'Phòng Trống (Available)' : 'Đang Thuê (Occupied)'}
                </span>
                <span className="flex items-center text-slate-600 dark:text-slate-300 text-xs font-bold bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-600">
                  <MapPin className="w-4 h-4 mr-1.5 text-primary-500" /> {room.district || 'Hồ Chí Minh'}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{room.name}</h1>
            </div>
            
            <div className="bg-gradient-to-b from-primary-50 to-white dark:from-primary-900/30 dark:to-slate-800 px-10 py-6 rounded-3xl text-center shadow-sm dark:shadow-none border border-primary-100 dark:border-primary-800/50">
              <div className="text-sm font-bold text-primary-500 dark:text-primary-400 uppercase tracking-widest mb-2 border-b border-primary-100 dark:border-primary-800/50 pb-2">Giá Thuê Trọn Gói</div>
              <div className="text-5xl font-black text-primary-700 dark:text-primary-300 drop-shadow-sm">${room.price}</div>
              <div className="text-xs text-primary-400 dark:text-primary-500 font-bold mt-2">/ tháng (Chưa Điện Nước)</div>
            </div>
          </div>

          {/* Mobile Rent Box */}
          <div className="lg:hidden bg-primary-50 dark:bg-primary-900/30 px-6 py-5 rounded-3xl flex justify-between items-center mb-8 border border-primary-100 dark:border-primary-800/50 shadow-inner">
             <div className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Giá Trọn Gói</div>
             <div className="text-4xl font-black text-primary-700 dark:text-primary-300">${room.price}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              
              {/* Giới thiệu */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5 flex items-center">
                  <span className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 p-2 rounded-xl mr-3">
                     <HomeIcon className="w-5 h-5" />
                  </span>
                  Mô Tả Nền & Tiện Ích
                </h2>
                <div className="text-slate-600 dark:text-slate-300 font-medium text-lg mb-8 leading-loose bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                  {room.description || "Đây là căn phòng / căn hộ hiện đại với ánh sáng vô cùng tốt. Nằm liền kề các siêu thị, khu vực trung tâm kết nối trực tiếp đến các trung tâm thương mại. Cơ sở vật chất đảm bảo tiêu chuẩn chống cháy nổ và cách âm tuyệt đối. Nếu có nhu cầu thêm có thể liên hệ ngay chủ nhà."}
                </div>
                
                <h3 className="font-bold text-slate-900 dark:text-white mb-5 text-lg flex items-center">Trang Bị Nổi Bật</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(room.amenities || ['Máy Lạnh', 'WiFi Miễn Phí', 'Nội Thất Đầy Đủ', 'Máy Giặt', 'Có Ban Công', 'Chỗ Để Xe']).map(feature => (
                    <div key={feature} className="flex items-center text-slate-700 dark:text-slate-300 font-bold bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 py-4 px-4 rounded-2xl shadow-sm transition-all hover:scale-105 hover:border-indigo-300 dark:hover:border-indigo-500">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2.5 flex-shrink-0" />
                      <span className="truncate text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Bản đồ vị trí */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5 flex items-center">
                  <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl mr-3">
                     <MapPin className="w-5 h-5" />
                  </span>
                  Bản Đồ Định Vị (Google Maps)
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium mb-4 flex items-center text-sm">
                   Toạ độ: <span className="font-bold underline ml-1">{room.address || room.district || "Thành Phố Hồ Chí Minh"}</span>
                </p>
                <div className="rounded-[2rem] overflow-hidden shadow-xl border-4 border-white dark:border-slate-700 bg-slate-100 relative h-[380px]">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(room.address || room.district || "Hồ Chí Minh")}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                    frameBorder="0" 
                    scrolling="no" 
                    className="absolute inset-0 w-full h-full brightness-95 contrast-125 dark:invert-[.95] dark:hue-rotate-180 transition-all duration-500"
                  ></iframe>
                </div>
              </section>

              {/* Comment Section */}
              <section className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 shadow-inner">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Thảo Luận Phòng Thử <span className="text-primary-500 font-black text-xl ml-2">({comments.length})</span></h3>
                
                <form onSubmit={handleAddComment} className="mb-8 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Bình luận hoặc hỏi đáp về phòng trọ này..."
                    className="w-full pl-6 pr-16 py-5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm transition-all outline-none"
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-all shadow-md active:scale-95"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>

                <div className="space-y-5">
                  {comments.length === 0 ? (
                    <div className="text-center bg-white dark:bg-slate-800 py-12 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 border-dashed">
                      <p className="text-slate-500 dark:text-slate-400 font-bold mb-2">Chưa có bình luận nào.</p>
                      <p className="text-sm font-medium text-slate-400">Hãy là người đầu tiên đặt câu hỏi cho Chủ trọ!</p>
                    </div>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="flex gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white font-bold tracking-wide flex-shrink-0 shadow-md transform group-hover:-rotate-12 transition-transform border-2 border-white dark:border-slate-600">
                          {comment.author.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700 flex-1 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-900 dark:text-white">{comment.author}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">{comment.date}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 font-medium text-sm leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl lg:sticky lg:top-28">
                <h3 className="font-bold text-2xl mb-8 text-slate-900 dark:text-white text-center">Xúc Tiến Thuê Phỏng</h3>
                
                <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all duration-300 mb-4 text-lg">
                  Đặt Lịch Xem Phòng Ngay
                </button>
                <button className="w-full bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-4 px-4 rounded-2xl shadow-sm transition-all duration-300 mb-6 text-base">
                  Liên Hệ Cho Hỗ Trợ SMS
                </button>
                
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                   <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3" /> Mức giá không chiết khấu ẩn
                   </div>
                   <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3" /> Được hoàn cọc theo hợp đồng
                   </div>
                   <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3" /> Uỷ thác và hỗ trợ Admin FPL
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
