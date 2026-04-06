import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  CheckCircle, XCircle, Clock, QrCode, 
  Download, AlertCircle, FileText, ChevronRight,
  TrendingUp, Users, Calendar as CalendarIcon, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { toast } from 'react-hot-toast';

// Sub-components
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
import SubjectStats from '../components/attendance/SubjectStats';
import AtRiskPanel from '../components/attendance/AtRiskPanel';
import InstitutionalAnalytics from '../components/attendance/InstitutionalAnalytics';

import '../styles/theme.css';

const Attendance = () => {
  const { user } = useSelector((state) => state.auth);
  const { isMobile } = useSelector((state) => state.layout);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [courses, setCourses] = useState([]);
  const [mgmtStats, setMgmtStats] = useState(null);
  const [subjectStats, setSubjectStats] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  
  const [checkInCode, setCheckInCode] = useState('');
  const [sessionFormData, setSessionFormData] = useState({ courseId: '', duration: 15 });

  const config = {
    headers: { Authorization: `Bearer ${user.token}` }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const historyRes = await axios.get('http://localhost:5000/api/attendance/history', config);
      setHistory(historyRes.data);
      
      const statsRes = await axios.get('http://localhost:5000/api/attendance/stats', config);
      setStats(statsRes.data);

      if (user.role === 'student') {
        const subStatsRes = await axios.get('http://localhost:5000/api/attendance/subject-stats', config);
        setSubjectStats(subStatsRes.data);
      }

      if (user.role === 'tutor' || user.role === 'admin') {
        const activeRes = await axios.get('http://localhost:5000/api/attendance/active', config);
        setActiveSession(activeRes.data);
        const coursesRes = await axios.get('http://localhost:5000/api/courses', config);
        setCourses(coursesRes.data);
        const atRiskRes = await axios.get('http://localhost:5000/api/attendance/at-risk', config);
        setAtRiskStudents(atRiskRes.data);
      }

      if (user.role === 'management' || user.role === 'admin') {
        const mgmtRes = await axios.get('http://localhost:5000/api/attendance/institutional-stats', config);
        setMgmtStats(mgmtRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Session sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!sessionFormData.courseId) return toast.error('Selection required');
    try {
      const { data } = await axios.post('http://localhost:5000/api/attendance/session', sessionFormData, config);
      setActiveSession(data);
      toast.success('Broadcast live');
      fetchData();
    } catch (error) {
      toast.error('Session error');
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (checkInCode.length !== 6) return toast.error('Invalid token');
    try {
      await axios.post('http://localhost:5000/api/attendance/checkin', { code: checkInCode }, config);
      toast.success('Identity verified');
      setCheckInCode('');
      fetchData();
    } catch (error) {
      toast.error('Token expired/mismatch');
    }
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Course", "Status", "Time"];
    const rows = history.map(h => [
      new Date(h.timestamp).toLocaleDateString(),
      h.courseId?.title,
      h.status,
      new Date(h.timestamp).toLocaleTimeString()
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_audit.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Layout title="Mission Control">
      <div className="dashboard-shell-premium">
        {/* Modern Header Tier */}
        <div className="header-flow-v3">
          <div className="id-block">
            <div className="node-indicator">
              <div className="pulse-dot"></div>
              <span>CONNECTED: {user.role.toUpperCase()} </span>
            </div>
            <h1>Attendance Core</h1>
          </div>
          <div className="action-cluster-premium">
             <button onClick={fetchData} className="icon-action-btn" title="Refresh Live Data"><RefreshCw size={18} /></button>
             <button onClick={() => navigate('/leaves')} className="premium-secondary-btn"><FileText size={16} /> Leaves</button>
             <button onClick={handleExportCSV} className="premium-btn"><Download size={16} /> Export Audit</button>
          </div>
        </div>

        {/* Global KPI Tier */}
        <div className="kpi-grid-premium">
           <div className="glass-card kpi-card green-accent">
              <div className="kpi-icon"><CheckCircle size={24} /></div>
              <div className="kpi-content">
                <h2>{stats?.present || stats?.totalCheckIns || 0}</h2>
                <p>COMPLIANT</p>
              </div>
              <TrendingUp size={16} className="trend-icon" />
           </div>
           <div className="glass-card kpi-card yellow-accent">
              <div className="kpi-icon"><Clock size={24} /></div>
              <div className="kpi-content">
                <h2>{stats?.late || 0}</h2>
                <p>LATENCY</p>
              </div>
           </div>
           <div className="glass-card kpi-card red-accent">
              <div className="kpi-icon"><XCircle size={24} /></div>
              <div className="kpi-content">
                <h2>{stats?.absent || 0}</h2>
                <p>ABSENTEEISM</p>
              </div>
           </div>
           <div className="glass-card kpi-card blue-accent">
              <div className="kpi-icon"><Users size={24} /></div>
              <div className="kpi-content">
                <h2>{user.role === 'student' ? subjectStats.length : courses.length}</h2>
                <p>TOTAL UNITS</p>
              </div>
           </div>
        </div>

        {loading ? (
          <div className="loader-portal"><div className="portal-spinner"></div></div>
        ) : (
          <div className="content-architecture-v3">
            {user.role === 'student' ? (
              <div className="student-layout-premium">
                <div className="main-viewport">
                   <div className="glass-card viewport-card animated-entry">
                      <div className="viewport-header">
                        <h3>Compliance Trajectory</h3>
                        <div className="period-pills">
                          <span className="pill active">Weekly</span>
                          <span className="pill">Monthly</span>
                        </div>
                      </div>
                      <div style={{ height: '320px', padding: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={mgmtStats?.trends || [{name: 'Mon', attendance: 85}, {name: 'Tue', attendance: 92}, {name: 'Wed', attendance: 78}, {name: 'Thu', attendance: 95}, {name: 'Fri', attendance: 88}]}>
                            <defs>
                              <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} strokeOpacity={0.5} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text3)'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text3)'}} />
                            <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '11px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />
                            <Area type="monotone" dataKey="attendance" stroke="var(--accent)" strokeWidth={4} fillOpacity={1} fill="url(#colorMain)" dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 2, stroke: 'var(--bg2)' }} activeDot={{ r: 6, shadow: '0 0 10px var(--accent)' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="glass-card viewport-card animated-entry delay-1">
                      <div className="viewport-header"><h3>Subject Analysis</h3></div>
                      <div style={{ padding: '24px' }}><SubjectStats stats={subjectStats} /></div>
                   </div>
                </div>

                <div className="sidebar-viewport">
                   <div className="glass-card action-portal-card pulse-glow">
                      <div className="portal-header">
                        <QrCode size={20} color="white" />
                        <h3>Secure Token</h3>
                      </div>
                      <p>Synchronize your session parity</p>
                      <form onSubmit={handleCheckIn}>
                        <input maxLength="6" placeholder="000000" value={checkInCode} onChange={(e) => setCheckInCode(e.target.value.toUpperCase())} className="token-input" />
                        <button type="submit" className="portal-btn">Authenticate</button>
                      </form>
                   </div>

                   <div className="glass-card viewport-card animated-entry delay-2">
                      <AttendanceCalendar history={history} />
                   </div>

                   <button onClick={() => navigate('/leaves')} className="glass-card leaf-link-banner animated-entry delay-3">
                      <div className="banner-icon-bg"><FileText size={18} /></div>
                      <div className="banner-text">
                        <h4>Absence Console</h4>
                        <p>Lifecycle & Protocol</p>
                      </div>
                      <ChevronRight size={16} color="var(--text3)" />
                   </button>
                </div>
              </div>
            ) : (user.role === 'management' || user.role === 'admin' ? (
               <div className="mgmt-layout-premium"><InstitutionalAnalytics stats={mgmtStats} /></div>
            ) : (
              <div className="tutor-layout-premium">
                 <div className="main-viewport">
                    <div className="glass-card session-master-card animated-entry">
                       {activeSession ? (
                         <div className="active-session-v3">
                            <div className="qr-viewport-premium"><QrCode size={180} /></div>
                            <div className="session-data">
                               <span className="live-badge">SESSION LIVE</span>
                               <h2 className="broadcast-code">{activeSession.code}</h2>
                               <p className="unit-title">{activeSession.courseId?.title}</p>
                               <div className="expiry-meta"><Clock size={16} /> Expiry: {new Date(activeSession.expiresAt).toLocaleTimeString()}</div>
                            </div>
                         </div>
                       ) : (
                         <div className="session-idle-state">
                            <AlertCircle size={48} color="var(--text3)" opacity={0.3} />
                            <h3>No Active Broadcast</h3>
                            <p>Initialize a unit session to start live tracking.</p>
                         </div>
                       )}
                    </div>

                    <div className="glass-card viewport-card animated-entry delay-1">
                       <div className="viewport-header"><h3>Live Enrollment Feed</h3></div>
                       <div className="performance-table-shell">
                          <table className="v3-table">
                             <thead>
                               <tr><th>LEARNER</th><th>TIMESTAMP</th><th>PARITY</th></tr>
                             </thead>
                             <tbody>
                               {history.slice(0, 10).map((h, i) => (
                                 <tr key={i}>
                                   <td><div className="learner-row"><div className="row-avatar">{h.studentId?.name?.charAt(0)}</div>{h.studentId?.name}</div></td>
                                   <td>{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                   <td><span className="v3-badge compliant">COMPLIANT</span></td>
                                 </tr>
                               ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>

                 <div className="sidebar-viewport">
                    <div className="glass-card launch-v3 animated-entry">
                       <div className="viewport-header"><h3>Generator</h3></div>
                       <form onSubmit={handleStartSession} className="form-stack-v3">
                          <select className="v3-select" value={sessionFormData.courseId} onChange={e => setSessionFormData({...sessionFormData, courseId: e.target.value})}>
                            <option value="">Select Target Unit</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                          </select>
                          <input type="number" placeholder="Duration (min)" value={sessionFormData.duration} onChange={e => setSessionFormData({...sessionFormData, duration: e.target.value})} className="v3-input" />
                          <button type="submit" className="premium-btn full-width">Initialize Broadcast</button>
                       </form>
                    </div>

                    <div className="glass-card viewport-card animated-entry delay-2">
                       <div className="viewport-header"><h3>Risk Surveillance</h3></div>
                       <AtRiskPanel students={atRiskStudents} />
                    </div>

                    <button onClick={() => navigate('/leaves')} className="glass-card leaf-link-banner animated-entry delay-3">
                      <div className="banner-icon-bg tutor"><FileText size={18} /></div>
                      <div className="banner-text">
                        <h4>Request Decryption</h4>
                        <p>Absence Protocol Analysis</p>
                      </div>
                      <ChevronRight size={16} color="var(--text3)" />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .dashboard-shell-premium { animation: fadeIn 0.6s both; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .header-flow-v3 { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .node-indicator { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; margin-bottom: 8px; }
        .pulse-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 8px var(--accent); animation: pulseDot 2s infinite; }
        @keyframes pulseDot { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.4); } 100% { opacity: 1; transform: scale(1); } }
        .header-flow-v3 h1 { font-size: 32px; font-weight: 900; letter-spacing: -1px; margin: 0; font-family: 'Syne', sans-serif; }

        .action-cluster-premium { display: flex; gap: 12px; align-items: center; }
        .icon-action-btn { background: var(--bg3); border: 1px solid var(--border); color: var(--text2); padding: 10px; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
        .icon-action-btn:hover { background: var(--border); color: var(--text); transform: rotate(180deg); }
        .premium-secondary-btn { background: var(--bg2); color: var(--text); border: 1px solid var(--border); padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .premium-secondary-btn:hover { background: var(--border); }

        .kpi-grid-premium { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .kpi-card { padding: 24px; display: flex; align-items: center; gap: 20px; position: relative; border-radius: 16px; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .kpi-card:hover { transform: translateY(-4px); }
        .kpi-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: var(--bg); opacity: 0.8; }
        .kpi-content h2 { font-size: 26px; font-weight: 900; margin: 0; font-family: 'Syne', sans-serif; }
        .kpi-content p { font-size: 9px; font-weight: 800; color: var(--text3); letter-spacing: 1px; margin: 2px 0 0 0; }
        .trend-icon { position: absolute; top: 16px; right: 16px; color: var(--accent4); opacity: 0.5; }

        .green-accent { border-bottom: 3px solid var(--accent4); }
        .green-accent .kpi-icon { color: var(--accent4); }
        .yellow-accent { border-bottom: 3px solid var(--accent5); }
        .yellow-accent .kpi-icon { color: var(--accent5); }
        .red-accent { border-bottom: 3px solid var(--accent3); }
        .red-accent .kpi-icon { color: var(--accent3); }
        .blue-accent { border-bottom: 3px solid var(--accent); }
        .blue-accent .kpi-icon { color: var(--accent); }

        .content-architecture-v3 { display: grid; gap: 24px; }
        .student-layout-premium { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .tutor-layout-premium { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        
        @media (max-width: 1100px) {
          .student-layout-premium, .tutor-layout-premium { grid-template-columns: 1fr; }
        }

        .main-viewport { display: flex; flex-direction: column; gap: 24px; }
        .viewport-card { overflow: hidden; }
        .viewport-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .viewport-header h3 { font-size: 15px; font-weight: 800; margin: 0; color: var(--text2); letter-spacing: -0.2px; }

        .action-portal-card { padding: 28px; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; border: none; }
        .portal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .portal-header h3 { font-size: 18px; font-weight: 800; margin: 0; font-family: 'Syne', sans-serif; }
        .action-portal-card p { font-size: 12px; opacity: 0.8; margin-bottom: 24px; }
        
        .token-input { width: 100%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 16px; color: white; font-size: 28px; font-weight: 900; text-align: center; letter-spacing: 12px; font-family: 'Syne', sans-serif; margin-bottom: 16px; outline: none; transition: 0.3s; }
        .token-input:focus { background: rgba(255,255,255,0.25); border-color: white; }
        .portal-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; background: white; color: var(--accent); font-weight: 800; font-size: 14px; cursor: pointer; transition: 0.3s; }
        .portal-btn:hover { transform: scale(1.02); box-shadow: 0 10px 24px rgba(0,0,0,0.2); }

        .pulse-glow { animation: pulseGlow 4s infinite; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(79, 142, 247, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(79, 142, 247, 0); } 100% { box-shadow: 0 0 0 0 rgba(79, 142, 247, 0); } }

        .leaf-link-banner { padding: 18px; display: flex; align-items: center; gap: 16px; border: 1px dashed var(--border); transition: 0.3s; background: var(--bg2); width: 100%; border-radius: 16px; cursor: pointer; }
        .leaf-link-banner:hover { border-color: var(--accent); background: rgba(79, 142, 247, 0.05); transform: translateY(-2px); }
        .banner-icon-bg { width: 40px; height: 40px; border-radius: 10px; background: rgba(79, 247, 184, 0.1); color: var(--accent4); display: flex; align-items: center; justify-content: center; }
        .banner-icon-bg.tutor { background: rgba(79, 142, 247, 0.1); color: var(--accent); }
        .banner-text h4 { font-size: 14px; font-weight: 700; margin: 0; text-align: left; }
        .banner-text p { font-size: 10px; color: var(--text3); margin: 4px 0 0 0; text-align: left; font-weight: 600; }

        .active-session-v3 { padding: 40px; display: flex; gap: 40px; align-items: center; }
        .qr-viewport-premium { background: white; padding: 24px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .broadcast-code { font-size: 48px; font-weight: 900; letter-spacing: 8px; color: var(--accent); margin: 8px 0; font-family: 'Syne', sans-serif; }
        .unit-title { font-size: 18px; font-weight: 600; color: var(--text); }
        .live-badge { font-size: 10px; font-weight: 900; color: white; background: var(--accent); padding: 4px 12px; border-radius: 20px; letter-spacing: 1px; }

        .v3-table { width: 100%; border-collapse: collapse; }
        .v3-table th { font-size: 10px; font-weight: 800; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; text-align: left; padding: 16px 24px; border-bottom: 1px solid var(--border); }
        .v3-table td { padding: 18px 24px; font-size: 14px; color: var(--text2); border-bottom: 1px solid var(--border); }
        .learner-row { display: flex; align-items: center; gap: 12px; font-weight: 600; color: var(--text); }
        .row-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--bg3); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: var(--accent); border: 1px solid var(--border); }
        .v3-badge { font-size: 9px; font-weight: 900; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; }
        .v3-badge.compliant { background: rgba(79, 247, 184, 0.1); color: var(--accent4); }

        .form-stack-v3 { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .v3-select, .v3-input { width: 100%; background: var(--bg3); border: 1px solid var(--border); padding: 14px; border-radius: 12px; color: var(--text); font-size: 14px; font-weight: 500; outline: none; transition: 0.3s; }
        .v3-select:focus, .v3-input:focus { border-color: var(--accent); }
        .full-width { width: 100%; }

        .animated-entry { animation: slideUpFade 0.6s both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        .loader-portal { height: 400px; display: flex; align-items: center; justify-content: center; }
        .portal-spinner { width: 50px; height: 50px; border: 4px solid var(--bg3); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s infinite linear; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
};

export default Attendance;
