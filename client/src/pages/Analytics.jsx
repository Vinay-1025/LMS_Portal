import Layout from '../components/Layout';
import { BarChart, PieChart, TrendingUp, Users, Calendar as CalendarIcon, Clock, ChevronDown, Download, Filter } from 'lucide-react';
import '../styles/theme.css';

const Analytics = () => {
  const stats = [
    { label: 'Active Users', value: '1,284', icon: <Users size={18} />, color: 'var(--accent)' },
    { label: 'Sessions Today', value: '42', icon: <CalendarIcon size={18} />, color: 'var(--accent4)' },
    { label: 'Avg Study Time', value: '2.5h', icon: <Clock size={18} />, color: 'var(--accent2)' },
    { label: 'Retention Rate', value: '94%', icon: <TrendingUp size={18} />, color: 'var(--accent5)' },
  ];

  return (
    <Layout title="Analytics & Reports / Platform Performance">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text)' }}>
            Last 30 Days <ChevronDown size={14} />
          </div>
          <button style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text2)' }}>
            <Filter size={16} /> Filters
          </button>
        </div>
        <button className="premium-btn" style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={16} /> Export Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {stats.map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ color: s.color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
            <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{s.value}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '32px' }}>User Activity Growth</h3>
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
            {[45, 60, 40, 85, 70, 95, 80, 110, 100, 130, 120, 150].map((h, i) => (
              <div key={i} style={{ flex: 1, background: i === 11 ? 'var(--accent)' : 'var(--bg3)', height: `${(h / 150) * 100}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                {i === 11 && <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg)', border: '1px solid var(--accent)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', color: 'var(--accent)', fontWeight: 'bold' }}>1,284</div>}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <div key={m} style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>{m}</div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '32px' }}>Engagement by Role</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { role: 'Student', count: 850, color: 'var(--student)' },
              { role: 'Tutor', count: 120, color: 'var(--tutor)' },
              { role: 'Management', count: 45, color: 'var(--mgmt)' },
              { role: 'Admin', count: 12, color: 'var(--admin)' }
            ].map((r, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{r.role}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{r.count} users</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(r.count / 850) * 100}%`, height: '100%', background: r.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 142, 247, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}><TrendingUp size={24} /></div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Active Enrollment</h4>
            <p style={{ fontSize: '20px', fontWeight: '800' }}>+24% <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text3)' }}>vs last month</span></p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 247, 184, 0.1)', color: 'var(--accent4)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}><BarChart size={24} /></div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Completion Rate</h4>
            <p style={{ fontSize: '20px', fontWeight: '800' }}>88.5% <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text3)' }}>Platform avg</span></p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(247, 110, 79, 0.1)', color: 'var(--accent3)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}><PieChart size={24} /></div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Resource Saturation</h4>
            <p style={{ fontSize: '20px', fontWeight: '800' }}>76.2GB <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text3)' }}>Cloud storage</span></p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
