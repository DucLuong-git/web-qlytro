import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, ShopOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { useThemeStore } from '../../store/themeStore';

const { confirm } = Modal;
const { Title } = Typography;

const RoomManagement = () => {
  const { darkMode } = useThemeStore();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/rooms');
      setRooms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRoom(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRoom(record);
    form.setFieldsValue({
      ...record,
      price: Number(record.price)
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xoá phòng này?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Thao tác này không thể hoàn tác.',
      okText: 'Xoá Bỏ',
      okType: 'danger',
      cancelText: 'Huỷ Định',
      onOk: async () => {
        try {
          await api.delete(`/rooms/${id}`);
          fetchRooms();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, values);
      } else {
        await api.post('/rooms', { ...values, status: 'Available' });
      }
      setModalVisible(false);
      fetchRooms();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Mã Dịch Vụ',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text) => <span className="font-bold text-slate-500">#{text}</span>
    },
    {
      title: 'Tên Phòng / Dịch Vụ',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-bold text-slate-800">{text}</span>
    },
    {
      title: 'Giá Định Mức (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="font-black text-indigo-600">${price}</span>
    },
    {
      title: 'Khu Vực Phân Bổ',
      dataIndex: 'district',
      key: 'district',
      render: (district) => <span className="font-medium text-slate-600">{district || 'Trung Tâm'}</span>
    },
    {
      title: 'Tình Trạng (Status)',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'Available' ? 'green' : status === 'Occupied' ? 'orange' : 'red';
        let text = status === 'Available' ? 'Phòng Trống' : status === 'Occupied' ? 'Đang Thuê' : 'Sửa Chữa';
        return <Tag color={color} className="font-bold px-3 py-1 rounded-md shadow-sm border-0 uppercase tracking-wider">{text}</Tag>;
      },
    },
    {
      title: 'Thao Tác Hệ Thống',
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
             <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
               <ShopOutlined className="text-xl" />
             </div>
             <Title level={3} style={{ margin: 0 }} className={darkMode ? 'text-white' : 'text-slate-800'}>Quản Lý Cơ Sở Dịch Vụ</Title>
          </div>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            size="large"
            className="bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center hover:scale-105 transition-transform"
          >
            Thêm Phòng Mới
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={rooms} 
          rowKey="id" 
          loading={loading} 
          pagination={{ 
            pageSize: 10,
            className: "mt-8",
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total} phòng`
          }}
          className="custom-admin-table"
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={<div className="text-xl font-bold pb-4 border-b border-slate-100 mb-4">{editingRoom ? 'Chỉnh Sửa Dịch Vụ Tồn Tại' : 'Khai Báo Dịch Vụ Mới'}</div>}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText={editingRoom ? "Lưu Thay Đổi" : "Tạo Mới Phòng"}
        cancelText="Đóng"
        okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl" }}
        cancelButtonProps={{ className: "font-bold rounded-xl" }}
        width={600}
        centered
        className="rounded-2xl"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item 
            name="name" 
            label={<span className="font-bold text-slate-700">Tên Biệt Danh Dịch Vụ</span>} 
            rules={[{ required: true, message: 'Hãy nhập tên phòng!' }]}
          >
            <Input size="large" className="rounded-xl border-slate-300 focus:border-indigo-500 font-medium py-3" placeholder="Ví dụ: Luxury Studio Quận 1" />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item 
              name="price" 
              label={<span className="font-bold text-slate-700">Mức Thuê ($ FakeData)</span>} 
              rules={[{ required: true, message: 'Hãy nhập mức giá!' }]}
            >
              <InputNumber 
                size="large" 
                className="w-full rounded-xl border-slate-300 focus:border-indigo-500 font-black py-1.5" 
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value?.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item 
              name="status" 
              label={<span className="font-bold text-slate-700">Trạng Thái (Dành Cho Cập Nhật)</span>} 
              initialValue="Available"
            >
              <Select size="large" className="rounded-xl">
                <Select.Option value="Available"><span className="font-semibold text-emerald-600">Phòng Trống</span></Select.Option>
                <Select.Option value="Occupied"><span className="font-semibold text-orange-600">Đang Thuê</span></Select.Option>
                <Select.Option value="Maintenance"><span className="font-semibold text-red-600">Sửa Chữa</span></Select.Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item 
            name="type" 
            label={<span className="font-bold text-slate-700">Loại Phòng</span>} 
            initialValue="Phòng trọ"
          >
            <Select size="large" className="rounded-xl">
              <Select.Option value="Phòng trọ"><span className="font-semibold text-indigo-600">Phòng Trọ Tiêu Chuẩn</span></Select.Option>
              <Select.Option value="Chung Cư Mini"><span className="font-semibold text-emerald-600">Chung Cư Mini</span></Select.Option>
              <Select.Option value="KTX"><span className="font-semibold text-blue-600">Ký Túc Xá (KTX)</span></Select.Option>
              <Select.Option value="Nhà nguyên căn"><span className="font-semibold text-orange-600">Nhà Nguyên Căn</span></Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="address" 
            label={<span className="font-bold text-slate-700">Vị Trí Đất Đai / Địa Chỉ Toà</span>} 
          >
            <Input size="large" className="rounded-xl border-slate-300 font-medium py-3" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;
