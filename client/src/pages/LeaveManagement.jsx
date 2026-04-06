import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  Calendar as CalendarIcon, FileText, Send, CheckCircle, 
  XCircle, Clock, Filter, Search, User, Info, 
  ChevronRight, AlertCircle, Plus, Briefcase, 
  MoreVertical, CalendarDays, History
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../styles/theme.css';

const LeaveManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({ reason: '', startDate: '', endDate: '' });

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/api/attendance/leave', config);
      setLeaves(data);
    } catch (error) { toast.error('Sync failed'); }
    finally { setLoading(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!formData.reason || !formData.startDate || !formData.endDate) return toast.error('Full protocol required');
    try {
      await axios.post('http://localhost:5000/api/attendance/leave', formData, config);
      toast.success('Protocol submitted');
      setShowApplyModal(false);
      setFormData({ reason: '', startDate: '', endDate: '' });
      fetchLeaves();
    } catch (error) { toast.error('Submission error'); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/attendance/leave/${id}`, { status }, config);
      toast.success(`Entry marked as ${status}`);
      fetchLeaves();
    } catch (error) { toast.error('Action failed'); }
  };

  const filteredLeaves = leaves.filter(l => filter === 'All' || l.status === f);

  return (
    <Layout title="Absence Protocol">
      <div className="leave-portal-v3">
        {/* Dynamic Nav Header */}
        <div className="portal-header-premium">
           <div className="id-block">
              <span className="id-badge">LMS-ABSENCE-v2</span>
              <h1>Lifecycle Control</h1>
           </div>
           {user.role === 'student' && (
             <button className="premium-btn pulse-glow" onClick={() => setShowApplyModal(true)}>
               <Plus size={18} /> Request Leave
             </button>
           )}
        </div>

        {/* Analytic Metrics */}
        <div className="metrics-row-v3">
           <div className="glass-card metric-pill orange">
              <div className="icon-wrap"><Clock size={20} /></div>
              <div className="meta">
                <h2>{leaves.filter(l => l.status === 'Pending').length}</h2>
                <p>IN REVIEW</p>
              </div>
           </div>
           <div className="glass-card metric-pill green">
              <div className="icon-wrap"><CheckCircle size={20} /></div>
              <div className="meta">
                <h2>{leaves.filter(l => l.status === 'Approved').length}</h2>
                <p>GRANTED</p>
              </div>
           </div>
           <div className="glass-card metric-pill grey">
              <div className="icon-wrap"><History size={20} /></div>
              <div className="meta">
                <h2>{leaves.length}</h2>
                <p>RECORDS</p>
              </div>
           </div>
        </div>

        <div className="lifecycle-container">
           {/* Filters & Control bar */}
           <div className="control-bar-v3 glass-card">
              <div className="search-shell-v3">
                <Search size={16} />
                <input placeholder="Filter by reason or student..." />
              </div>
              <div className="filter-pills-v3">
                 {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                   <button key={f} className={`pill-v3 ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
                 ))}
              </div>
           </div>

           {/* Results Table */}
           <div className="glass-card results-v3-card">
              {loading ? (
                <div className="spin-loader-v3"><div className="spinner-v3"></div></div>
              ) : (
                <div className="table-v3-shell">
                  <table className="v3-modern-table">
                     <thead>
                       <tr>
                         {user.role !== 'student' && <th>LEARNER</th>}
                         <th>PROTOCOL REASON</th>
                         <th>DURATION</th>
                         <th>STATE</th>
                         <th>ACTIONS</th>
                       </tr>
                     </thead>
                     <tbody>
                       {leaves.filter(l => filter === 'All' || l.status === filter).map((l, i) => (
                         <tr key={i} className="v3-row-animated" style={{ animationDelay: `${i * 0.05}s` }}>
                           {user.role !== 'student' && (
                             <td>
                               <div className="learner-profile-v3">
                                 <div className="v3-avatar">{l.studentId?.name?.charAt(0)}</div>
                                 <div className="v3-meta">
                                    <span className="v3-name">{l.studentId?.name}</span>
                                    <span className="v3-id">#ST-{(l.studentId?._id || '').slice(-4)}</span>
                                 </div>
                               </div>
                             </td>
                           )}
                           <td className="reason-v3">{l.reason}</td>
                           <td className="range-v3">
                             <div className="date-group-v3">
                                <CalendarDays size={14} color="var(--accent)" />
                                <span>{new Date(l.startDate).toLocaleDateString()}</span>
                                <ChevronRight size={10} color="var(--text3)" />
                                <span>{new Date(l.endDate).toLocaleDateString()}</span>
                             </div>
                           </td>
                           <td>
                              <div className={`lifecycle-pill ${l.status.toLowerCase()}`}>
                                 <div className="dot"></div>
                                 {l.status}
                              </div>
                           </td>
                           <td className="v3-actions-cell">
                              {user.role !== 'student' && l.status === 'Pending' ? (
                                <div className="v3-btn-group">
                                  <button onClick={() => handleUpdateStatus(l._id, 'Approved')} className="v3-action-btn approve"><CheckCircle size={14} /></button>
                                  <button onClick={() => handleUpdateStatus(l._id, 'Rejected')} className="v3-action-btn reject"><XCircle size={14} /></button>
                                </div>
                              ) : (
                                <button className="v3-more-btn"><MoreVertical size={14} /></button>
                              )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
                  {leaves.length === 0 && (
                    <div className="v3-empty-state">
                       <Briefcase size={40} color="var(--text3)" opacity={0.2} />
                       <p>Absence registry is currently synchronized and clear.</p>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Modern Modal Overlay */}
      {showApplyModal && (
        <div className="v3-overlay-portal">
           <div className="glass-card v3-modal-shell animated-pop">
              <div className="v3-modal-header">
                 <div className="modal-title">
                    <AlertCircle size={18} color="var(--accent)" />
                    <h3>Request Absence</h3>
                 </div>
                 <button onClick={() => setShowApplyModal(false)} className="v3-close-btn"><XCircle size={20} /></button>
              </div>
              <form onSubmit={handleApply} className="v3-form-grid">
                 <div className="v3-field full">
                    <label>Internal Justification</label>
                    <textarea rows="4" placeholder="Detailed protocol reason..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                 </div>
                 <div className="v3-field">
                    <label>Start Cycle</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                 </div>
                 <div className="v3-field">
                    <label>End Cycle</label>
                    <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                 </div>
                 <div className="v3-form-actions">
                    <button type="button" onClick={() => setShowApplyModal(false)} className="v3-cancel-btn">Abort</button>
                    <button type="submit" className="premium-btn">Submit Protocol</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <style>{`
        .leave-portal-v3 { animation: v3-fade-in 0.6s both; }
        @keyframes v3-fade-in { from { opacity: 0; } to { opacity: 1; } }

        .portal-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .id-badge { font-size: 10px; font-weight: 800; color: var(--accent); background: rgba(79, 142, 247, 0.1); padding: 4px 10px; border-radius: 4px; letter-spacing: 1px; margin-bottom: 8px; display: block; width: fit-content; }
        .portal-header-premium h1 { font-size: 32px; font-weight: 900; letter-spacing: -1px; margin: 0; font-family: 'Syne', sans-serif; }

        .metrics-row-v3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric-pill { padding: 24px; display: flex; align-items: center; gap: 20px; border-radius: 20px; }
        .metric-pill .icon-wrap { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--bg); transition: 0.3s; }
        .metric-pill h2 { font-size: 28px; font-weight: 900; margin: 0; font-family: 'Syne', sans-serif; }
        .metric-pill p { font-size: 9px; font-weight: 800; color: var(--text3); margin: 2px 0 0 0; letter-spacing: 1px; }

        .metric-pill.orange { border-bottom: 4px solid var(--accent); } .metric-pill.orange .icon-wrap { color: var(--accent); }
        .metric-pill.green { border-bottom: 4px solid var(--accent4); } .metric-pill.green .icon-wrap { color: var(--accent4); }
        .metric-pill.grey { border-bottom: 4px solid var(--text3); } .metric-pill.grey .icon-wrap { color: var(--text3); }

        .control-bar-v3 { padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 24px; }
        .search-shell-v3 { flex: 1; display: flex; align-items: center; gap: 12px; border-right: 1px solid var(--border); }
        .search-shell-v3 input { background: transparent; border: none; color: var(--text); padding: 8px; width: 100%; outline: none; font-size: 14px; }
        
        .filter-pills-v3 { display: flex; gap: 8px; }
        .pill-v3 { background: var(--bg3); border: 1px solid var(--border); color: var(--text3); padding: 8px 16px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; transition: 0.3s; }
        .pill-v3.active { background: var(--accent); color: white; border-color: var(--accent); box-shadow: 0 4px 12px rgba(79, 142, 247, 0.3); }

        .table-v3-shell { padding: 8px; }
        .v3-modern-table { width: 100%; border-collapse: collapse; }
        .v3-modern-table th { text-align: left; padding: 20px 24px; font-size: 10px; font-weight: 800; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); }
        .v3-modern-table td { padding: 20px 24px; font-size: 14px; color: var(--text2); border-bottom: 1px solid var(--border); vertical-align: middle; }
        
        .learner-profile-v3 { display: flex; align-items: center; gap: 12px; }
        .v3-avatar { width: 34px; height: 34px; border-radius: 10px; background: var(--bg3); color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; border: 1px solid var(--border); }
        .v3-name { display: block; font-size: 14px; font-weight: 700; color: var(--text); }
        .v3-id { font-size: 10px; font-weight: 700; color: var(--text3); font-family: 'JetBrains Mono', monospace; }

        .date-group-v3 { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; background: var(--bg3); padding: 6px 12px; border-radius: 8px; width: fit-content; }
        .reason-v3 { font-weight: 500; font-style: italic; color: var(--text2); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .lifecycle-pill { display: flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 6px; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; width: fit-content; }
        .lifecycle-pill .dot { width: 6px; height: 6px; border-radius: 50%; }
        .lifecycle-pill.pending { background: rgba(79, 142, 247, 0.1); color: var(--accent); } .lifecycle-pill.pending .dot { background: var(--accent); box-shadow: 0 0 6px var(--accent); }
        .lifecycle-pill.approved { background: rgba(79, 247, 184, 0.1); color: var(--accent4); } .lifecycle-pill.approved .dot { background: var(--accent4); box-shadow: 0 0 6px var(--accent4); }
        .lifecycle-pill.rejected { background: rgba(247, 110, 79, 0.1); color: var(--accent3); } .lifecycle-pill.rejected .dot { background: var(--accent3); box-shadow: 0 0 6px var(--accent3); }

        .v3-action-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; background: var(--bg3); color: var(--text3); }
        .v3-action-btn.approve:hover { background: var(--accent4); color: white; border-color: var(--accent4); transform: scale(1.1); }
        .v3-action-btn.reject:hover { background: var(--accent3); color: white; border-color: var(--accent3); transform: scale(1.1); }
        .v3-more-btn { background: none; border: none; color: var(--text3); cursor: pointer; }

        .v3-row-animated { animation: rowSlideIn 0.5s both; }
        @keyframes rowSlideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

        .v3-overlay-portal { position: fixed; inset: 0; background: rgba(5, 7, 12, 0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .v3-modal-shell { width: 90%; max-width: 500px; padding: 40px; }
        .animated-pop { animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        
        .v3-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .modal-title { display: flex; align-items: center; gap: 12px; }
        .modal-title h3 { font-size: 22px; font-weight: 800; margin: 0; font-family: 'Syne', sans-serif; }
        .v3-close-btn { background: none; border: none; color: var(--text3); cursor: pointer; transition: 0.2s; }
        .v3-close-btn:hover { color: var(--accent3); transform: rotate(90deg); }

        .v3-form-grid { display: grid; gap: 24px; }
        .v3-field label { display: block; font-size: 10px; font-weight: 800; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .v3-field textarea, .v3-field input { width: 100%; background: var(--bg3); border: 1px solid var(--border); border-radius: 14px; padding: 14px; color: var(--text); font-size: 14px; font-weight: 500; outline: none; transition: 0.3s; }
        .v3-field textarea:focus, .v3-field input:focus { border-color: var(--accent); background: var(--bg); }
        
        .v3-form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 16px; }
        .v3-cancel-btn { background: transparent; border: 1px solid var(--border); color: var(--text2); padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .v3-cancel-btn:hover { background: var(--bg3); }

        .v3-empty-state { padding: 100px 0; text-align: center; color: var(--text3); border: 1px dashed var(--border); border-radius: 20px; margin: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
        .v3-empty-state p { font-size: 13px; font-weight: 500; font-style: italic; }

        .spin-loader-v3 { height: 400px; display: flex; align-items: center; justify-content: center; }
        .spinner-v3 { width: 40px; height: 40px; border: 3px solid var(--bg3); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s infinite linear; }
      `}</style>
    </Layout>
  );
};

export default LeaveManagement;
