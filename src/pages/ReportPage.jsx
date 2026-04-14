import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Send, CheckCircle2 } from 'lucide-react';

const ReportPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center animate-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-700">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Ghi Nhận Thành Công!</h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg mb-8">
            Ban Quản Trị đã nhận được báo cáo vi phạm của bạn. Đội ngũ kiểm soát viên sẽ điều tra bài đăng này và cập nhật email phản hồi đến bạn trong thời gian sớm nhất.
          </p>
          <Link to="/" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-md active:scale-95">
            Quay Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-700/60">
        
        <div className="bg-rose-50 dark:bg-rose-900/20 p-8 sm:p-10 border-b border-rose-100 dark:border-rose-900/50 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 dark:bg-rose-800/50 text-rose-500 rounded-2xl mb-5 shadow-sm transform -rotate-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-rose-700 dark:text-rose-400 mb-2">Báo Cáo Vi Phạm Hệ Thống</h1>
          <p className="text-rose-600 dark:text-rose-300 font-medium">Báo cáo để duy trì một cộng đồng thuê lưu trú lành mạnh!</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">URL Hoặc Tên Phòng Vi Phạm *</label>
            <input 
              required
              type="text" 
              placeholder="Nhập đường link phòng hoặc mã phòng" 
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-none transition-all text-slate-800 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Loại Vi Phạm Của Chủ Thể *</label>
            <select required className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-none transition-all text-slate-800 dark:text-white font-medium cursor-pointer appearance-none">
              <option value="">-- Xin Hãy Chọn Phân Loại Lỗi --</option>
              <option value="scam">Tín dụng gian lận, lừa đảo chiếm cọc</option>
              <option value="fake">Hình ảnh trên Website không giống thực tế</option>
              <option value="toxic">Chủ nhà có hành vi chửi bới, phân biệt đối xử</option>
              <option value="other">Báo cáo các hành vi vi phạm khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Vui Lòng Mô Tả Hành Vi Sai Trái Chi Tiết</label>
            <textarea 
              rows="4" 
              required
              placeholder="VD: Lúc tôi đến xem phòng ông ấy bắt đóng 500k lệ phí coi mà trong đăng tin không ghi rõ..." 
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-none transition-all text-slate-800 dark:text-white font-medium resize-none"
            ></textarea>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full justify-center bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-rose-500/30 flex items-center active:scale-95 disabled:opacity-70"
            >
              {submitting ? (
                 <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div> Đang gửi đi...</>
              ) : (
                <><Send className="w-5 h-5 mr-3" /> Gửi Báo Cáo Bảo Mật</>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ReportPage;
