import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../features/themeSlice';
import { toggleMobileMenu } from '../features/layoutSlice';
import { Sun, Moon, Bell, Search, Menu } from 'lucide-react';
import '../styles/theme.css';

const Topbar = ({ title }) => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const { isMobile } = useSelector((state) => state.layout);
  const dispatch = useDispatch();

  return (
    <header className="topbar" style={{
      height: '70px',
      background: 'var(--glass)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: isMobile ? '0 16px' : '0 48px 0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'var(--transition)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isMobile && (
          <button 
            onClick={() => dispatch(toggleMobileMenu())}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text2)',
              marginRight: '4px'
            }}
          >
            <Menu size={20} />
          </button>
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: '700', color: 'var(--text)' }}>{title || 'Dashboard Overview'}</h2>
          {!isMobile && (
            <div style={{
              fontSize: '10px',
              padding: '2px 8px',
              background: 'rgba(79, 142, 247, 0.1)',
              border: '1px solid rgba(79, 142, 247, 0.3)',
              color: 'var(--accent)',
              borderRadius: '20px',
              fontFamily: 'JetBrains Mono, monospace',
              marginTop: '2px',
              width: 'fit-content'
            }}>
              v2.0.0 — 2025
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px' }}>
        {!isMobile && (
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} size={16} />
            <input
              type="text"
              placeholder="Search resources..."
              style={{
                padding: '10px 12px 10px 36px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: '13px',
                outline: 'none',
                width: '180px'
              }}
            />
          </div>
        )}

        <button
          onClick={() => dispatch(toggleTheme())}
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text2)',
            transition: 'var(--transition)'
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {!isMobile && (
          <button style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text2)',
            cursor: 'pointer',
            position: 'relative'
          }}>
            <Bell size={20} />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              background: 'var(--accent3)',
              borderRadius: '50%',
              border: '2px solid var(--bg2)'
            }}></span>
          </button>
        )}

        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: `var(--${user?.role || 'student'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '13px'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
