import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, HelpCircle, ArrowLeft } from 'lucide-react';

const InfoPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const contentMap = {
    'terms': {
      title: 'Quy Chế Hoạt Động',
      icon: <FileText className="w-12 h-12 text-indigo-500 mb-4" />,
      content: (
        <div className="space-y-6 text-slate-600 dark:text-slate-300">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Điều 1: Nguyên Tắc Chung</h3>
          <p>Nền tảng của chúng tôi sinh ra với mục đích tạo kết nối chia sẻ chỗ ở an toàn minh bạch. Người dùng yêu cầu tạo phòng mới cần xác thực thẻ Căn Cước Công Dân.</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Điều 2: Chống Lừa Đảo</h3>
          <p>Hệ thống không chịu trách nhiệm pháp lý nếu người thuê giao dịch bên ngoài ứng dụng. Mọi khoản cọc cần thông qua cổng TTĐT tích hợp sẵn với ví VNPay của Web để đảm bảo rủi ro 100% không mất cọc do "Bùng kèo".</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Điều 3: Quản Lý Bài Đăng</h3>
          <p>Admin sẽ tự động xoá những bài vi phạm (thông tin mập mờ, đăng trùng lặp) mà không cần báo trước trong vòng 24H.</p>
        </div>
      )
    },
    'privacy': {
      title: 'Chính Sách Bảo Mật',
      icon: <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4" />,
      content: (
        <div className="space-y-6 text-slate-600 dark:text-slate-300">
          <p>Chính sách bảo mật này thiết lập để cam kết việc bảo vệ những dữ liệu lưu trữ trên Server AWS và Azure của chúng tôi để khách hàng an tâm.</p>
          <ul className="list-disc pl-5 space-y-3">
            <li>Quản lý thông qua phiên lưu trữ Token khép kín (Encrypted JWT).</li>
            <li>Chúng tôi <span className="font-bold underline text-slate-800 dark:text-white">cam đoan KHÔNG</span> chia sẻ số điện thoại, mật khẩu của người thuê sang tổ chức bên thứ 3 (marketing call).</li>
            <li>Cookie chỉ được thu thập để làm UX/UI mượt mà hơn khi cá nhân hóa gợi ý phòng (Deep Learning Recommendation).</li>
          </ul>
        </div>
      )
    },
    'faq': {
      title: 'Câu Hỏi Thường Gặp (FAQ)',
      icon: <HelpCircle className="w-12 h-12 text-orange-500 mb-4" />,
      content: (
        <div className="space-y-8 text-slate-600 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Hỏi: Làm thế nào để đăng ký làm Chủ Trọ (Admin)?</h4>
            <p><strong>Đáp:</strong> Bất kì ai đăng ký tài khoản mới. Nếu bạn muốn lên Role ADMIN (Quyền tạo/xoá phòng), bạn cần liên hệ BQT web theo số điện thoại hỗ trợ hoặc đến văn phòng nộp chứng minh nguồn gốc tài sản theo luật kinh doanh Bất Động Sản lưu trú nhỏ lẻ!</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Hỏi: Hoá đơn tự động của tôi sinh ra không chính xác?</h4>
            <p><strong>Đáp:</strong> Với các lỗi phát sinh do quá trình CronJob máy chủ, bạn chỉ cần liên hệ Kế Toán qua mã Toà Nhà và bill sẽ lập tức được Admin xử lý huỷ lệnh chuyển khoản sau 5 phút.</p>
          </div>
        </div>
      )
    }
  };

  const pageData = contentMap[slug] || {
    title: 'Không Tìm Thấy Trang',
    icon: <HelpCircle className="w-12 h-12 text-slate-500 mb-4" />,
    content: <p>Nội dung đang được chuẩn bị hoặc đường dẫn không đúng.</p>
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[60vh]">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors mb-6 font-bold bg-white dark:bg-slate-800 px-5 py-2 rounded-full shadow-sm w-fit border border-slate-100 dark:border-slate-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay Lại
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-14 shadow-xl border border-slate-100 dark:border-slate-700/60 transition-colors">
        <div className="text-center mb-10 pb-10 border-b border-slate-100 dark:border-slate-700">
          <div className="flex justify-center">{pageData.icon}</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">{pageData.title}</h1>
        </div>
        
        <div className="prose prose-lg dark:prose-invert max-w-none prose-indigo">
          {pageData.content}
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
