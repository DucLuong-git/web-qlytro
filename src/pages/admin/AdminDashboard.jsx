import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { HomeOutlined, UserOutlined, DollarOutlined, AppstoreOutlined, DownloadOutlined, RiseOutlined } from '@ant-design/icons';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from 'recharts';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import AIChatbot from '../../components/AIChatbot';
import { useThemeStore } from '../../store/themeStore';
import { motion } from 'framer-motion';
import { TrendingUp, Home, Users, DollarSign, BarChart2 } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
const GRADIENT_IDS = ['indigo', 'emerald', 'amber', 'rose'];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } })
};

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-sm font-medium ${dark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
      <p className="font-extrabold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { darkMode } = useThemeStore();
  const [stats, setStats] = useState({ totalRooms: 0, occupiedRooms: 0, totalTenants: 0, totalRevenue: 0 });
  const [occupancyData, setOccupancyData] = useState([]);
  const [revenueData] = useState([
    { month: 'T1', revenue: 12000, target: 10000 }, { month: 'T2', revenue: 15000, target: 13000 },
    { month: 'T3', revenue: 18000, target: 16000 }, { month: 'T4', revenue: 22000, target: 18000 },
    { month: 'T5', revenue: 20000, target: 19000 }, { month: 'T6', revenue: 26000, target: 22000 },
  ]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, tenantsRes] = await Promise.all([api.get('/rooms'), api.get('/tenants')]);
      const rooms = roomsRes.data;
      const tenants = tenantsRes.data;
      const occupied = rooms.filter(r => r.status === 'Occupied');
      const avail = rooms.filter(r => r.status === 'Available');
      const maint = rooms.filter(r => r.status === 'Maintenance');
      const revenue = occupied.reduce((acc, r) => acc + Number(r.price), 0);

      setStats({ totalRooms: rooms.length, occupiedRooms: occupied.length, totalTenants: tenants.length, totalRevenue: revenue });
      setOccupancyData([
        { name: 'Trống', count: avail.length, fill: '#6366f1' },
        { name: 'Đang Thuê', count: occupied.length, fill: '#10b981' },
        { name: 'Bảo Trì', count: maint.length, fill: '#f59e0b' },
      ]);
      setPieData([
        { name: 'Phòng Trống', value: avail.length },
        { name: 'Đang Thuê', value: occupied.length },
        { name: 'Bảo Trì', value: maint.length },
      ]);
    } catch (err) { console.error(err); }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([stats]), 'Thống Kê');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(revenueData), 'Doanh Thu');
    XLSX.writeFile(wb, 'BaoCao_DucLuongHome.xlsx');
  };

  const statCards = [
    { title: 'Tổng Số Phòng', value: stats.totalRooms, icon: Home, color: 'from-indigo-500 to-violet-600', shadow: 'shadow-indigo-500/30', border: 'border-indigo-500' },
    { title: 'Đang Cho Thuê', value: stats.occupiedRooms, icon: HomeOutlined, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/30', border: 'border-emerald-500' },
    { title: 'Khách Hàng', value: stats.totalTenants, icon: Users, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/30', border: 'border-blue-500' },
    { title: 'Doanh Thu ($)', value: stats.totalRevenue.toLocaleString(), icon: DollarSign, color: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/30', border: 'border-rose-500' },
  ];

  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-500';
  const gridStroke = darkMode ? '#1e293b' : '#f1f5f9';
  const axisStroke = darkMode ? '#64748b' : '#94a3b8';

  return (
    <div>
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${textPrimary}`}>Tổng Quan Hệ Thống</h1>
          <p className={`text-sm mt-1 ${textSecondary}`}>Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}</p>
        </div>
        <Button
          type="primary" icon={<DownloadOutlined />} onClick={exportToExcel} size="large"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-bold border-none rounded-xl shadow-lg shadow-emerald-500/30"
        >
          Xuất Excel
        </Button>
      </motion.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={fadeUp} whileHover={{ y: -6, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
            <div className={`relative overflow-hidden rounded-3xl border-2 p-6 shadow-xl ${card.shadow} ${darkMode ? 'bg-slate-800 border-slate-700' : `bg-white ${card.border}`} cursor-pointer`}>
              {/* BG Glow */}
              <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-xl`} />

              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" style={{ fontSize: '24px', color: '#fff' }} />
                </div>
                <span className="text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12%
                </span>
              </div>
              <p className={`text-sm font-bold mb-1 ${textSecondary}`}>{card.title}</p>
              <p className={`text-3xl font-black tracking-tight ${textPrimary}`}>{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        {/* Area Chart - Revenue */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="xl:col-span-2">
          <div className={`p-6 rounded-3xl border shadow-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-base font-extrabold ${textPrimary}`}>Tăng Trưởng Doanh Thu</h2>
                  <p className={`text-xs ${textSecondary}`}>So sánh thực tế vs mục tiêu</p>
                </div>
              </div>
              <div className={`text-xs font-bold px-3 py-1.5 rounded-xl ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>2026</div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} stroke={axisStroke} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip dark={darkMode} />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
                  <Area type="monotone" dataKey="revenue" name="Thực Tế" stroke="#6366f1" strokeWidth={3} fill="url(#colorRevenue)" dot={{ r: 5, fill: '#6366f1', stroke: darkMode ? '#1e293b' : '#fff', strokeWidth: 2 }} activeDot={{ r: 8, stroke: '#6366f1', strokeWidth: 3 }} />
                  <Area type="monotone" dataKey="target" name="Mục Tiêu" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorTarget)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <div className={`p-6 rounded-3xl border shadow-lg h-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <AppstoreOutlined style={{ fontSize: '20px', color: '#fff' }} />
              </div>
              <div>
                <h2 className={`text-base font-extrabold ${textPrimary}`}>Phân Bổ Phòng</h2>
                <p className={`text-xs ${textSecondary}`}>Tỉ lệ trạng thái hiện tại</p>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value"
                    animationBegin={0} animationDuration={1200}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip dark={darkMode} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span className={textSecondary}>{d.name}</span>
                  </div>
                  <span className={`font-black ${textPrimary}`}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* CHARTS ROW 2 - Bar Chart + Radial */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Bar Chart */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}>
          <div className={`p-6 rounded-3xl border shadow-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <RiseOutlined style={{ fontSize: '20px', color: '#fff' }} />
              </div>
              <div>
                <h2 className={`text-base font-extrabold ${textPrimary}`}>Tỉ Lệ Lấp Đầy</h2>
                <p className={`text-xs ${textSecondary}`}>Phân bổ chi tiết từng trạng thái</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    {occupancyData.map((d, i) => (
                      <linearGradient key={i} id={`bar-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={d.fill} stopOpacity={1} />
                        <stop offset="100%" stopColor={d.fill} stopOpacity={0.5} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke={axisStroke} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip dark={darkMode} />} cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc', radius: 8 }} />
                  <Bar dataKey="count" name="Số Phòng" radius={[10, 10, 0, 0]} barSize={50} animationDuration={1000}>
                    {occupancyData.map((d, i) => (
                      <Cell key={i} fill={`url(#bar-${i})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Radial Progress */}
        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp}>
          <div className={`p-6 rounded-3xl border shadow-lg ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                <UserOutlined style={{ fontSize: '20px', color: '#fff' }} />
              </div>
              <div>
                <h2 className={`text-base font-extrabold ${textPrimary}`}>KPI Hiệu Suất</h2>
                <p className={`text-xs ${textSecondary}`}>Chỉ số vận hành tháng này</p>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%"
                  data={[
                    { name: 'Tỉ Lệ Lấp Đầy', value: stats.totalRooms ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0, fill: '#6366f1' },
                    { name: 'Tỉ Lệ Thu Tiền', value: 87, fill: '#10b981' },
                    { name: 'Hài Lòng KH', value: 94, fill: '#f59e0b' },
                  ]}
                  startAngle={90} endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={8} animationDuration={1200} />
                  <RechartsTooltip content={<CustomTooltip dark={darkMode} />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            {/* KPI list */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { label: 'Lấp Đầy', value: stats.totalRooms ? `${Math.round((stats.occupiedRooms / stats.totalRooms) * 100)}%` : '0%', c: 'text-indigo-500' },
                { label: 'Thu Tiền', value: '87%', c: 'text-emerald-500' },
                { label: 'Hài Lòng', value: '94%', c: 'text-amber-500' },
              ].map((k, i) => (
                <div key={i} className={`text-center p-2.5 rounded-2xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <p className={`text-xl font-black ${k.c}`}>{k.value}</p>
                  <p className={`text-[10px] font-bold ${textSecondary}`}>{k.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <AIChatbot type="admin" />
    </div>
  );
};

export default AdminDashboard;
