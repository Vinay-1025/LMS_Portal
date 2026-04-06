import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, BookOpen,
  Calendar, CheckSquare, Code, Video, FileText,
  Trophy, MessageSquare, BarChart, Settings,
  LogOut, ShieldCheck, X
} from 'lucide-react';
import { logout } from '../features/authSlice';
import { closeMobileMenu } from '../features/layoutSlice';
import '../styles/theme.css';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const { isCollapsed, isMobile, isMobileMenuOpen } = useSelector((state) => state.layout);
  const dispatch = useDispatch();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', roles: ['admin', 'management', 'tutor', 'student', 'member'] },
    { name: 'Courses', icon: <BookOpen size={20} />, path: '/courses', roles: ['admin', 'management', 'tutor', 'student', 'member'] },
    { name: 'Attendance', icon: <Calendar size={20} />, path: '/attendance', roles: ['admin', 'management', 'tutor', 'student', 'member'] },
    { name: 'Leaves', icon: <FileText size={20} />, path: '/leaves', roles: ['admin', 'management', 'tutor', 'student', 'member'] },
    { name: 'Assessments', icon: <CheckSquare size={20} />, path: '/assessments', roles: ['admin', 'tutor', 'student', 'member'] },
    { name: 'Coding Labs', icon: <Code size={20} />, path: '/labs', roles: ['admin', 'tutor', 'student', 'member'] },
    { name: 'Video Meets', icon: <Video size={20} />, path: '/meets', roles: ['admin', 'management', 'tutor', 'student', 'member'] },
    { name: 'Marks & Results', icon: <Trophy size={20} />, path: '/marks', roles: ['admin', 'management', 'tutor', 'student', 'member'] },
    { name: 'Communication', icon: <MessageSquare size={20} />, path: '/chat', roles: ['admin', 'management', 'tutor', 'student', 'member'] },
    { name: 'Analytics', icon: <BarChart size={20} />, path: '/analytics', roles: ['admin', 'management', 'tutor'] },
    { name: 'Course Management', icon: <GraduationCap size={20} />, path: '/management', roles: ['admin', 'tutor'] },
    { name: 'User Management', icon: <ShieldCheck size={20} />, path: '/users', roles: ['admin', 'management'] },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings', roles: ['admin', 'management'] },
  ];

  const filteredItems = menuItems.filter(item => {
    // Hide Labs on mobile as requested
    if (isMobile && item.name === 'Coding Labs') return false;
    
    return item.roles.some(role => role.toLowerCase() === (user?.role || '').toLowerCase());
  });

  const handleLogout = () => {
    dispatch(logout());
  };

  const sidebarWidth = isCollapsed ? '80px' : '240px';
  const isHidden = isMobile && !isMobileMenuOpen;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          onClick={() => dispatch(closeMobileMenu())}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 90,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.3s ease'
          }}
        />
      )}

      <aside className="sidebar" style={{
        width: isMobile ? '240px' : sidebarWidth,
        height: '100vh',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: isHidden ? '-240px' : 0,
        top: 0,
        zIndex: 100,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isMobile && isMobileMenuOpen ? '10px 0 30px rgba(0,0,0,0.2)' : 'none'
      }}>
        <div style={{ 
          padding: isCollapsed && !isMobile ? '28px 20px' : '28px 24px', 
          borderBottom: '1px solid var(--border)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              borderRadius: '10px',
              display: 'flex',
              flexItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <GraduationCap color="white" size={20} style={{ alignSelf: 'center' }} />
            </div>
            {(!isCollapsed || isMobile) && (
              <span className="logo-name" style={{
                fontSize: '20px',
                fontWeight: '800',
                fontFamily: 'Syne, sans-serif',
                background: 'linear-gradient(90deg, var(--text), var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap'
              }}>EduNexus</span>
            )}
          </div>
          {(!isCollapsed || isMobile) && (
            <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>Platform v2.0</p>
          )}

          {isMobile && isMobileMenuOpen && (
            <button 
              onClick={() => dispatch(closeMobileMenu())}
              style={{
                position: 'absolute',
                right: '16px',
                top: '28px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text2)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
          {filteredItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => isMobile && dispatch(closeMobileMenu())}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              title={isCollapsed && !isMobile ? item.name : ''}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isCollapsed && !isMobile ? '12px 0' : '12px 24px',
                justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                background: isActive ? 'rgba(79, 142, 247, 0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'var(--transition)'
              })}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {(!isCollapsed || isMobile) && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: isCollapsed && !isMobile ? '20px 10px' : '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: isCollapsed && !isMobile ? '8px' : '12px',
            borderRadius: '12px',
            background: 'var(--bg3)',
            marginBottom: '16px',
            justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '12px',
              flexShrink: 0
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {(!isCollapsed || isMobile) && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>{user?.role}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
              border: 'none',
              background: 'transparent',
              color: 'var(--accent3)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'var(--transition)'
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {(!isCollapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
