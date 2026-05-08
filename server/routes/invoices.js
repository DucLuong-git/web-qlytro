const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const ConfigService = require('../models/ConfigService');
const Room = require('../models/Room');
const { upload, uploadToCloudinary } = require('../middleware/cloudinaryUpload');
const { sendInvoiceEmail, buildZaloTemplate } = require('../middleware/mailer');

// ─── Helper ───────────────────────────────────────────────────────
const calcTotal = (invoice) => {
  const electricTotal = (invoice.electric?.usage || 0) * (invoice.electric?.price || 0);
  const waterTotal    = (invoice.water?.usage || 0)    * (invoice.water?.price    || 0);
  const servicesTotal = (invoice.services || []).reduce((acc, s) => acc + (s.amount || 0), 0);
  return (invoice.roomFee || 0) + electricTotal + waterTotal + servicesTotal;
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/invoices — List hóa đơn (có lọc theo period, status, roomId)
// ═══════════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const { period, status, roomId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (period)  filter.period  = period;
    if (status)  filter.status  = status;
    if (roomId)  filter.roomId  = roomId;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('roomId', 'name address district price')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Invoice.countDocuments(filter),
    ]);

    res.json({ success: true, data: invoices, total, page: Number(page) });
  } catch (err) {
    console.error('[GET /invoices]', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách hóa đơn.' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// GET /api/invoices/config — Lấy config giá mới nhất
// ═══════════════════════════════════════════════════════════════════
router.get('/config', async (req, res) => {
  try {
    const config = await ConfigService.findOne().sort({ effectiveDate: -1 });
    if (!config) {
      return res.status(404).json({ success: false, message: 'Chưa có cấu hình giá.' });
    }
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// PUT /api/invoices/config — Tạo hoặc cập nhật config giá
// ═══════════════════════════════════════════════════════════════════
router.put('/config', async (req, res) => {
  try {
    const config = new ConfigService({ ...req.body, effectiveDate: new Date() });
    await config.save();
    res.json({ success: true, data: config, message: 'Cập nhật đơn giá thành công.' });
  } catch (err) {
    console.error('[PUT /invoices/config]', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// GET /api/invoices/smart-fetch?period=YYYY-MM — Smart Fetch oldIndex
// Trả về: danh sách phòng kèm oldIndex (= newIndex tháng trước)
// ═══════════════════════════════════════════════════════════════════
router.get('/smart-fetch', async (req, res) => {
  try {
    const { period } = req.query;
    if (!period) return res.status(400).json({ success: false, message: 'Thiếu period.' });

    // Tính period tháng trước
    const [year, month] = period.split('-').map(Number);
    const prevMonth  = month === 1  ? 12    : month - 1;
    const prevYear   = month === 1  ? year - 1 : year;
    const prevPeriod = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    // Lấy tất cả phòng
    const rooms = await Room.find({}, 'name address district price status');

    // Lấy hóa đơn tháng trước (nếu có) để lấy newIndex làm oldIndex
    const prevInvoices = await Invoice.find({ period: prevPeriod });
    const prevMap = {};
    prevInvoices.forEach(inv => {
      prevMap[inv.roomId.toString()] = {
        electricOld: inv.electric?.newIndex || 0,
        waterOld:    inv.water?.newIndex    || 0,
      };
    });

    // Lấy hóa đơn kỳ hiện tại (nếu đã tạo)
    const currentInvoices = await Invoice.find({ period });
    const currentMap = {};
    currentInvoices.forEach(inv => { currentMap[inv.roomId.toString()] = inv; });

    // Config giá mới nhất
    const config = await ConfigService.findOne().sort({ effectiveDate: -1 });

    const result = rooms.map(room => {
      const rId    = room._id.toString();
      const prev   = prevMap[rId]    || { electricOld: 0, waterOld: 0 };
      const curr   = currentMap[rId] || null;

      return {
        room:          { _id: room._id, name: room.name, address: room.address, district: room.district, price: room.price, status: room.status },
        invoiceId:     curr?._id || null,
        invoiceStatus: curr?.status || null,
        electric: {
          oldIndex: curr?.electric?.oldIndex ?? prev.electricOld,
          newIndex: curr?.electric?.newIndex ?? null,
          price:    curr?.electric?.price    ?? config?.electricPrice ?? 3500,
        },
        water: {
          oldIndex: curr?.water?.oldIndex ?? prev.waterOld,
          newIndex: curr?.water?.newIndex ?? null,
          price:    curr?.water?.price    ?? config?.waterPrice ?? 15000,
        },
        services:    curr?.services    || [],
        roomFee:     curr?.roomFee     ?? room.price,
        totalAmount: curr?.totalAmount ?? 0,
        evidenceImages: curr?.evidenceImages || [],
      };
    });

    res.json({ success: true, data: result, period, prevPeriod, config });
  } catch (err) {
    console.error('[GET /invoices/smart-fetch]', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// GET /api/invoices/:id — Chi tiết 1 hóa đơn
// ═══════════════════════════════════════════════════════════════════
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('roomId', 'name address district price');
    if (!invoice) return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn.' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// POST /api/invoices — Tạo hóa đơn mới
// ═══════════════════════════════════════════════════════════════════
router.post('/', async (req, res) => {
  try {
    const body = req.body;

    // Tính usage + total
    if (body.electric) {
      body.electric.usage = (body.electric.newIndex || 0) - (body.electric.oldIndex || 0);
      body.electric.total = body.electric.usage * (body.electric.price || 0);
    }
    if (body.water) {
      body.water.usage = (body.water.newIndex || 0) - (body.water.oldIndex || 0);
      body.water.total = body.water.usage * (body.water.price || 0);
    }

    const invoice = new Invoice(body);
    invoice.totalAmount = calcTotal(invoice);
    await invoice.save();

    const populated = await invoice.populate('roomId', 'name address district price');
    res.status(201).json({ success: true, data: populated, message: 'Tạo hóa đơn thành công.' });
  } catch (err) {
    console.error('[POST /invoices]', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Hóa đơn kỳ này đã tồn tại cho phòng.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// PUT /api/invoices/bulk-save — Lưu tập trung nhiều hóa đơn 1 lúc
// Body: { period, invoices: [ { roomId, electric, water, services, roomFee, note } ] }
// ═══════════════════════════════════════════════════════════════════
router.put('/bulk-save', async (req, res) => {
  try {
    const { period, invoices: rows } = req.body;
    if (!period || !Array.isArray(rows)) {
      return res.status(400).json({ success: false, message: 'Thiếu period hoặc danh sách hóa đơn.' });
    }

    const config = await ConfigService.findOne().sort({ effectiveDate: -1 });

    const ops = rows.map(row => {
      const electricUsage = (row.electric?.newIndex || 0) - (row.electric?.oldIndex || 0);
      const waterUsage    = (row.water?.newIndex    || 0) - (row.water?.oldIndex    || 0);

      const doc = {
        roomId:  row.roomId,
        period,
        electric: {
          oldIndex: row.electric?.oldIndex || 0,
          newIndex: row.electric?.newIndex || 0,
          usage:    Math.max(0, electricUsage),
          price:    row.electric?.price || config?.electricPrice || 3500,
          total:    Math.max(0, electricUsage) * (row.electric?.price || config?.electricPrice || 3500),
        },
        water: {
          oldIndex: row.water?.oldIndex || 0,
          newIndex: row.water?.newIndex || 0,
          usage:    Math.max(0, waterUsage),
          price:    row.water?.price || config?.waterPrice || 15000,
          total:    Math.max(0, waterUsage) * (row.water?.price || config?.waterPrice || 15000),
        },
        roomFee:  row.roomFee || 0,
        services: row.services || [],
        note:     row.note || '',
        configSnapshot: {
          electricPrice: config?.electricPrice || 3500,
          waterPrice:    config?.waterPrice    || 15000,
        },
      };

      // Tính tổng
      const servicesTotal = doc.services.reduce((a, s) => a + (s.amount || 0), 0);
      doc.totalAmount = doc.roomFee + doc.electric.total + doc.water.total + servicesTotal;

      return {
        updateOne: {
          filter: { roomId: row.roomId, period },
          update: { $set: doc },
          upsert: true,
        },
      };
    });

    const result = await Invoice.bulkWrite(ops);
    res.json({
      success: true,
      message: `Đã lưu ${result.upsertedCount + result.modifiedCount} hóa đơn.`,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    console.error('[PUT /invoices/bulk-save]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// PUT /api/invoices/:id — Cập nhật hóa đơn
// ═══════════════════════════════════════════════════════════════════
router.put('/:id', async (req, res) => {
  try {
    const body = req.body;

    if (body.electric) {
      body.electric.usage = (body.electric.newIndex || 0) - (body.electric.oldIndex || 0);
      body.electric.total = Math.max(0, body.electric.usage) * (body.electric.price || 0);
    }
    if (body.water) {
      body.water.usage = (body.water.newIndex || 0) - (body.water.oldIndex || 0);
      body.water.total = Math.max(0, body.water.usage) * (body.water.price || 0);
    }

    // Tính lại tổng
    const servicesTotal = (body.services || []).reduce((a, s) => a + (s.amount || 0), 0);
    body.totalAmount =
      (body.roomFee || 0) +
      (body.electric?.total || 0) +
      (body.water?.total    || 0) +
      servicesTotal;

    if (body.status === 'Paid' && !body.paidAt) body.paidAt = new Date();

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('roomId', 'name address district price');

    if (!invoice) return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn.' });

    res.json({ success: true, data: invoice, message: 'Cập nhật hóa đơn thành công.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// POST /api/invoices/:id/upload-evidence — Upload ảnh minh chứng
// ═══════════════════════════════════════════════════════════════════
router.post('/:id/upload-evidence', upload.single('evidence'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('roomId', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn.' });

    if (!req.file) return res.status(400).json({ success: false, message: 'Thiếu file ảnh.' });

    const roomName = invoice.roomId?.name || `Room_${invoice.roomId}`;
    const url = await uploadToCloudinary(req.file.buffer, roomName);

    invoice.evidenceImages.push(url);
    await invoice.save();

    res.json({ success: true, url, message: 'Upload ảnh thành công.' });
  } catch (err) {
    console.error('[POST /invoices/:id/upload-evidence]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// POST /api/invoices/:id/send-notification — Gửi email + Zalo template
// ═══════════════════════════════════════════════════════════════════
router.post('/:id/send-notification', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('roomId', 'name address price');
    if (!invoice) return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn.' });

    const config = await ConfigService.findOne().sort({ effectiveDate: -1 });
    const [year, month] = invoice.period.split('-');
    const deadline = `15/${month}/${year}`;

    const details = [
      { name: 'Tiền phòng',  amount: invoice.roomFee },
      { name: `Tiền điện (${invoice.electric?.usage || 0} kWh × ${(invoice.electric?.price || 0).toLocaleString('vi-VN')} ₫)`, amount: invoice.electric?.total },
      { name: `Tiền nước (${invoice.water?.usage || 0} m³ × ${(invoice.water?.price || 0).toLocaleString('vi-VN')} ₫)`,       amount: invoice.water?.total },
      ...(invoice.services || []).map(s => ({ name: s.name, amount: s.amount })),
    ];

    const zaloText = buildZaloTemplate({
      roomName:    invoice.roomId?.name || '',
      period:      invoice.period,
      totalAmount: invoice.totalAmount,
      details,
      bankInfo:    config?.bankInfo || {},
      deadline,
    });

    // Gửi email (nếu có email trong req.body)
    if (req.body.email) {
      await sendInvoiceEmail({
        to:          req.body.email,
        roomName:    invoice.roomId?.name,
        period:      invoice.period,
        totalAmount: invoice.totalAmount,
        details,
        deadline,
      });
    }

    res.json({ success: true, zaloText, message: 'Gửi thông báo thành công.' });
  } catch (err) {
    console.error('[POST /invoices/:id/send-notification]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// DELETE /api/invoices/:id
// ═══════════════════════════════════════════════════════════════════
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn.' });
    res.json({ success: true, message: 'Đã xóa hóa đơn.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
