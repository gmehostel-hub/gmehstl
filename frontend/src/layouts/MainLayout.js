import React, { useState, useMemo } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CommentIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  DashboardIcon,
  BuildingIcon
} from '../components/icons';

const NavLink = ({ to, icon, text, isCollapsed, isMobile, isActive, onClick }) => (
  <li>
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center py-3 px-4 rounded-md transition-colors text-sm font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
      {React.cloneElement(icon, { className: `h-6 w-6 ${!isCollapsed || isMobile ? 'mr-3' : 'mx-auto'}` })}
      {(!isCollapsed || isMobile) && <span>{text}</span>}
    </Link>
  </li>
);

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = useMemo(() => {
    const commonItems = [
      { path: '/profile', name: 'Profile', icon: <UserIcon /> },
    ];

    const roleItems = {
      admin: [
        { path: '/admin/dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/admin/rooms', name: 'Manage Rooms', icon: <BuildingIcon /> },
        { path: '/admin/books', name: 'Library', icon: <BookOpenIcon /> },
        { path: '/admin/placements', name: 'Placements', icon: <BriefcaseIcon /> },
        { path: '/admin/feedback', name: 'Feedback', icon: <CommentIcon /> },
      ],
      warden: [
        { path: '/warden/dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/warden/rooms', name: 'Room Details', icon: <BuildingIcon /> },
        { path: '/warden/library', name: 'Library Details', icon: <BookOpenIcon /> },
        { path: '/warden/placements', name: 'Placement Details', icon: <BriefcaseIcon /> },
        { path: '/warden/feedback', name: 'View Feedback', icon: <CommentIcon /> },
      ],
      student: [
        { path: '/my-room', name: 'My Room', icon: <HomeIcon /> },
        { path: '/student/library', name: 'Library', icon: <BookOpenIcon /> },
        { path: '/student/placements', name: 'Placements', icon: <BriefcaseIcon /> },
        { path: '/feedback', name: 'Feedback', icon: <CommentIcon /> },
      ],
    };

    return [...(roleItems[user?.role] || []), ...commonItems];
  }, [user?.role]);

  const currentPageName = navItems.find(item => location.pathname.startsWith(item.path))?.name || '';

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDesktopSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700">
          {(!isDesktopSidebarCollapsed) && <h1 className="text-xl font-bold text-white">GMEBH</h1>}
          <button
            onClick={() => setDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            className="text-white p-1 rounded-md hover:bg-gray-700 focus:outline-none hidden md:block">
            {isDesktopSidebarCollapsed ? <ArrowRightIcon className="h-6 w-6" /> : <ArrowLeftIcon className="h-6 w-6" />}
          </button>
        </div>
        <nav className="flex flex-col flex-1 p-2 space-y-2">
          <ul className="flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                icon={item.icon}
                text={item.name}
                isCollapsed={isDesktopSidebarCollapsed}
                isMobile={false}
                isActive={location.pathname.startsWith(item.path)}
                onClick={() => isMobileSidebarOpen && setMobileSidebarOpen(false)}
              />
            ))}
          </ul>
          <div>
            <button
              onClick={handleLogout}
              className="flex items-center py-3 px-4 w-full text-left rounded-md transition-colors text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              <LogoutIcon className={`h-6 w-6 ${!isDesktopSidebarCollapsed ? 'mr-3' : 'mx-auto'}`} />
              {!isDesktopSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */} 
      {isMobileSidebarOpen && <div className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" onClick={() => setMobileSidebarOpen(false)}></div>}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-20">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => setMobileSidebarOpen(true)} className="text-gray-500 focus:outline-none md:hidden mr-4">
                <MenuIcon className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 hidden md:block">
                {currentPageName}
              </h2>
            </div>
            <div className="flex items-center">
              <span className="mr-3 text-sm text-gray-600 hidden sm:inline">
                {user?.name} ({user?.role})
              </span>
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;