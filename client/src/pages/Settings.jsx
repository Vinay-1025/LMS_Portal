import Layout from '../components/Layout';
import { User, Bell, Shield, Globe, Monitor, Mail, HelpCircle, Save, Moon, Sun, ChevronRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../features/themeSlice';
import '../styles/theme.css';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const settingsSections = [
    { id: 'profile', icon: <User size={20} />, title: 'Account Profile', desc: 'Personal info, avatar, and contact details' },
    { id: 'security', icon: <Shield size={20} />, title: 'Security & Password', desc: 'Two-factor auth and active sessions' },
    { id: 'notifications', icon: <Bell size={20} />, title: 'Notifications', desc: 'Discord/Slack integration and email alerts' },
    { id: 'appearance', icon: <Monitor size={20} />, title: 'Theme & Appearance', desc: 'Dark mode, accent colors and animations' },
    { id: 'connections', icon: <Globe size={20} />, title: 'External Connections', desc: 'GitHub, Google and LinkedIn' },
    { id: 'help', icon: <HelpCircle size={20} />, title: 'Help & Support', desc: 'Documentation, FAQ and support tickets' }
  ];

  return (
    <Layout title="Settings / Configuration Portal">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
        {/* Navigation List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {settingsSections.map((sec, i) => (
            <div key={i} className="glass-card" style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              border: sec.id === 'profile' ? '1px solid var(--accent)' : '1px solid var(--border)',
              transition: 'var(--transition)'
            }}>
              <div style={{ color: sec.id === 'profile' ? 'var(--accent)' : 'var(--text3)' }}>{sec.icon}</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>{sec.title}</h4>
                <p style={{ fontSize: '11px', color: 'var(--text3)' }}>{sec.desc}</p>
              </div>
              <ChevronRight size={16} color="var(--text3)" />
            </div>
          ))}
        </div>

        {/* Content Area (Appearance Example) */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Appearance Settings</h2>
            <button className="premium-btn" style={{ padding: '8px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> Save Changes
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Theme Toggle Section */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Monitor size={18} color="var(--accent)" /> Dynamic Theme
              </h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div 
                  onClick={() => theme !== 'light' && dispatch(toggleTheme())}
                  style={{
                    flex: 1,
                    padding: '20px',
                    borderRadius: '16px',
                    background: theme === 'light' ? 'rgba(79, 142, 247, 0.1)' : 'var(--bg3)',
                    border: theme === 'light' ? '2px solid var(--accent)' : '1px solid var(--border)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <Sun size={24} color={theme === 'light' ? 'var(--accent)' : 'var(--text3)'} style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', fontWeight: '600' }}>Light Mode</p>
                </div>
                <div 
                  onClick={() => theme !== 'dark' && dispatch(toggleTheme())}
                  style={{
                    flex: 1,
                    padding: '20px',
                    borderRadius: '16px',
                    background: theme === 'dark' ? 'rgba(79, 142, 247, 0.1)' : 'var(--bg3)',
                    border: theme === 'dark' ? '2px solid var(--accent)' : '1px solid var(--border)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <Moon size={24} color={theme === 'dark' ? 'var(--accent)' : 'var(--text3)'} style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', fontWeight: '600' }}>Dark Mode</p>
                </div>
              </div>
            </div>

            {/* Account Info Section */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="var(--accent2)" /> Account Email
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="email" 
                  defaultValue={user?.email}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}
                />
                <button style={{ padding: '0 16px', borderRadius: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                  Verify Email
                </button>
              </div>
            </div>

            {/* Language Section */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="var(--accent4)" /> Default Language
              </h3>
              <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}>
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
