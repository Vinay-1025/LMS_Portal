import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { setSidebarCollapsed, setIsMobile } from '../features/layoutSlice';
import '../styles/theme.css';

const Layout = ({ children, title }) => {
  const dispatch = useDispatch();
  const { isCollapsed, isMobile } = useSelector((state) => state.layout);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const collapsed = width >= 768 && width <= 1024;

      dispatch(setIsMobile(mobile));
      dispatch(setSidebarCollapsed(collapsed));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  const getMarginLeft = () => {
    if (isMobile) return '0px';
    return isCollapsed ? '80px' : '240px';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{
        marginLeft: getMarginLeft(),
        flex: 1,
        minWidth: 0,
        transition: 'var(--transition)'
      }}>
        <Topbar title={title} />
        <div className="content" style={{
          padding: isMobile ? '20px' : '40px 48px',
          background: 'var(--bg)',
          animation: 'fadeUp 0.6s ease'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
