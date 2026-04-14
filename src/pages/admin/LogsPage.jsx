import { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag } from 'antd';
import { HistoryOutlined, FieldTimeOutlined, UserOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { useThemeStore } from '../../store/themeStore';

const { Title } = Typography;

const LogsPage = () => {
  const { darkMode } = useThemeStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Vì JSON-Server đang chưa có logs thực, tôi sẽ seed 1 vài data nếu array rỗng
      const { data } = await api.get('/logs');
      if (data.length === 0) {
        const dummyLogs = [
           { id: 1, user: 'Admin Master', role: 'ADMIN', action: 'CREATE', module: 'Room Management', details: 'Added new room "Sunset Condo"', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
           { id: 2, user: 'Staff Manager', role: 'STAFF', action: 'UPDATE', module: 'Tenant Management', details: 'Updated tenant information ID: T-2', timestamp: new Date(Date.now() - 1800000 * 1).toISOString() },
           { id: 3, user: 'Admin Master', role: 'ADMIN', action: 'DELETE', module: 'Room Management', details: 'Deleted room ID: 5', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
           { id: 4, user: 'System (CronJob)', role: 'SYSTEM', action: 'AUTOMATION', module: 'Billing', details: 'Auto-generated end-of-month invoices for 12 tenants', timestamp: new Date(Date.now() - 400000).toISOString() },
        ];
        // Lưu ảo về DB
        for (const log of dummyLogs) {
          await api.post('/logs', log);
        }
        setLogs(dummyLogs);
      } else {
        // Sort newest first
        setLogs(data.reverse());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã Dấu Vết',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text) => <span className="font-bold text-slate-500 text-xs">LOG-{text}</span>
    },
    {
      title: 'Người Thực Hiện',
      dataIndex: 'user',
      key: 'user',
      width: 250,
      render: (text, record) => (
        <div className="flex items-center gap-2">
           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${record.role === 'SYSTEM' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
              <UserOutlined />
           </div>
           <div className="flex flex-col">
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{text}</span>
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{record.role}</span>
           </div>
        </div>
      )
    },
    {
      title: 'Hành Động',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action) => {
        const colors = {
          CREATE: 'green',
          UPDATE: 'blue',
          DELETE: 'red',
          AUTOMATION: 'purple'
        };
        const text = {
          CREATE: 'Thêm Mới',
          UPDATE: 'Sửa Đổi',
          DELETE: 'Xoá Bỏ',
          AUTOMATION: 'CronJob Tự Động'
        };
        return <Tag color={colors[action]} className="font-bold px-3 py-1 border-0 shadow-sm rounded-md tracking-wider">{text[action] || action}</Tag>;
      }
    },
    {
      title: 'Khu Vực Phân Hệ (Module)',
      dataIndex: 'module',
      key: 'module',
      width: 200,
      render: (module) => <span className={`font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{module}</span>
    },
    {
      title: 'Chi Tiết Thao Tác',
      dataIndex: 'details',
      key: 'details',
      render: (details) => <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{details}</span>
    },
    {
      title: 'Thời Gian Thực Thi',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (time) => (
        <span className="flex items-center text-slate-500 font-medium text-xs">
          <FieldTimeOutlined className="mr-1.5" /> 
          {new Date(time).toLocaleString('vi-VN')}
        </span>
      )
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <Card 
        bordered={false} 
        className={`shadow-xl rounded-3xl overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'border-slate-100'}`}
        title={
          <div className="flex items-center gap-3 py-4">
             <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
               <HistoryOutlined className="text-xl" />
             </div>
             <div>
                <Title level={3} style={{ margin: 0 }} className={darkMode ? 'text-white' : 'text-slate-800'}>Nhật Ký Thao Tác Hệ Thống (Audit Logs)</Title>
                <div className={`text-sm font-medium mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tất cả các thay đổi về dữ liệu đều được lưu vết bảo mật nhằm chống huỷ hoại thông tin.</div>
             </div>
          </div>
        }
      >
        <Table 
          columns={columns} 
          dataSource={logs} 
          rowKey="id" 
          loading={loading} 
          scroll={{ x: 'max-content' }}
          pagination={{ 
            pageSize: 12,
            className: "mt-8",
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của tổng ${total} truy xuất`
          }}
          className="custom-admin-table audit-logs-table"
        />
      </Card>
    </div>
  );
};

export default LogsPage;
