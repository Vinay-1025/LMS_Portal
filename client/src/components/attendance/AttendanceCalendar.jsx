import React from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

const AttendanceCalendar = ({ history }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDayStatus = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const record = history.find(h => new Date(h.timestamp).toDateString() === d.toDateString());
    return record ? record.status : null;
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const status = getDayStatus(i);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toDateString();
      days.push(
        <div key={i} className={`calendar-day ${status ? status.toLowerCase() : ''} ${isToday ? 'today' : ''}`}>
          <span className="day-number">{i}</span>
          {status && <div className="status-dot"></div>}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="attendance-calendar premium-calendar">
      <div className="calendar-header">
        <div className="month-selector">
           <h3>{monthNames[currentDate.getMonth()]}</h3>
           <span className="year-label">{currentDate.getFullYear()}</span>
        </div>
        <div className="calendar-nav">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ChevronLeft size={16} /></button>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ChevronRight size={16} /></button>
        </div>
      </div>
      
      <div className="calendar-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
        {renderDays()}
      </div>
      
      <div className="calendar-legend-premium">
         <div className="legend-pills">
            <span className="pill present">Present</span>
            <span className="pill late">Late</span>
            <span className="pill holiday">Holiday</span>
         </div>
         <Info size={14} color="var(--text3)" />
      </div>

      <style>{`
        .premium-calendar { padding: 4px; }
        .calendar-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; padding: 0 8px; }
        .month-selector h3 { font-size: 18px; font-weight: 800; margin: 0; color: var(--text); letter-spacing: -0.5px; }
        .year-label { font-size: 11px; color: var(--accent); font-weight: 700; opacity: 0.8; }
        
        .calendar-nav { display: flex; gap: 6px; }
        .calendar-nav button { background: var(--bg3); border: 1px solid var(--border); color: var(--text2); padding: 6px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .calendar-nav button:hover { background: var(--border); color: var(--text); transform: scale(1.05); }

        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
        .calendar-weekday { font-size: 9px; color: var(--text3); font-weight: 900; text-align: center; padding: 8px 0; text-transform: uppercase; letter-spacing: 1px; }
        
        .calendar-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 10px; font-size: 12px; font-weight: 600; color: var(--text2); position: relative; border: 1px solid transparent; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: default; }
        .calendar-day:not(.empty):hover { border-color: var(--border); background: var(--bg3); transform: translateY(-2px); }
        .calendar-day.today { background: rgba(79, 142, 247, 0.05); border-color: rgba(79, 142, 247, 0.3); color: var(--accent); }
        
        .calendar-day.present { background: rgba(79, 247, 184, 0.08); }
        .calendar-day.present .day-number { color: var(--accent4); }
        .calendar-day.present .status-dot { background: var(--accent4); box-shadow: 0 0 8px var(--accent4); }
        
        .calendar-day.late { background: rgba(247, 200, 79, 0.08); }
        .calendar-day.late .day-number { color: var(--accent5); }
        .calendar-day.late .status-dot { background: var(--accent5); box-shadow: 0 0 8px var(--accent5); }

        .status-dot { width: 4px; height: 4px; border-radius: 50%; margin-top: 4px; position: absolute; bottom: 6px; }
        
        .calendar-legend-premium { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); }
        .legend-pills { display: flex; gap: 8px; }
        .pill { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; opacity: 0.6; }
        .pill.present { color: var(--accent4); background: rgba(79, 247, 184, 0.1); }
        .pill.late { color: var(--accent5); background: rgba(247, 200, 79, 0.1); }
        .pill.holiday { color: var(--accent); background: rgba(79, 142, 247, 0.1); }
      `}</style>
    </div>
  );
};

export default AttendanceCalendar;
