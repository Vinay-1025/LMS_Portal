import React from 'react';
import { AlertTriangle, User, Mail, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';

const AtRiskPanel = ({ students }) => {
  if (!students || students.length === 0) return (
    <div className="empty-risk-state">
      <ShieldAlert size={48} color="var(--accent4)" opacity={0.3} />
      <p>System monitoring active. No compliance breaches detected.</p>
    </div>
  );

  return (
    <div className="at-risk-wrapper">
      {students.map((s, i) => (
        <div key={i} className="risk-card-premium" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="risk-header">
            <div className="student-profile">
              <div className="avatar-pill">
                <User size={18} />
                <div className="status-indicator-red"></div>
              </div>
              <div className="name-meta">
                <h4>{s.name}</h4>
                <span className="course-tag">{s.course}</span>
              </div>
            </div>
            <div className="attendance-metric">
              <span className="value">{s.attendance}</span>
              <span className="label">RATIO</span>
            </div>
          </div>
          
          <div className="risk-footer">
            <div className="last-seen">
              <Calendar size={14} /> 
              <span>Check-in: {s.lastSeen}</span>
            </div>
            <button className="risk-action-btn">
              <span>Notify</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ))}

      <style>{`
        .at-risk-wrapper { display: flex; flex-direction: column; gap: 12px; }
        
        .risk-card-premium { background: var(--bg2); border: 1px solid var(--border); border-left: 4px solid var(--accent3); border-radius: 12px; padding: 16px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); animation: slideInX 0.5s both; }
        .risk-card-premium:hover { transform: translateX(4px); background: var(--bg3); border-color: rgba(247, 110, 79, 0.3); }
        
        @keyframes slideInX {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .risk-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .student-profile { display: flex; align-items: center; gap: 12px; }
        .avatar-pill { width: 40px; height: 40px; border-radius: 12px; background: rgba(247, 110, 79, 0.1); color: var(--accent3); display: flex; align-items: center; justify-content: center; position: relative; }
        .status-indicator-red { position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: var(--accent3); border-radius: 50%; border: 2px solid var(--bg2); box-shadow: 0 0 8px var(--accent3); }
        
        .name-meta h4 { font-size: 14px; font-weight: 700; color: var(--text); margin: 0 0 2px 0; }
        .course-tag { font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; }
        
        .attendance-metric { text-align: right; }
        .attendance-metric .value { font-size: 18px; font-weight: 800; color: var(--accent3); font-family: 'Syne', sans-serif; display: block; }
        .attendance-metric .label { font-size: 9px; font-weight: 800; color: var(--text3); letter-spacing: 1px; }
        
        .risk-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border); }
        .last-seen { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text3); font-weight: 500; }
        
        .risk-action-btn { background: transparent; border: 1px solid var(--border); color: var(--text2); padding: 6px 12px; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .risk-action-btn:hover { background: var(--accent3); color: white; border-color: var(--accent3); box-shadow: 0 6px 16px rgba(247, 110, 79, 0.2); }
        
        .empty-risk-state { text-align: center; padding: 40px 20px; color: var(--text3); border: 1px dashed var(--border); border-radius: 12px; min-height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .empty-risk-state p { font-size: 12px; font-weight: 500; margin-top: 16px; max-width: 180px; font-style: italic; }
      `}</style>
    </div>
  );
};

export default AtRiskPanel;
