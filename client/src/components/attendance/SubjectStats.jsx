import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SubjectStats = ({ stats }) => {
  if (!stats || stats.length === 0) return (
    <div className="empty-stats-container">
      <div className="empty-icon-circle">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p>Awaiting session data to generate performance metrics.</p>
    </div>
  );

  return (
    <div className="subject-stats-wrapper">
      <div className="stats-grid-premium">
        {stats.map((s, i) => {
          const data = [
            { name: 'Present', value: s.percentage },
            { name: 'Remaining', value: 100 - s.percentage }
          ];
          const color = s.percentage >= 85 ? 'var(--accent4)' : s.percentage >= 75 ? 'var(--accent5)' : 'var(--accent3)';

          return (
            <div key={i} className="subject-premium-card" style={{ '--accent-local': color }}>
              <div className="pie-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={34}
                      outerRadius={42}
                      paddingAngle={0}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={10}
                    >
                      <Cell fill={color} />
                      <Cell fill="var(--bg3)" opacity={0.3} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="percentage-overlay">
                  <span className="percent-num">{s.percentage}</span>
                  <span className="percent-symbol">%</span>
                </div>
              </div>
              <div className="subject-info">
                <h4>{s.course}</h4>
                <div className="session-pill">
                  <span className="num-badge">{s.present}</span> sessions recorded
                </div>
              </div>
              
              <div className="card-bg-glow"></div>
            </div>
          );
        })}
      </div>

      <style>{`
        .subject-stats-wrapper { padding: 8px 0; }
        .stats-grid-premium { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px; }
        
        .subject-premium-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; padding: 24px 16px; position: relative; overflow: hidden; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; align-items: center; gap: 16px; min-height: 200px; justify-content: center; }
        .subject-premium-card:hover { transform: translateY(-8px); border-color: rgba(79, 142, 247, 0.4); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }
        .subject-premium-card:hover .card-bg-glow { opacity: 0.05; }
        
        .pie-container { width: 100px; height: 100px; position: relative; }
        .percentage-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: baseline; }
        .percent-num { font-size: 20px; font-weight: 800; color: var(--text); font-family: 'Syne', sans-serif; }
        .percent-symbol { font-size: 10px; font-weight: 700; color: var(--text3); margin-left: 2px; }
        
        .subject-info { text-align: center; }
        .subject-info h4 { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 8px; letter-spacing: -0.2px; }
        .session-pill { font-size: 10px; color: var(--text3); font-weight: 600; background: var(--bg3); padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border); }
        .num-badge { color: var(--accent); font-weight: 800; }
        
        .card-bg-glow { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at center, var(--accent-local), transparent 70%); opacity: 0; pointer-events: none; transition: opacity 0.3s; }
        
        .empty-stats-container { text-align: center; padding: 60px 0; color: var(--text3); }
        .empty-icon-circle { width: 48px; height: 48px; background: var(--bg3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border: 1px solid var(--border); }
        .empty-stats-container p { font-size: 13px; font-weight: 500; font-style: italic; max-width: 200px; margin: 0 auto; }
      `}</style>
    </div>
  );
};

export default SubjectStats;
