import { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Input, Button, Divider, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { updateConfig } from '../../services/invoiceApi';

const ConfigModal = ({ open, config, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config && open) {
      form.setFieldsValue({
        electricPrice: config.electricPrice,
        waterPrice:    config.waterPrice,
        garbagePrice:  config.garbagePrice,
        internetPrice: config.internetPrice,
        parkingPrice:  config.parkingPrice,
        bankId:        config.bankInfo?.bankId,
        accountNo:     config.bankInfo?.accountNo,
        accountName:   config.bankInfo?.accountName,
      });
    }
  }, [config, open, form]);

  const handleSave = async () => {
    const vals = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        electricPrice: vals.electricPrice,
        waterPrice:    vals.waterPrice,
        garbagePrice:  vals.garbagePrice,
        internetPrice: vals.internetPrice,
        parkingPrice:  vals.parkingPrice,
        bankInfo: {
          bankId:      vals.bankId,
          accountNo:   vals.accountNo,
          accountName: vals.accountName,
        },
      };
      const res = await updateConfig(payload);
      message.success('Đã lưu đơn giá!');
      onSaved(res.data);
    } catch (e) {
      message.error('Lỗi: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<span style={{ fontWeight: 800, fontSize: 16, color: '#222' }}>⚙️ Cấu Hình Đơn Giá</span>}
      footer={[
        <Button key="cancel" onClick={onClose} style={{ borderRadius: 8 }}>Huỷ</Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          style={{ background: '#ff385c', borderColor: '#ff385c', borderRadius: 8 }}
        >
          Lưu đơn giá
        </Button>,
      ]}
      width={520}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Divider orientation="left" style={{ fontSize: 13, fontWeight: 700, color: '#6a6a6a' }}>
          Đơn giá tiêu thụ
        </Divider>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item label="⚡ Đơn giá điện (₫/kWh)" name="electricPrice" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%', borderRadius: 8 }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item label="💧 Đơn giá nước (₫/m³)" name="waterPrice" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%', borderRadius: 8 }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item label="🗑 Phí rác (₫/tháng)" name="garbagePrice">
            <InputNumber min={0} style={{ width: '100%', borderRadius: 8 }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item label="🌐 Phí Internet (₫/tháng)" name="internetPrice">
            <InputNumber min={0} style={{ width: '100%', borderRadius: 8 }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item label="🏍 Phí gửi xe (₫/tháng)" name="parkingPrice">
            <InputNumber min={0} style={{ width: '100%', borderRadius: 8 }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
        </div>

        <Divider orientation="left" style={{ fontSize: 13, fontWeight: 700, color: '#6a6a6a' }}>
          Thông tin ngân hàng (VietQR)
        </Divider>

        <Form.Item label="Mã ngân hàng (vd: VCB, TCB, MB)" name="bankId">
          <Input placeholder="VCB" style={{ borderRadius: 8 }} />
        </Form.Item>
        <Form.Item label="Số tài khoản" name="accountNo">
          <Input placeholder="0123456789" style={{ borderRadius: 8 }} />
        </Form.Item>
        <Form.Item label="Tên chủ tài khoản (KHÔNG DẤU)" name="accountName">
          <Input placeholder="CHU NHA TRO" style={{ borderRadius: 8, textTransform: 'uppercase' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigModal;
