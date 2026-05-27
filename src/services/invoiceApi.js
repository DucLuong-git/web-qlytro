import axios from 'axios';

// Relative path — goes through Vite proxy in dev, direct in prod
const invoiceApi = axios.create({ baseURL: '/api/invoices', timeout: 30000 });

// Attach auth token
invoiceApi.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Invoice endpoints ────────────────────────────────────────────
export const fetchInvoices     = (params) => invoiceApi.get('/', { params }).then(r => r.data);
export const fetchInvoiceById  = (id)     => invoiceApi.get(`/${id}`).then(r => r.data);
export const createInvoice     = (data)   => invoiceApi.post('/', data).then(r => r.data);
export const updateInvoice     = (id, data) => invoiceApi.put(`/${id}`, data).then(r => r.data);
export const deleteInvoice     = (id)     => invoiceApi.delete(`/${id}`).then(r => r.data);

// Lưu tập trung nhiều hóa đơn
export const bulkSaveInvoices  = (payload) => invoiceApi.put('/bulk-save', payload).then(r => r.data);

// Smart Fetch: lấy danh sách phòng + oldIndex tự động
export const smartFetchInvoices = (period) => invoiceApi.get('/smart-fetch', { params: { period } }).then(r => r.data);

// Config giá
export const fetchConfig  = ()     => invoiceApi.get('/config').then(r => r.data);
export const updateConfig = (data) => invoiceApi.put('/config', data).then(r => r.data);

// Upload ảnh minh chứng
export const uploadEvidence = (invoiceId, file) => {
  const form = new FormData();
  form.append('evidence', file);
  return invoiceApi.post(`/${invoiceId}/upload-evidence`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

// Gửi thông báo email + lấy Zalo template
export const sendNotification = (invoiceId, { email } = {}) =>
  invoiceApi.post(`/${invoiceId}/send-notification`, { email }).then(r => r.data);

// VietQR — sinh QR động từ vietqr.io
export const buildVietQrUrl = ({ bankId, accountNo, amount, content }) => {
  const encoded = encodeURIComponent(content);
  return `https://qr.sepay.vn/img?acc=${accountNo}&bank=${bankId}&amount=${amount}&des=${encoded}`;
};
