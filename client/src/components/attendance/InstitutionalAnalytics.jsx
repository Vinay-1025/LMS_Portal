import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from 'recharts';

const InstitutionalAnalytics = ({ stats }) => {
  if (!stats || !stats.deptStats) return null;

  const COLORS = ['#4f8ef7', '#7c5ef7', '#f76e4f', '#4ff7b8', '#f7c84f'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '24px' }}>Attendance by Department</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.deptStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: 'var(--text3)'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: 'var(--text3)'}} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {stats.deptStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Compliance Summary</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="compliance-row">
            <span>High Compliance (&gt; 85%)</span>
            <div className="progress-bar-container"><div className="progress-bar green" style={{ width: '70%' }}></div></div>
            <span className="count">70%</span>
          </div>
          <div className="compliance-row">
            <span>Borderline (75-85%)</span>
            <div className="progress-bar-container"><div className="progress-bar yellow" style={{ width: '20%' }}></div></div>
            <span className="count">20%</span>
          </div>
          <div className="compliance-row">
            <span>At-Risk (&lt; 75%)</span>
            <div className="progress-bar-container"><div className="progress-bar red" style={{ width: '10%' }}></div></div>
            <span className="count">10%</span>
          </div>
        </div>
        
        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(79, 142, 247, 0.05)', borderRadius: '12px', border: '1px dashed var(--accent)' }}>
          <p style={{ fontSize: '11px', color: 'var(--text2)', fontStyle: 'italic' }}>Institutional compliance is 8% higher than last month. Trends suggest improved student engagement in Engineering and Arts departments.</p>
        </div>
      </div>

      <style>{`
        .compliance-row { display: flex; flex-direction: column; gap: 4px; }
        .compliance-row span { font-size: 11px; color: var(--text3); }
        .compliance-row .count { color: var(--text); font-weight: 700; }
        .progress-bar-container { height: 6px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
        .progress-bar { height: 100%; border-radius: 3px; }
        .progress-bar.green { background: var(--accent4); }
        .progress-bar.yellow { background: var(--accent5); }
        .progress-bar.red { background: var(--accent3); }
      `}</style>
    </div>
  );
};

export default InstitutionalAnalytics;
