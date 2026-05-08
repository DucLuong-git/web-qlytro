/**
 * InvoiceManagementPage — thiết kế theo impeccable (product register)
 * Scene: Chủ trọ nhập chỉ số buổi sáng, laptop 13-15", cần tốc độ + chính xác.
 * Color strategy: Restrained — OKLCH neutrals + coral accent cho primary actions only.
 * Bans applied: no gradient text, no glassmorphism, no hero-metric, no side-stripe borders.
 */
import { useState, useCallback, useEffect } from 'react';
import {
  Table, Button, DatePicker, InputNumber,
  Upload, message, Popconfirm, Space, Skeleton, Tag,
} from 'antd';
import {
  Settings, RefreshCw, Save, Eye, CheckCircle,
  Camera, ChevronDown, ChevronUp, AlertCircle, X,
} from 'lucide-react';
import dayjs from 'dayjs';
import {
  smartFetchInvoices, bulkSaveInvoices, updateInvoice,
  uploadEvidence, fetchInvoiceById,
} from '../../services/invoiceApi';
import InvoiceTemplate from '../../components/InvoiceTemplate';
import ConfigModal from './ConfigModal';

/* ─── helpers ─────────────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
const today = () => dayjs().format('YYYY-MM');

const STATUS_MAP = {
  Pending: { label: 'Chờ TT',   bg: 'oklch(0.97 0.02 80)',  color: 'oklch(0.55 0.15 60)' },
  Paid:    { label: 'Đã TT',    bg: 'oklch(0.96 0.02 160)', color: 'oklch(0.45 0.14 155)' },
  Overdue: { label: 'Quá hạn', bg: 'oklch(0.96 0.04 20)',  color: 'oklch(0.5 0.2 25)' },
};

/* ─── tiny components ──────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const s = STATUS_MAP[status];
  if (!s) return null;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
      letterSpacing: '0.01em',
    }}>{s.label}</span>
  );
};

const IndexCell = ({ value, oldVal, error, onChange }) => (
  <div>
    <InputNumber
      value={value === '' ? null : value}
      min={0}
      placeholder="—"
      onChange={(v) => onChange(v ?? '')}
      style={{
        width: '100%',
        borderRadius: 6,
        borderColor: error ? 'oklch(0.55 0.2 25)' : undefined,
        fontSize: 13,
      }}
      controls={false}
    />
    {error && (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        marginTop: 3, fontSize: 11,
        color: 'oklch(0.5 0.2 25)',
      }}>
        <AlertCircle size={11} />
        <span>Mới &lt; cũ</span>
      </div>
    )}
  </div>
);

/* ─── skeleton row ─────────────────────────────────────────── */
const SkeletonTable = () => (
  <div style={{ padding: '8px 0' }}>
    {[...Array(6)].map((_, i) => (
      <div key={i} style={{
        display: 'grid',
        gridTemplateColumns: '120px 90px 110px 90px 110px 110px 90px',
        gap: 12, padding: '12px 16px',
        borderBottom: '1px solid oklch(0.93 0.005 250)',
        opacity: 1 - i * 0.12,
      }}>
        {[...Array(7)].map((_, j) => (
          <Skeleton.Input key={j} active size="small" style={{ width: '100%', borderRadius: 4 }} />
        ))}
      </div>
    ))}
  </div>
);

/* ─── config bar ───────────────────────────────────────────── */
const ConfigBar = ({ config }) => {
  if (!config) return null;
  const items = [
    { label: 'Điện', value: `${fmt(config.electricPrice)} ₫/kWh` },
    { label: 'Nước', value: `${fmt(config.waterPrice)} ₫/m³` },
    { label: 'Rác',  value: `${fmt(config.garbagePrice)} ₫` },
    { label: 'Net',  value: `${fmt(config.internetPrice)} ₫` },
  ];
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 0,
      border: '1px solid oklch(0.91 0.006 250)',
      borderRadius: 8, overflow: 'hidden', marginBottom: 16,
    }}>
      {items.map((it, i) => (
        <div key={it.label} style={{
          padding: '8px 16px',
          borderRight: i < items.length - 1 ? '1px solid oklch(0.91 0.006 250)' : 'none',
          background: 'oklch(0.985 0.003 250)',
        }}>
          <span style={{ fontSize: 11, color: 'oklch(0.55 0.01 250)', fontWeight: 500 }}>
            {it.label}:&nbsp;
          </span>
          <span style={{ fontSize: 12, color: 'oklch(0.25 0.01 250)', fontWeight: 700 }}>
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── main page ────────────────────────────────────────────── */
export default function InvoiceManagementPage() {
  const [period, setPeriod] = useState(today());
  const [rows, setRows]     = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [viewId, setViewId]     = useState(null);
  const [viewInv, setViewInv]   = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [showConfig, setShowConfig]   = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  /* fetch invoice detail for modal */
  useEffect(() => {
    if (!viewId) { setViewInv(null); return; }
    setViewLoading(true);
    fetchInvoiceById(viewId)
      .then(r => setViewInv(r.data))
      .catch(() => message.error('Không tải được hóa đơn'))
      .finally(() => setViewLoading(false));
  }, [viewId]);

  /* smart fetch */
  const handleFetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await smartFetchInvoices(period);
      setConfig(res.config);
      setRows(res.data.map((item, idx) => ({
        key: idx,
        roomId:   item.room._id,
        roomName: item.room.name,
        roomFee:  item.roomFee,
        invoiceId:     item.invoiceId,
        invoiceStatus: item.invoiceStatus,
        elecOld:  item.electric.oldIndex,
        elecNew:  item.electric.newIndex ?? '',
        elecPrice: item.electric.price,
        waterOld: item.water.oldIndex,
        waterNew: item.water.newIndex ?? '',
        waterPrice: item.water.price,
        services: item.services,
        evidenceImages: item.evidenceImages,
        elecError: false,
        waterError: false,
        dirty: false,
      })));
    } catch (e) {
      message.error('Lỗi tải dữ liệu: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  }, [period]);

  const setRow = (idx, patch) =>
    setRows(prev => prev.map((r, i) => i !== idx ? r : { ...r, ...patch, dirty: true }));

  const calcTotal = (r) => {
    const eu = Math.max(0, (r.elecNew || 0) - (r.elecOld || 0));
    const wu = Math.max(0, (r.waterNew || 0) - (r.waterOld || 0));
    const sv = (r.services || []).reduce((a, s) => a + (s.amount || 0), 0);
    return (r.roomFee || 0) + eu * (r.elecPrice || 0) + wu * (r.waterPrice || 0) + sv;
  };

  const handleSave = async () => {
    if (rows.some(r => r.elecError || r.waterError))
      return message.error('Kiểm tra lại chỉ số âm trước khi lưu.');
    const dirty = rows.filter(r => r.elecNew !== '' || r.waterNew !== '');
    if (!dirty.length) return message.warning('Chưa nhập chỉ số nào.');
    setSaving(true);
    try {
      const res = await bulkSaveInvoices({
        period,
        invoices: dirty.map(r => ({
          roomId:  r.roomId,
          roomFee: r.roomFee,
          electric: { oldIndex: r.elecOld, newIndex: r.elecNew, price: r.elecPrice },
          water:    { oldIndex: r.waterOld, newIndex: r.waterNew, price: r.waterPrice },
          services: r.services || [],
        })),
      });
      message.success(res.message);
      handleFetch();
    } catch (e) {
      message.error(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file, invoiceId, rowIdx) => {
    if (!invoiceId) return message.warning('Lưu hóa đơn trước khi upload ảnh.');
    setUploadingId(invoiceId);
    try {
      const res = await uploadEvidence(invoiceId, file);
      setRow(rowIdx, {
        evidenceImages: [...(rows[rowIdx].evidenceImages || []), res.url],
      });
      message.success('Upload thành công');
    } catch (e) {
      message.error('Upload thất bại');
    } finally {
      setUploadingId(null);
    }
    return false;
  };

  const handleMarkPaid = async (row) => {
    if (!row.invoiceId) return message.warning('Chưa có hóa đơn.');
    await updateInvoice(row.invoiceId, { status: 'Paid' });
    message.success(`${row.roomName} — đã thanh toán`);
    handleFetch();
  };

  /* columns */
  const columns = [
    {
      title: 'Phòng',
      dataIndex: 'roomName',
      fixed: 'left',
      width: 130,
      render: (name, r) => (
        <div style={{ lineHeight: 1.4 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'oklch(0.2 0.01 250)' }}>{name}</div>
          {r.invoiceStatus && <StatusPill status={r.invoiceStatus} />}
        </div>
      ),
    },
    {
      title: () => <span style={{ fontSize: 12 }}>⚡ Cũ</span>,
      dataIndex: 'elecOld', width: 80,
      render: v => <span style={{ fontSize: 13, color: 'oklch(0.55 0.01 250)' }}>{v}</span>,
    },
    {
      title: () => <span style={{ fontSize: 12 }}>⚡ Mới</span>,
      width: 120,
      render: (_, r, idx) => (
        <IndexCell
          value={r.elecNew} oldVal={r.elecOld} error={r.elecError}
          onChange={v => setRow(idx, {
            elecNew: v,
            elecError: v !== '' && Number(v) < Number(r.elecOld),
          })}
        />
      ),
    },
    {
      title: () => <span style={{ fontSize: 12 }}>💧 Cũ</span>,
      dataIndex: 'waterOld', width: 80,
      render: v => <span style={{ fontSize: 13, color: 'oklch(0.55 0.01 250)' }}>{v}</span>,
    },
    {
      title: () => <span style={{ fontSize: 12 }}>💧 Mới</span>,
      width: 120,
      render: (_, r, idx) => (
        <IndexCell
          value={r.waterNew} oldVal={r.waterOld} error={r.waterError}
          onChange={v => setRow(idx, {
            waterNew: v,
            waterError: v !== '' && Number(v) < Number(r.waterOld),
          })}
        />
      ),
    },
    {
      title: () => <span style={{ fontSize: 12 }}>Tổng (₫)</span>,
      width: 120,
      render: (_, r) => {
        const t = calcTotal(r);
        return (
          <span style={{
            fontWeight: 700, fontSize: 13,
            color: t > 0 ? 'oklch(0.52 0.22 25)' : 'oklch(0.72 0.005 250)',
          }}>
            {t > 0 ? fmt(t) : '—'}
          </span>
        );
      },
    },
    {
      title: () => <span style={{ fontSize: 12 }}>Ảnh</span>,
      width: 90,
      render: (_, r, idx) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Upload
            showUploadList={false}
            accept="image/*"
            beforeUpload={f => handleUpload(f, r.invoiceId, idx)}
          >
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 6,
              border: '1px solid oklch(0.88 0.006 250)',
              background: uploadingId === r.invoiceId ? 'oklch(0.96 0.005 250)' : '#fff',
              cursor: 'pointer', transition: 'background 0.15s',
            }}>
              <Camera size={14} color="oklch(0.5 0.01 250)" />
            </button>
          </Upload>
          {r.evidenceImages?.length > 0 && (
            <span style={{ fontSize: 11, color: 'oklch(0.45 0.14 155)', fontWeight: 700 }}>
              ✓{r.evidenceImages.length}
            </span>
          )}
        </div>
      ),
    },
    {
      title: '',
      fixed: 'right',
      width: 80,
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            disabled={!r.invoiceId}
            onClick={() => setViewId(r.invoiceId)}
            title="Xem hóa đơn"
            style={{
              width: 30, height: 30, borderRadius: 6,
              border: '1px solid oklch(0.88 0.006 250)',
              background: r.invoiceId ? '#fff' : 'oklch(0.96 0.005 250)',
              cursor: r.invoiceId ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            <Eye size={13} color={r.invoiceId ? 'oklch(0.45 0.01 250)' : 'oklch(0.72 0.005 250)'} />
          </button>
          <Popconfirm
            title="Xác nhận đã thanh toán?"
            onConfirm={() => handleMarkPaid(r)}
            okText="Xác nhận" cancelText="Huỷ"
            disabled={!r.invoiceId || r.invoiceStatus === 'Paid'}
          >
            <button
              disabled={!r.invoiceId || r.invoiceStatus === 'Paid'}
              title="Đánh dấu đã TT"
              style={{
                width: 30, height: 30, borderRadius: 6,
                border: '1px solid oklch(0.88 0.006 250)',
                background: r.invoiceStatus === 'Paid' ? 'oklch(0.96 0.02 160)' : '#fff',
                cursor: (!r.invoiceId || r.invoiceStatus === 'Paid') ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              <CheckCircle
                size={13}
                color={r.invoiceStatus === 'Paid' ? 'oklch(0.45 0.14 155)' : 'oklch(0.72 0.005 250)'}
              />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  /* summary row total */
  const grandTotal = rows.reduce((acc, r) => acc + calcTotal(r), 0);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center',
        gap: 12, marginBottom: 20,
      }}>
        <div>
          <h1 style={{
            margin: 0, fontSize: 20, fontWeight: 700,
            color: 'oklch(0.2 0.01 250)', letterSpacing: '-0.01em',
          }}>
            Nhập chỉ số & Hóa đơn
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: 'oklch(0.55 0.01 250)' }}>
            Hệ thống tự điền chỉ số cũ và tính toán ngay khi nhập.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Đơn giá */}
          <button
            onClick={() => setShowConfig(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 7,
              border: '1px solid oklch(0.88 0.006 250)',
              background: '#fff', cursor: 'pointer', fontSize: 13,
              color: 'oklch(0.35 0.01 250)', fontWeight: 500,
              transition: 'background 0.15s',
            }}
          >
            <Settings size={14} /> Đơn giá
          </button>

          {/* Chọn tháng */}
          <DatePicker
            picker="month"
            value={dayjs(period)}
            onChange={d => d && setPeriod(d.format('YYYY-MM'))}
            format="MM/YYYY"
            allowClear={false}
            style={{ borderRadius: 7, fontSize: 13 }}
          />

          {/* Tải dữ liệu */}
          <button
            onClick={handleFetch}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 7,
              border: '1px solid oklch(0.88 0.006 250)',
              background: '#fff', cursor: loading ? 'wait' : 'pointer',
              fontSize: 13, color: 'oklch(0.35 0.01 250)', fontWeight: 500,
              transition: 'background 0.15s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Tải dữ liệu
          </button>

          {/* Lưu tất cả */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 7,
              border: 'none',
              background: saving ? 'oklch(0.65 0.18 25)' : 'oklch(0.58 0.22 25)',
              cursor: saving ? 'wait' : 'pointer',
              fontSize: 13, color: '#fff', fontWeight: 600,
              transition: 'background 0.15s',
            }}
          >
            <Save size={14} />
            {saving ? 'Đang lưu...' : 'Lưu tất cả'}
          </button>
        </div>
      </div>

      {/* ── Config bar ─────────────────────────────────────────── */}
      <ConfigBar config={config} />

      {/* ── Empty state ────────────────────────────────────────── */}
      {!loading && rows.length === 0 && (
        <div style={{
          padding: '56px 24px', textAlign: 'center',
          border: '1px dashed oklch(0.88 0.006 250)',
          borderRadius: 10, background: 'oklch(0.99 0.002 250)',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{
            fontSize: 15, fontWeight: 600,
            color: 'oklch(0.3 0.01 250)', marginBottom: 6,
          }}>
            Chọn tháng rồi nhấn "Tải dữ liệu"
          </div>
          <div style={{ fontSize: 13, color: 'oklch(0.55 0.01 250)', marginBottom: 20 }}>
            Chỉ số cũ được điền tự động từ kỳ trước.
          </div>
          <button
            onClick={handleFetch}
            style={{
              padding: '8px 20px', borderRadius: 7, border: 'none',
              background: 'oklch(0.58 0.22 25)', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Tải dữ liệu
          </button>
        </div>
      )}

      {/* ── Skeleton ───────────────────────────────────────────── */}
      {loading && <SkeletonTable />}

      {/* ── Table ──────────────────────────────────────────────── */}
      {!loading && rows.length > 0 && (
        <div style={{
          border: '1px solid oklch(0.91 0.006 250)',
          borderRadius: 10, overflow: 'hidden',
          background: '#fff',
        }}>
          <Table
            dataSource={rows}
            columns={columns}
            scroll={{ x: 820 }}
            rowKey="key"
            pagination={false}
            size="middle"
            rowClassName={r =>
              r.elecError || r.waterError
                ? 'row-error'
                : r.dirty ? 'row-dirty' : ''
            }
            style={{ '--table-border-color': 'oklch(0.93 0.005 250)' }}
            summary={() => grandTotal > 0 ? (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5}>
                  <span style={{ fontSize: 12, color: 'oklch(0.55 0.01 250)', fontWeight: 600 }}>
                    Tổng tháng {period.split('-').reverse().join('/')}
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'oklch(0.52 0.22 25)' }}>
                    {fmt(grandTotal)} ₫
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} colSpan={2} />
              </Table.Summary.Row>
            ) : null}
          />
        </div>
      )}

      {/* ── Invoice drawer / modal ─────────────────────────────── */}
      {viewId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', justifyContent: 'flex-end',
        }}>
          {/* backdrop */}
          <div
            onClick={() => setViewId(null)}
            style={{
              position: 'absolute', inset: 0,
              background: 'oklch(0.1 0.01 250 / 0.4)',
            }}
          />
          {/* panel */}
          <div style={{
            position: 'relative', zIndex: 1,
            width: '100%', maxWidth: 620,
            background: '#fff', height: '100%',
            overflowY: 'auto',
            boxShadow: '-4px 0 24px oklch(0.1 0.01 250 / 0.12)',
            animation: 'slideIn 0.2s ease-out',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid oklch(0.91 0.006 250)',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1,
            }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'oklch(0.2 0.01 250)' }}>
                Chi tiết hóa đơn
              </span>
              <button
                onClick={() => setViewId(null)}
                style={{
                  width: 32, height: 32, borderRadius: 6, border: 'none',
                  background: 'oklch(0.96 0.005 250)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} color="oklch(0.45 0.01 250)" />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              {viewLoading
                ? <Skeleton active paragraph={{ rows: 8 }} />
                : <InvoiceTemplate invoice={viewInv} config={config} />
              }
            </div>
          </div>
        </div>
      )}

      {/* ── Config modal ───────────────────────────────────────── */}
      <ConfigModal
        open={showConfig}
        config={config}
        onClose={() => setShowConfig(false)}
        onSaved={nc => { setConfig(nc); setShowConfig(false); }}
      />

      {/* ── CSS keyframes ──────────────────────────────────────── */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        .row-dirty td { background: oklch(0.99 0.018 80) !important; }
        .row-error td { background: oklch(0.99 0.015 20) !important; }
        .ant-table-cell { font-size: 13px !important; }
        .ant-table-thead .ant-table-cell {
          background: oklch(0.985 0.004 250) !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          color: oklch(0.45 0.01 250) !important;
        }
      `}</style>
    </div>
  );
}
