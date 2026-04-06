import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import { 
  SquarePen, Play, Info, FileText, CheckCircle, 
  Clock, Search, Filter, Plus, Target, 
  Trash2, BarChart2, MoreVertical, Award, ArrowUpRight,
  X, User, Mail, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../styles/theme.css';

const Assessments = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Stats Modal State
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    fetchAssessments();
    if (user.role === 'tutor' || user.role === 'admin') fetchStats();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/api/assessments', config);
      setAssessments(data);
    } catch (error) { toast.error('Sync error'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/assessments/stats', config);
      setStats(data);
    } catch (error) { console.error('Stats error', error); }
  };

  const handleFetchSubmissions = async (assessment) => {
    setSelectedAssessment(assessment);
    setShowStatsModal(true);
    setStatsLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/assessments/${assessment._id}/submissions`, config);
      setSubmissions(data);
    } catch (error) { toast.error('Failed to load reporting data'); }
    finally { setStatsLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this protocol? Records will be purged.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/assessments/${id}`, config);
      toast.success('Protocol archived');
      fetchAssessments();
      fetchStats();
    } catch (error) { toast.error('Deactivation failed'); }
  };

  const filteredAssessments = assessments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Completed') return matchesSearch && a.isCompleted;
    if (activeFilter === 'Pending') return matchesSearch && !a.isCompleted;
    return matchesSearch;
  });

  const renderTutorDashboard = () => (
    <div className="tutor-assessment-hub">
       <div className="metrics-row-v4">
          <div className="glass-card metric-item blue">
             <div className="metric-icon"><FileText size={24} /></div>
             <div className="metric-data">
                <h2>{stats?.count || 0}</h2>
                <p>Protocols Deployed</p>
             </div>
          </div>
          <div className="glass-card metric-item green">
             <div className="metric-icon"><Target size={24} /></div>
             <div className="metric-data">
                <h2>{stats?.attempts || 0}</h2>
                <p>Total Submissions</p>
             </div>
          </div>
          <div className="glass-card metric-item purple">
             <div className="metric-icon"><Award size={24} /></div>
             <div className="metric-data">
                <h2>{stats?.averagePerformance}%</h2>
                <p>Avg Performance</p>
             </div>
          </div>
       </div>

       <div className="glass-card management-v4-card animated-entry">
          <div className="v4-card-header">
             <h3>Active Assessment Inventory</h3>
             <button onClick={() => navigate('/assessment-builder')} className="premium-btn">
               <Plus size={18} /> New Protocol
             </button>
          </div>
          <div className="table-v4-shell">
             <table className="v4-table">
                <thead>
                   <tr>
                     <th>PROTOCOL NAME</th>
                     <th>TARGET COURSE</th>
                     <th>DURATION</th>
                     <th>SUBMISSIONS</th>
                     <th>ACTIONS</th>
                   </tr>
                </thead>
                <tbody>
                   {assessments.map((a, i) => (
                     <tr key={i}>
                       <td className="a-title-row">
                          <div className="title-stack">
                            <span className="a-title">{a.title}</span>
                            <span className="a-meta">{a.questions.length} Units</span>
                          </div>
                       </td>
                       <td><span className="course-badge">{a.courseId?.title}</span></td>
                       <td><span className="a-meta">{a.timeLimit} Minutes</span></td>
                       <td>
                          <div className="attempt-counter">
                             <span className="num">{a.attempts || 0}</span> <span className="label">Learners</span>
                          </div>
                       </td>
                       <td>
                          <div className="v4-action-group">
                             <button onClick={() => navigate(`/assessment-builder/${a._id}`)} className="v4-action-btn edit"><SquarePen size={14} /></button>
                             <button onClick={() => handleDelete(a._id)} className="v4-action-btn delete"><Trash2 size={14} /></button>
                             <button onClick={() => handleFetchSubmissions(a)} className="v4-action-btn stats"><BarChart2 size={14} /></button>
                          </div>
                       </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  const renderStudentHub = () => (
    <div className="student-assessment-hub">
      <div className="hub-controls">
         <div className="search-v4">
            <Search size={18} />
            <input 
             placeholder="Search unit assessments..." 
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="hub-filters">
            {['All', 'Pending', 'Completed'].map(f => (
              <button 
               key={f} 
               className={`filter-v4 ${activeFilter === f ? 'active' : ''}`}
               onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
         </div>
      </div>

      <div className="assessment-grid-v4">
         {filteredAssessments.map((a, i) => (
           <div key={i} className="glass-card quiz-card-v4 animated-entry" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="quiz-header">
                 <div className="course-id">{a.courseId?.title}</div>
                 <div className={`status-v4 ${a.isCompleted ? 'done' : 'active'}`}>
                    {a.isCompleted ? 'COMPLETED' : 'OPEN'}
                 </div>
              </div>
              <h3 className="quiz-title">{a.title}</h3>
              <p className="quiz-brief">{a.description?.slice(0, 80)}...</p>
              
              <div className="quiz-kpis">
                 <div className="kpi"><Clock size={14} /> {a.timeLimit}m</div>
                 <div className="kpi"><FileText size={14} /> {a.questions.length} Units</div>
              </div>

              <div className="quiz-footer">
                 {a.isCompleted ? (
                   <div className="score-summary">
                      <span className="score-label">ACHIEVED SCORE</span>
                      <span className="score-value">{a.score} / {a.questions.reduce((acc, q) => acc + q.points, 0)}</span>
                   </div>
                 ) : (
                   <div className="tutor-meta">
                      <div className="avatar-v4">{a.tutorId?.name?.charAt(0)}</div>
                      <span>{a.tutorId?.name}</span>
                   </div>
                 )}
                 
                 <button 
                  onClick={() => navigate(`/assessment/${a._id}`)} 
                  className={`quiz-action-btn ${a.isCompleted ? 'review' : 'start'}`}
                 >
                    {a.isCompleted ? 'Review' : 'Enter Protocol'}
                    <ArrowUpRight size={16} />
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );

  return (
    <Layout title="Assessment Hub">
      <div className="hub-shell-v4">
        {loading ? (
          <div className="loader-v4"><div className="spinner-v4"></div></div>
        ) : (
          <>
            {user.role === 'tutor' || user.role === 'admin' ? renderTutorDashboard() : renderStudentHub()}
          </>
        )}
      </div>

      {/* Statistics Modal */}
      {showStatsModal && (
        <div className="v4-modal-overlay">
           <div className="glass-card v4-modal-content animated-pop">
              <div className="modal-header">
                 <div>
                    <h3>Performance Report</h3>
                    <p className="subtitle">{selectedAssessment?.title}</p>
                 </div>
                 <button onClick={() => setShowStatsModal(false)} className="close-btn"><X size={20} /></button>
              </div>
              
              {statsLoading ? (
                 <div className="modal-loader"><div className="spinner-v4"></div></div>
              ) : (
                 <div className="submissions-table-shell">
                    {submissions.length === 0 ? (
                       <div className="empty-submissions">
                          <Target size={40} opacity={0.3} />
                          <p>No submissions recorded for this protocol yet.</p>
                       </div>
                    ) : (
                       <table className="v4-sub-table">
                          <thead>
                             <tr>
                                <th>LEARNER</th>
                                <th>ACCURACY</th>
                                <th>RAW SCORE</th>
                                <th>TIMESTAMP</th>
                             </tr>
                          </thead>
                          <tbody>
                             {submissions.map((s, idx) => (
                                <tr key={idx}>
                                   <td>
                                      <div className="learner-id">
                                         <User size={14} color="var(--accent)" />
                                         <div className="l-meta">
                                            <span className="l-name">{s.studentId?.name}</span>
                                            <span className="l-email">{s.studentId?.email}</span>
                                         </div>
                                      </div>
                                   </td>
                                   <td>
                                      <div className={`accuracy-pill ${s.score / s.totalPoints >= 0.75 ? 'high' : 'low'}`}>
                                         {Math.round((s.score / s.totalPoints) * 100)}%
                                      </div>
                                   </td>
                                   <td className="raw-score">{s.score} / {s.totalPoints}</td>
                                   <td className="timestamp">
                                      <div className="time-stack">
                                         <Calendar size={12} />
                                         {new Date(s.timestamp).toLocaleDateString()}
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    )}
                 </div>
              )}
           </div>
        </div>
      )}

      <style>{`
        .hub-shell-v4 { animation: fadeIn 0.6s both; }
        
        .metrics-row-v4 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .metric-item { padding: 28px; display: flex; align-items: center; gap: 24px; border-radius: 24px; transition: 0.3s; }
        .metric-item:hover { transform: translateY(-4px); border-color: var(--accent); }
        .metric-icon { width: 56px; height: 56px; border-radius: 18px; background: var(--bg); display: flex; align-items: center; justify-content: center; }
        .metric-item.blue { border-bottom: 4px solid var(--accent); } .metric-item.blue .metric-icon { color: var(--accent); }
        .metric-item.green { border-bottom: 4px solid var(--accent4); } .metric-item.green .metric-icon { color: var(--accent4); }
        .metric-item.purple { border-bottom: 4px solid var(--admin); } .metric-item.purple .metric-icon { color: var(--admin); }
        .metric-data h2 { font-size: 32px; font-weight: 900; margin: 0; font-family: 'Syne', sans-serif; }
        .metric-data p { font-size: 10px; font-weight: 800; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin: 4px 0 0 0; }

        .v4-card-header { padding: 24px 32px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .v4-card-header h3 { font-size: 18px; font-weight: 800; margin: 0; font-family: 'Syne', sans-serif; }

        .table-v4-shell { padding: 8px; }
        .v4-table { width: 100%; border-collapse: collapse; }
        .v4-table th { text-align: left; padding: 20px 24px; font-size: 10px; font-weight: 800; color: var(--text3); text-transform: uppercase; border-bottom: 1px solid var(--border); }
        .v4-table td { padding: 20px 24px; vertical-align: middle; border-bottom: 1px solid var(--border); }
        
        .title-stack { display: flex; flex-direction: column; }
        .a-title { font-size: 15px; font-weight: 700; color: var(--text); }
        .a-meta { font-size: 11px; color: var(--text3); font-weight: 600; margin-top: 4px; }
        .course-badge { padding: 4px 10px; background: var(--bg3); border: 1px solid var(--border); border-radius: 6px; font-size: 11px; font-weight: 700; color: var(--text2); }
        
        .v4-action-group { display: flex; gap: 8px; }
        .v4-action-btn { width: 34px; height: 34px; border-radius: 10px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; background: var(--bg3); color: var(--text3); }
        .v4-action-btn.edit:hover { background: var(--accent); color: white; border-color: var(--accent); }
        .v4-action-btn.delete:hover { background: var(--accent3); color: white; border-color: var(--accent3); }
        .v4-action-btn.stats:hover { background: var(--accent4); color: white; border-color: var(--accent4); }

        .hub-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 24px; }
        .search-v4 { flex: 1; display: flex; align-items: center; gap: 12px; background: var(--bg2); border: 1px solid var(--border); padding: 12px 20px; border-radius: 16px; min-width: 300px; }
        .search-v4 input { background: transparent; border: none; color: var(--text); outline: none; width: 100%; font-size: 14px; }
        .filter-v4 { background: var(--bg3); border: 1px solid var(--border); color: var(--text3); padding: 10px 20px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .filter-v4.active { background: var(--accent); color: white; border-color: var(--accent); box-shadow: 0 8px 16px rgba(79, 142, 247, 0.2); }

        .assessment-grid-v4 { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .quiz-card-v4 { padding: 28px; display: flex; flex-direction: column; gap: 16px; border-radius: 24px; transition: 0.4s; border: 1px solid var(--border); background: var(--bg2); }
        .quiz-card-v4:hover { transform: translateY(-8px); border-color: var(--accent); }
        
        .quiz-header { display: flex; justify-content: space-between; align-items: center; }
        .course-id { font-size: 10px; font-weight: 900; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; }
        .status-v4 { font-size: 9px; font-weight: 900; padding: 4px 10px; border-radius: 6px; }
        .status-v4.active { background: rgba(79, 142, 247, 0.1); color: var(--accent); }
        .status-v4.done { background: rgba(79, 247, 184, 0.1); color: var(--accent4); }
        
        .quiz-title { font-size: 20px; font-weight: 800; margin: 0; font-family: 'Syne', sans-serif; }
        .quiz-brief { font-size: 13px; color: var(--text3); line-height: 1.5; }
        .quiz-kpis { display: flex; gap: 16px; border-top: 1px solid var(--border); padding-top: 16px; }
        .kpi { font-size: 11px; font-weight: 700; color: var(--text2); display: flex; align-items: center; gap: 8px; }

        .quiz-action-btn { border: none; padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.3s; }
        .quiz-action-btn.start { background: var(--accent); color: white; }
        .quiz-action-btn.review { background: var(--bg3); color: var(--text2); border: 1px solid var(--border); }
        
        /* Modal Styles */
        .v4-modal-overlay { position: fixed; inset: 0; background: rgba(5, 7, 12, 0.85); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .v4-modal-content { max-width: 800px; width: 100%; max-height: 85vh; overflow: hidden; display: flex; flex-direction: column; }
        .modal-header { padding: 32px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; }
        .modal-header h3 { margin: 0; font-size: 22px; font-weight: 800; font-family: 'Syne', sans-serif; }
        .modal-header .subtitle { margin: 4px 0 0 0; color: var(--accent); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .close-btn { background: none; border: none; color: var(--text3); cursor: pointer; transition: 0.2s; }
        .close-btn:hover { color: var(--accent3); transform: rotate(90deg); }

        .submissions-table-shell { padding: 0 32px 32px 32px; overflow-y: auto; flex: 1; }
        .v4-sub-table { width: 100%; border-collapse: collapse; }
        .v4-sub-table th { text-align: left; padding: 16px; font-size: 10px; font-weight: 800; color: var(--text3); border-bottom: 1px solid var(--border); }
        .v4-sub-table td { padding: 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        
        .learner-id { display: flex; align-items: center; gap: 12px; }
        .l-meta { display: flex; flex-direction: column; }
        .l-name { font-size: 14px; font-weight: 700; color: var(--text); }
        .l-email { font-size: 11px; color: var(--text3); }
        
        .accuracy-pill { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; width: fit-content; }
        .accuracy-pill.high { background: rgba(79, 247, 184, 0.1); color: var(--accent4); }
        .accuracy-pill.low { background: rgba(247, 79, 79, 0.1); color: var(--accent3); }
        
        .raw-score { font-size: 13px; font-weight: 600; color: var(--text2); }
        .time-stack { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text3); font-weight: 600; }

        .empty-submissions { padding: 60px 0; text-align: center; color: var(--text3); display: flex; flex-direction: column; align-items: center; gap: 16px; }
        
        .animated-pop { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
      </Layout>
  );
};

export default Assessments;
