const nodemailer = require('nodemailer');

// ─── Transporter ──────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Template: Invoice Email ──────────────────────────────────────
const buildInvoiceEmailHtml = ({ roomName, period, totalAmount, details, deadline }) => {
  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
  const [year, month] = period.split('-');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background:#f7f7f7; margin:0; padding:0; }
    .wrap { max-width:600px; margin:32px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.08); }
    .header { background:linear-gradient(90deg,#ff385c,#e00b41); padding:28px 32px; color:#fff; }
    .header h1 { margin:0; font-size:22px; }
    .header p  { margin:4px 0 0; font-size:13px; opacity:.85; }
    .body { padding:28px 32px; }
    .body h2 { font-size:16px; color:#222; margin:0 0 16px; }
    table { width:100%; border-collapse:collapse; font-size:14px; }
    td, th { padding:10px 12px; text-align:left; border-bottom:1px solid #eee; }
    th { background:#f7f7f7; color:#6a6a6a; font-weight:600; }
    .total { font-size:18px; font-weight:700; color:#ff385c; text-align:right; padding:16px 0 0; }
    .btn { display:inline-block; margin-top:20px; padding:14px 28px; background:#ff385c; color:#fff; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px; }
    .footer { padding:18px 32px; border-top:1px solid #eee; color:#929292; font-size:12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>Hóa Đơn Tháng ${month}/${year}</h1>
      <p>Phòng: ${roomName} — Đức Lương Home</p>
    </div>
    <div class="body">
      <h2>Chi tiết hóa đơn</h2>
      <table>
        <thead><tr><th>Khoản mục</th><th style="text-align:right">Thành tiền</th></tr></thead>
        <tbody>
          ${details.map(d => `<tr><td>${d.name}</td><td style="text-align:right">${fmt(d.amount)} ₫</td></tr>`).join('')}
        </tbody>
      </table>
      <p class="total">Tổng cộng: ${fmt(totalAmount)} ₫</p>
      <p style="font-size:13px;color:#6a6a6a;margin-top:8px;">Hạn thanh toán: <strong>${deadline}</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Đức Lương Home. Liên hệ: hotro@fplweb.vn</p>
      <p>Email này được gửi tự động, vui lòng không reply.</p>
    </div>
  </div>
</body>
</html>`;
};

// ─── Template: Zalo/SMS Click-to-Copy ────────────────────────────
const buildZaloTemplate = ({ roomName, period, totalAmount, details, bankInfo, deadline }) => {
  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
  const [year, month] = period.split('-');

  const lines = details.map(d => `• ${d.name}: ${fmt(d.amount)} ₫`).join('\n');

  return `🏠 *HÓA ĐƠN PHÒNG ${roomName} - THÁNG ${month}/${year}*\n\n${lines}\n\n💰 *TỔNG CỘNG: ${fmt(totalAmount)} ₫*\n\n⏰ Hạn thanh toán: ${deadline}\n\n🏦 Thanh toán chuyển khoản:\n• Ngân hàng: ${bankInfo.bankId}\n• Số TK: ${bankInfo.accountNo}\n• Chủ TK: ${bankInfo.accountName}\n• Nội dung CK: PHONG_${roomName.replace(/\s+/g, '_')}_THANG_${month}_${year}\n\nVui lòng chuyển đúng nội dung để chủ nhà xác nhận tự động. Cảm ơn! 🙏`;
};

// ─── Send Invoice Email ───────────────────────────────────────────
const sendInvoiceEmail = async ({ to, roomName, period, totalAmount, details, deadline }) => {
  if (!process.env.SMTP_USER) {
    console.warn('[Nodemailer] SMTP_USER chưa cấu hình — bỏ qua gửi email.');
    return;
  }

  const [year, month] = period.split('-');

  await transporter.sendMail({
    from:    `"Đức Lương Home" <${process.env.SMTP_USER}>`,
    to,
    subject: `[Hóa Đơn] Phòng ${roomName} — Tháng ${month}/${year}`,
    html:    buildInvoiceEmailHtml({ roomName, period, totalAmount, details, deadline }),
  });
};

module.exports = { sendInvoiceEmail, buildZaloTemplate };
