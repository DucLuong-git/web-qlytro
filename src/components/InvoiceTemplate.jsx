import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Button, Divider, Tag, QRCode, Tooltip, message } from 'antd';
import {
  DownloadOutlined, CopyOutlined, WhatsAppOutlined, CheckOutlined,
} from '@ant-design/icons';
import { buildVietQrUrl, sendNotification } from '../services/invoiceApi';

// ─── Format helpers ───────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
const statusColors = { Pending: '#f59e0b', Paid: '#10b981', Overdue: '#ff385c' };
const statusLabels = { Pending: 'Chờ Thanh Toán', Paid: 'Đã Thanh Toán', Overdue: 'Quá Hạn' };

// ─── InvoiceTemplate ──────────────────────────────────────────────
const InvoiceTemplate = ({ invoice, config, onClose }) => {
  const ref     = useRef(null);
  const [copied, setCopied]     = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!invoice) return null;

  const room     = invoice.roomId || {};
  const [year, month] = (invoice.period || '2026-01').split('-');
  const deadline = `15/${month}/${year}`;

  const details = [
    { name: 'Tiền phòng',  amount: invoice.roomFee },
    {
      name: `Điện (${invoice.electric?.usage || 0} kWh × ${fmt(invoice.electric?.price)} ₫)`,
      amount: invoice.electric?.total,
    },
    {
      name: `Nước (${invoice.water?.usage || 0} m³ × ${fmt(invoice.water?.price)} ₫)`,
      amount: invoice.water?.total,
    },
    ...(invoice.services || []).map(s => ({ name: s.name, amount: s.amount })),
  ].filter(d => d.amount > 0);

  // VietQR
  const qrContent = `PHONG_${(room.name || '').replace(/\s+/g, '_')}_THANG_${month}_${year}`;
  const vietQrUrl = config?.bankInfo?.accountNo
    ? buildVietQrUrl({
        bankId:      config.bankInfo.bankId,
        accountNo:   config.bankInfo.accountNo,
        accountName: config.bankInfo.accountName,
        amount:      invoice.totalAmount,
        content:     qrContent,
      })
    : null;

  // Zalo template
  const zaloText = [
    `🏠 HÓA ĐƠN PHÒNG ${room.name} - THÁNG ${month}/${year}`,
    '',
    ...details.map(d => `• ${d.name}: ${fmt(d.amount)} ₫`),
    '',
    `💰 TỔNG CỘNG: ${fmt(invoice.totalAmount)} ₫`,
    `⏰ Hạn thanh toán: ${deadline}`,
    config?.bankInfo?.accountNo
      ? `\n🏦 CK: ${config.bankInfo.bankId} - ${config.bankInfo.accountNo} - ${config.bankInfo.accountName}\n📝 ND: ${qrContent}`
      : '',
  ].join('\n');

  // Export JPG
  const handleExport = async () => {
    if (!ref.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(ref.current, { quality: 0.95, pixelRatio: 2 });
      const a = document.createElement('a');
      a.href     = dataUrl;
      a.download = `HoaDon_${room.name || 'phong'}_T${month}_${year}.png`;
      a.click();
      message.success('Đã tải hóa đơn!');
    } catch (e) {
      message.error('Xuất ảnh thất bại');
    } finally {
      setExporting(false);
    }
  };

  // Copy Zalo text
  const handleCopyZalo = async () => {
    await navigator.clipboard.writeText(zaloText);
    setCopied(true);
    message.success('Đã copy nội dung gửi Zalo!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-[560px] mx-auto">
      {/* ── Action bar ────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={exporting}
          onClick={handleExport}
          style={{ background: '#ff385c', borderColor: '#ff385c', borderRadius: 8 }}
        >
          Tải ảnh JPG
        </Button>
        <Tooltip title="Sao chép nội dung đòi tiền gửi Zalo/SMS">
          <Button
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopyZalo}
            style={{ borderRadius: 8 }}
          >
            {copied ? 'Đã copy!' : 'Copy Zalo'}
          </Button>
        </Tooltip>
      </div>

      {/* ── Invoice card (snapshot for export) ───────────────────── */}
      <div
        ref={ref}
        style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #dddddd',
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, sans-serif',
          boxShadow: 'rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.1) 0 4px 8px 0',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(90deg,#ff385c 0%,#e00b41 50%,#92174d 100%)',
            padding: '24px 28px',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>Đức Lương Home</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>Hóa đơn điện tử</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Tháng {month}/{year}</div>
              <div
                style={{
                  marginTop: 6,
                  display: 'inline-block',
                  padding: '2px 10px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  color: statusColors[invoice.status] === '#10b981' ? '#fff' : '#fff',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {statusLabels[invoice.status] || invoice.status}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 22, fontWeight: 800, letterSpacing: -0.3 }}>
            Phòng {room.name}
          </div>
          {room.address && (
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{room.address}</div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 28px' }}>
          {/* Chỉ số */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              {
                label: '⚡ Chỉ số điện',
                sub:   `${invoice.electric?.oldIndex} → ${invoice.electric?.newIndex} kWh`,
                value: `${invoice.electric?.usage} kWh`,
              },
              {
                label: '💧 Chỉ số nước',
                sub:   `${invoice.water?.oldIndex} → ${invoice.water?.newIndex} m³`,
                value: `${invoice.water?.usage} m³`,
              },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  background: '#f7f7f7',
                  borderRadius: 10,
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: 12, color: '#6a6a6a', fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#929292', marginTop: 2 }}>{item.sub}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#222', marginTop: 4 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Chi tiết */}
          <div style={{ borderTop: '1px solid #dddddd', paddingTop: 16 }}>
            {details.map((d, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: i < details.length - 1 ? '1px solid #f7f7f7' : 'none',
                  fontSize: 14,
                }}
              >
                <span style={{ color: '#3f3f3f', fontWeight: 500 }}>{d.name}</span>
                <span style={{ fontWeight: 700, color: '#222' }}>{fmt(d.amount)} ₫</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              padding: '14px 16px',
              background: 'linear-gradient(90deg, #fff5f7, #fff)',
              borderRadius: 10,
              border: '1.5px solid #ff385c20',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: '#6a6a6a' }}>TỔNG CỘNG</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#ff385c' }}>
              {fmt(invoice.totalAmount)} ₫
            </span>
          </div>

          {/* Hạn thanh toán */}
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: '#6a6a6a' }}>
            Hạn thanh toán: <strong style={{ color: '#222' }}>{deadline}</strong>
          </div>
        </div>

        {/* VietQR section */}
        {vietQrUrl && (
          <>
            <Divider style={{ margin: 0 }} />
            <div style={{ padding: '16px 28px 20px', background: '#f7f7f7' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 12, textAlign: 'center' }}>
                Quét mã để thanh toán nhanh
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={vietQrUrl}
                  alt="VietQR"
                  style={{ width: 140, height: 140, borderRadius: 10, border: '1px solid #ddd', background: '#fff' }}
                />
                <div style={{ fontSize: 12, color: '#6a6a6a', lineHeight: 1.7 }}>
                  <div><strong>Ngân hàng:</strong> {config?.bankInfo?.bankId}</div>
                  <div><strong>Số TK:</strong> {config?.bankInfo?.accountNo}</div>
                  <div><strong>Chủ TK:</strong> {config?.bankInfo?.accountName}</div>
                  <div style={{ marginTop: 6, padding: '4px 8px', background: '#fff', borderRadius: 6, border: '1px solid #ddd', fontSize: 11, wordBreak: 'break-all' }}>
                    ND: <strong>{qrContent}</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Evidence images */}
        {invoice.evidenceImages?.length > 0 && (
          <>
            <Divider style={{ margin: 0 }} />
            <div style={{ padding: '14px 28px 18px' }}>
              <div style={{ fontSize: 12, color: '#6a6a6a', fontWeight: 600, marginBottom: 8 }}>Ảnh minh chứng đồng hồ</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {invoice.evidenceImages.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`evidence-${i}`}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '10px 28px',
            background: '#222222',
            color: '#929292',
            fontSize: 11,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Đức Lương Home © {new Date().getFullYear()}</span>
          <span>hotro@fplweb.vn</span>
        </div>
      </div>

      {/* Zalo text preview */}
      <div style={{ marginTop: 16, padding: '14px', background: '#f7f7f7', borderRadius: 10, border: '1px solid #ddd' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6a6a6a', marginBottom: 8 }}>
          📋 Nội dung gửi Zalo/SMS (Click Copy ở trên)
        </div>
        <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#222' }}>
          {zaloText}
        </pre>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
