import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import { Video, Plus, Calendar as CalendarIcon, Users, Clock, Play, MoreVertical, Search, Filter } from 'lucide-react';
import '../styles/theme.css';

const Meets = () => {
  const { isMobile } = useSelector((state) => state.layout);

  const sessions = [
    { title: 'Full-Stack Web Dev Review', course: 'Web Development', time: '10:00 AM - 11:30 AM', date: 'Today', status: 'Live', participants: 42, icon: <Video size={20} color="var(--accent4)" /> },
    { title: 'Data Structures Office Hours', course: 'Computer Science', time: '02:00 PM - 03:00 PM', date: 'Today', status: 'Upcoming', participants: 0, icon: <Users size={20} color="var(--accent)" /> },
    { title: 'Project Demo Session', course: 'UI/UX Design', time: '09:00 AM - 10:30 AM', date: 'Tomorrow', status: 'Upcoming', participants: 0, icon: <Video size={20} color="var(--accent2)" /> },
    { title: 'Intro to SQL (Rec)', course: 'Databases', time: 'Mar 25', date: 'Recorded', status: 'Recorded', participants: 85, icon: <Play size={20} color="var(--accent5)" /> }
  ];

  return (
    <Layout title="Video Meets / Interactive Sessions">
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        marginBottom: '32px',
        gap: '20px'
      }}>
        <div style={{ position: 'relative', width: isMobile ? '100%' : '400px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} size={18} />
          <input
            type="text"
            placeholder="Search meetings..."
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              borderRadius: '12px',
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              outline: 'none',
              fontSize: isMobile ? '14px' : '16px'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
          <button style={{ 
            flex: isMobile ? 1 : 'none',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px', 
            padding: '12px 20px', 
            borderRadius: '12px', 
            background: 'var(--bg3)', 
            border: '1px solid var(--border)', 
            color: 'var(--text2)', 
            cursor: 'pointer', 
            fontWeight: '600',
            fontSize: '14px'
          }}>
            <Filter size={18} /> Filters
          </button>
          <button className="premium-btn" style={{ 
            flex: isMobile ? 1 : 'none',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px'
          }}>
            <Plus size={18} /> {isMobile ? 'New' : 'Schedule Meet'}
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: isMobile ? '20px' : '24px' 
      }}>
        {sessions.map((session, i) => (
          <div key={i} className="glass-card" style={{ 
            padding: isMobile ? '20px' : '24px', 
            transition: 'var(--transition)', 
            animation: `fadeUp ${0.4 + i * 0.1}s ease` 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--bg3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {session.icon}
              </div>
              <div style={{
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                background: session.status === 'Live' ? 'rgba(79, 247, 184, 0.1)' : 'var(--bg3)',
                border: session.status === 'Live' ? '1px solid var(--accent4)' : '1px solid var(--border)',
                color: session.status === 'Live' ? 'var(--accent4)' : 'var(--text3)'
              }}>
                {session.status}
              </div>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{session.title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '16px' }}>{session.course}</p>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px', 
              marginBottom: '24px', 
              padding: '12px', 
              background: 'var(--bg3)', 
              borderRadius: '12px' 
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> {session.time}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} /> {session.participants > 0 ? `${session.participants}` : '0'} Joined
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {session.status === 'Live' ? (
                <button className="premium-btn" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
                  <Video size={16} /> Join
                </button>
              ) : session.status === 'Recorded' ? (
                <button className="premium-btn" style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
                  <Play size={16} /> Watch
                </button>
              ) : (
                <button style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
                  Set Reminder
                </button>
              )}
              <button style={{ padding: '0 12px', borderRadius: '10px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}>
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Meets;
