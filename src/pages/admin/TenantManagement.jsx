import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UsergroupAddOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { useThemeStore } from '../../store/themeStore';

const { confirm } = Modal;
const { Title } = Typography;

const TenantManagement = () => {
  const { darkMode } = useThemeStore();
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, roomsRes] = await Promise.all([
        api.get('/tenants'),
        api.get('/rooms')
      ]);
      setTenants(tenantsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTenant(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTenant(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Xóa Cư Dân này khỏi hệ thống lưu trữ?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Hợp đồng liên quan (nếu có) cũng sẽ bị lưu trạng thái Cũ. Không thể khôi phục.',
      okText: 'Xoá Bỏ',
      okType: 'danger',
      cancelText: 'Huỷ Định',
      onOk: async () => {
        try {
          await api.delete(`/tenants/${id}`);
          fetchData();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingTenant) {
        await api.put(`/tenants/${editingTenant.id}`, values);
      } else {
        await api.post('/tenants', { ...values, startDate: new Date().toISOString().split('T')[0] });
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text) => <span className="font-bold text-slate-500">T-{text}</span>
    },
    {
      title: 'Tên Khách Hàng (Tenant)',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
           <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase text-xs">{text.substring(0, 2)}</div>
           <span className="font-bold text-slate-800">{text}</span>
        </Space>
      )
    },
    {
      title: 'Thông Tin Liên Hệ',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone, record) => (
         <div>
            <div className="flex items-center text-slate-600 font-medium text-sm mb-1"><PhoneOutlined className="mr-2 text-indigo-500" />{phone}</div>
            <div className="flex items-center text-slate-500 text-xs"><MailOutlined className="mr-2 text-orange-500" />{record.email}</div>
         </div>
      )
    },
    {
      title: 'Phòng Ở Hiện Tại',
      dataIndex: 'roomId',
      key: 'roomId',
      render: (roomId) => {
        const room = rooms.find(r => r.id === roomId);
        return room ? <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">{room.name}</span> : <span className="text-slate-400 italic">Chưa ghép nối</span>;
      },
    },
    {
      title: 'Thao Tác Quản Lý',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-semibold rounded-lg transition-colors"
          >
            Sửa
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            className="hover:bg-red-50 font-semibold rounded-lg transition-colors"
          >
            Xoá
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <Card 
        bordered={false} 
        className={`shadow-xl rounded-3xl overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'border-slate-100'}`}
        title={
          <div className="flex items-center gap-3 py-4">
             <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
               <UsergroupAddOutlined className="text-xl" />
             </div>
             <Title level={3} style={{ margin: 0 }} className={darkMode ? 'text-white' : 'text-slate-800'}>Cơ Sở Dữ Liệu Cư Dân Tập Trung</Title>
          </div>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            size="large"
            className="bg-orange-500 hover:bg-orange-600 font-bold rounded-xl shadow-lg shadow-orange-500/30 flex items-center hover:scale-105 transition-transform border-none"
          >
            Đăng Ký Thành Viên Mới
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={tenants} 
          rowKey="id" 
          loading={loading} 
          pagination={{ 
            pageSize: 10,
            className: "mt-8",
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của tổng ${total} người`
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={<div className="text-xl font-bold pb-4 border-b border-slate-100 mb-4">{editingTenant ? 'Cập Nhật Hồ Sơ Cư Dân' : 'Thêm Khách Hàng (Tenant) Mới'}</div>}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText={editingTenant ? "Lưu Trữ Thông Tin" : "Thêm Cư Dân"}
        cancelText="Bỏ Qua Định Đạng"
        okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl border-none shadow-md shadow-indigo-600/30" }}
        cancelButtonProps={{ className: "font-bold rounded-xl" }}
        width={600}
        centered
        className="rounded-2xl"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item 
              name="name" 
              label={<span className="font-bold text-slate-700">Họ và Tên Đầy Đủ</span>} 
              rules={[{ required: true, message: 'Nhập tên hợp lệ!' }]}
            >
              <Input size="large" className="rounded-xl border-slate-300 focus:border-indigo-500 font-medium py-2.5" placeholder="Ví dụ: Nguyễn Văn ABC..." />
            </Form.Item>
            
            <Form.Item 
              name="phone" 
              label={<span className="font-bold text-slate-700">Số Điện Thoại Yêu Cầu</span>} 
              rules={[{ required: true, message: 'Vui lòng nhập SDT!' }]}
            >
              <Input size="large" className="rounded-xl border-slate-300 focus:border-indigo-500 font-medium py-2.5" placeholder="09xxxx..." />
            </Form.Item>
          </div>
          
          <Form.Item 
            name="email" 
            label={<span className="font-bold text-slate-700">Địa chỉ Email Xác Minh (Vá Hóa Đơn)</span>} 
            rules={[{ required: true, type: 'email', message: 'Hợp lệ một Email!' }]}
          >
            <Input size="large" className="rounded-xl border-slate-300 focus:border-indigo-500 font-medium py-2.5" placeholder="you@domain.com" />
          </Form.Item>

          <Form.Item 
            name="roomId" 
            label={<span className="font-bold text-slate-700">Chỉ Định Phòng (Ràng Buộc Chéo)</span>} 
            rules={[{ required: true, message: 'Chọn dịch vụ khớp nối!' }]}
          >
            <Select size="large" className="rounded-xl" placeholder="-- Chọn Toà Tương Ứng --">
              {rooms.map(room => (
                <Select.Option key={room.id} value={room.id}>
                  <span className="font-semibold">{room.name}</span> <span className="text-slate-400 text-xs ml-2">- ${room.price}</span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TenantManagement;
