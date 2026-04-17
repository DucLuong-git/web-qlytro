import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { CreditCard, FileText, Download, CheckCircle, Clock, Zap, Droplet, User, BellRing, Mail, Check, AlertCircle } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const { addNotification } = useNotificationStore();
  const [invoices, setInvoices] = useState([
    { id: 'INV-001', roomAmount: 400, electricity: 50, water: 20, service: 30, date: '2026-03-01', status: 'Đã thanh toán' },
    { id: 'INV-002', roomAmount: 400, electricity: 60, water: 25, service: 30, date: '2026-04-01', status: 'Chờ thanh toán' }
  ]);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // VNPay Modal States
  const [vnpayModalOpen, setVnpayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Admin Auto Mail State
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailStatus, setMailStatus] = useState(null);

  useEffect(() => {
    if (user?.role === 'TENANT') {
      const interval = setInterval(() => {
        const newInv = { 
          id: `INV-00${invoices.length + 1}`, 
          roomAmount: 400,
          electricity: Math.floor(Math.random() * 30) + 40,
          water: Math.floor(Math.random() * 10) + 15,
          service: 30,
          date: new Date().toISOString().split('T')[0], 
          status: 'Chờ thanh toán' 
        };
        setInvoices(prev => [newInv, ...prev]);
        
        // Kích hoạt chuông thông báo Realtime lên System Layout
        // Kích hoạt chuông thông báo Realtime lên System Layout
        addNotification('Hoá đơn mới ' + newInv.id + ' vừa xuất hiện. Email đã gửi tự động đến bạn.', 'info');
      }, 120000); // Demo: Auto gen sau mỗi 2 phút
      return () => clearInterval(interval);
    }
  }, [user, invoices.length, addNotification]);

  useEffect(() => {
    // Kiểm tra nếu redirect về từ VNPay
    const queryParams = new URLSearchParams(location.search);
    const vnPayResponse = queryParams.get('vnp_ResponseCode');
    const invoiceId = queryParams.get('vnp_TxnRef');
    
    if (vnPayResponse) {
      if (vnPayResponse === '00') {
        addNotification(`Thanh toán thành công ${invoiceId} qua VNPay Sandbox!`, 'info');
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'Đã thanh toán' } : inv));
      } else {
        addNotification(`Giao dịch VNPay thất bại hoặc đã bị huỷ. Mã lỗi: ${vnPayResponse}`, 'error');
      }
      // Xoá search params trên URL mà không reload trang
      navigate('/dashboard', { replace: true });
    }
  }, [location, navigate, addNotification]);

  const openVNPay = (inv) => {
    setSelectedInvoice(inv);
    setVnpayModalOpen(true);
  };

  const handleVNPayConfirm = async () => {
    setIsProcessing(true);
    try {
      // Gọi API Backend VNPay đã đổi
      const response = await fetch('http://localhost:3001/api/vnpay/create_payment_url', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            amount: getTotal(selectedInvoice),
            invoiceId: selectedInvoice.id
         })
      });
      const data = await response.json();
      if(data.success) {
          // Redirect qua Cổng VNPay thật
          window.location.href = data.paymentUrl;
      } else {
          setIsProcessing(false);
          addNotification('Lỗi khi tạo VNPay Session', 'error');
      }
    } catch (e) {
      setIsProcessing(false);
      addNotification('Lỗi khi kết nối đến API VNPay', 'error');
    }
  };

  const handleSendAutoMail = () => {
    setIsSendingMail(true);
    setMailStatus(null);
    setTimeout(() => {
      setIsSendingMail(false);
      setMailStatus('Đã hoàn tất tiến trình gửi Mail CronJob giả lập. 12 Tenants đã nhận hoá đơn.');
    }, 2500);
  };

  const getTotal = (inv) => inv.roomAmount + inv.electricity + inv.water + inv.service;

  const exportPDF = (invoice) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('HOA DON THANH TOAN DIEN NUOC FPL', 15, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Ma Hoa Don: ${invoice.id}`, 20, 60);
    doc.text(`Ngay phat hanh: ${invoice.date}`, 20, 68);
    doc.text(`Khach hang phu trach: ${user?.name || 'Khach Vang Lai'}`, 20, 76);
    doc.text(`Email tham chieu: ${user?.email || 'N/A'}`, 20, 84);
    doc.text(`Trang thai thanh toan: ${invoice.status}`, 20, 92);
    
    doc.autoTable({
      startY: 105,
      headStyles: { fillColor: [79, 70, 229] },
      head: [['Hang muc dich vu', 'Don vi', 'So luong/Thang', 'Thanh Tien (USD)']],
      body: [
        ['Tien Thue Phong Co Ban', 'Thang', '1', `$${invoice.roomAmount}`],
        ['Dien chieu sang sinh hoat', 'KWh', 'Theo muc do', `$${invoice.electricity}`],
        ['Nuoc may sinh hoat', 'M3', 'Theo muc do', `$${invoice.water}`],
        ['Phi tiep tan, Bao ve, Wifi', 'Goi', 'Trọn goi', `$${invoice.service}`],
      ],
      foot: [['', '', 'TONG CONG THANH TOAN:', `$${getTotal(invoice)}`]],
      footStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold' },
      theme: 'grid'
    });
    
    doc.save(`Hoa-Don-${invoice.id}.pdf`);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-xl rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 p-8 transition-colors">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Tổng Quan Khoản Thu Thập</h1>
          
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-[2rem] p-8 sm:p-10 mb-10 relative overflow-hidden shadow-xl shadow-primary-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Xin chào, {user?.name}!</h2>
                <p className="text-primary-50 font-medium text-lg leading-relaxed max-w-2xl">Hệ thống Cổng Thông Tin sẽ tự động tổng hợp phí điện nước, phòng lưu trú của bạn tháng này.</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white flex items-center gap-4 shrunk-0">
                 <div className="bg-emerald-400/20 p-3 rounded-full"><BellRing className="text-emerald-300 w-6 h-6" /></div>
                 <div>
                    <div className="text-sm text-indigo-100 font-medium">Bật tính năng Auto Mail</div>
                    <div className="font-bold">Đã đồng bộ hòm thư {user?.email}</div>
                 </div>
              </div>
            </div>
          </div>

          {user?.role === 'TENANT' ? (
            <div className="mt-8 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner">
              <h3 className="text-xl font-bold mb-6 flex items-center text-slate-900 dark:text-white">
                <FileText className="w-6 h-6 mr-3 text-primary-500" />
                Danh Sách Hoá Đơn / Lệ Phí Yêu Cầu
              </h3>
              
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
                      <th className="py-4 px-6 font-bold uppercase tracking-wider">Mã Hoá Đơn</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider">Kì Hạn</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider">Chi Tiết Trích Tiền</th>
                      <th className="py-4 px-6 font-black uppercase text-primary-600 dark:text-primary-400">Thành Tiền($)</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-center">Tình Trạng</th>
                      <th className="py-4 px-6 font-bold text-center uppercase tracking-wider border-l border-slate-200 dark:border-slate-700">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium text-slate-700 dark:text-slate-200">
                    {invoices.map(inv => {
                      const isPaid = inv.status === 'Đã thanh toán';
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                          <td className="py-5 px-6 font-black">{inv.id}</td>
                          <td className="py-5 px-6 font-medium text-slate-500">{inv.date}</td>
                          <td className="py-5 px-6">
                            <div className="flex gap-2 flex-wrap items-center">
                              <span className="flex items-center text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300"><User className="w-3 h-3 mr-1"/> ${inv.roomAmount}</span>
                              <span className="flex items-center text-xs bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded text-orange-600 dark:text-orange-400"><Zap className="w-3 h-3 mr-1"/> ${inv.electricity}</span>
                              <span className="flex items-center text-xs bg-cyan-50 dark:bg-cyan-500/10 px-2 py-1 rounded text-cyan-600 dark:text-cyan-400"><Droplet className="w-3 h-3 mr-1"/> ${inv.water}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6 font-black text-primary-600 dark:text-primary-400 text-lg">${getTotal(inv)}</td>
                          <td className="py-5 px-6 text-center">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border ${
                              isPaid 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-300' 
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-300'
                            }`}>
                              {isPaid ? <CheckCircle className="w-4 h-4 mr-1.5" /> : <Clock className="w-4 h-4 mr-1.5 animate-bounce" />}
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-5 px-6 border-l border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/10">
                            <div className="flex flex-col gap-2 justify-center ml-2">
                              {!isPaid && (
                                <button 
                                  onClick={() => openVNPay(inv)}
                                  className="mx-auto w-full max-w-[160px] inline-flex items-center justify-center px-3 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl shadow-sm hover:scale-105 transition-all"
                                >
                                  <CreditCard className="w-4 h-4 mr-1.5" /> Thanh Toán Online
                                </button>
                              )}
                              <button 
                                onClick={() => exportPDF(inv)}
                                className="mx-auto w-full max-w-[160px] inline-flex items-center justify-center px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-sm font-bold rounded-lg transition-all"
                              >
                                <Download className="w-4 h-4 mr-1.5" /> In Xuất PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Admin CronJob Center */}
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                   <Mail className="w-6 h-6 text-indigo-500" />
                   Trung Tâm Gửi Mail CronJob
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                   Tại đây, Ban quản trị có thể kích hoạt tiến trình nạp Hoá Đơn và tự động gửi Email thông báo thu Tiền Nhà, Điện, Nước cho toàn bộ Cư Dân. Tiết kiệm 100% thời gian.
                </p>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl mb-6 flex items-start gap-4">
                   <AlertCircle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                   <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                     Hệ thống hiện là bản Preview, tính năng thực thi API SendGrid sẽ được giả lập quá trình 2.5s.
                   </p>
                </div>
                
                <button
                  onClick={handleSendAutoMail}
                  disabled={isSendingMail}
                  className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-80 disabled:pointer-events-none flex auto-cols-auto items-center justify-center"
                >
                  {isSendingMail ? (
                     <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></div> Đang gửi & kiểm toán hàng loạt...</>
                  ) : 'Bắt Đầu Kích Hoạt Automation'}
                </button>
                {mailStatus && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-300">
                     <Check className="w-5 h-5" /> {mailStatus}
                  </div>
                )}
              </div>

               <div className="bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 text-slate-900 dark:text-white">Kiểm Tra Trạng Thái Cá Nhân Admin</h3>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Họ & Tên</span>
                    <span className="font-bold text-slate-900 dark:text-white">{user?.name}</span>
                  </li>
                  <li className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Email Quản Trị</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{user?.email}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VNPay Modal Overlay (Tailwind Custom) */}
      {vnpayModalOpen && selectedInvoice && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-300">
               <div className="bg-primary-600 p-6 text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>
                 <h3 className="text-xl font-bold text-white tracking-wider uppercase flex items-center justify-center gap-2 relative z-10"><CreditCard className="w-5 h-5"/> Thanh Toán Mã QR / VNPay</h3>
                 <p className="text-primary-100 text-sm mt-1 relative z-10">Mở app Ngân hàng (hoặc VNPay) để quét mã hoặc chuyển tới thẻ ATM.</p>
               </div>
               
               <div className="p-8">
                 <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 text-center mb-6 shadow-inner">
                    <p className="font-medium text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">Thanh toán hoá đơn: <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.id}</span></p>
                    <div className="text-4xl font-black text-primary-600 dark:text-primary-400">${getTotal(selectedInvoice)}</div>
                    
                    {/* QR CODE DYNAMIC RENDER */}
                    <div className="mt-6 flex justify-center">
                       <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-sm border border-slate-200 relative animate-pulse-glow">
                          <img 
                            src={`https://img.vietqr.io/image/970415-113366668888-qr_only.png?amount=${getTotal(selectedInvoice)*25000}&addInfo=${selectedInvoice.id}`} 
                            alt="QR Thanh Toán"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm">
                             <div className="w-8 h-8 rounded-full border border-primary-500 flex items-center justify-center font-bold text-[10px] text-primary-600">PAY</div>
                          </div>
                       </div>
                    </div>
                    <p className="text-xs text-text-muted mt-3 font-medium flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 mr-1 text-primary-500" /> Hệ thống tự động duyệt sau 2-5 phút.</p>
                 </div>
                 
                 <div className="flex gap-4">
                   <button 
                     onClick={() => setVnpayModalOpen(false)}
                     disabled={isProcessing}
                     className="flex-1 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors disabled:opacity-50"
                   >
                     Hủy / Đóng
                   </button>
                   <button 
                     onClick={handleVNPayConfirm}
                     disabled={isProcessing}
                     className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-sm shadow-primary-500/30 transition-all active:scale-95 disabled:opacity-80 flex items-center justify-center"
                   >
                     {isProcessing ? (
                       <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Đang kết nối VNPay...</>
                     ) : 'Chuyển Tới Cổng VNPay Thật'}
                   </button>
                 </div>
               </div>
            </div>
         </div>
      )}
    </>
  );
};

export default DashboardPage;
