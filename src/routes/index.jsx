import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import PrivateRoute from '../components/PrivateRoute';
import RoomListPage from '../pages/RoomListPage';
import RoomDetailPage from '../pages/RoomDetailPage';
import ProfilePage from '../pages/ProfilePage';
import PostRoomPage from '../pages/PostRoomPage';
import InfoPage from '../pages/InfoPage';
import ReportPage from '../pages/ReportPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import RoomManagement from '../pages/admin/RoomManagement';
import TenantManagement from '../pages/admin/TenantManagement';
import LogsPage from '../pages/admin/LogsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        path: 'rooms',
        element: <RoomListPage />,
      },
      {
        path: 'rooms/:id',
        element: <RoomDetailPage />,
      },
      {
        path: 'info/:slug',
        element: <InfoPage />,
      },
      {
        path: 'report',
        element: <ReportPage />,
      },
      {
        path: '/',
        element: <PrivateRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'post-room',
            element: <PostRoomPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/admin',
    // We restrict this entire branch to ADMIN and STAFF
    element: <PrivateRoute allowedRoles={['ADMIN', 'STAFF']} />,
    children: [
      {
        path: '',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'rooms',
            element: <RoomManagement />,
          },
          {
            path: 'tenants',
            element: <TenantManagement />,
          },
          {
            path: 'logs',
            element: <LogsPage />,
          },
        ]
      }
    ]
  }
]);
