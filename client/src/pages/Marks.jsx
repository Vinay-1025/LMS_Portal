import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  Trophy, TrendingUp, FileText, Download, 
  Star, PieChart, Award, Calendar, 
  ChevronRight, ArrowUpRight, GraduationCap,
  Users, Target, Search, Filter, X, User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../styles/theme.css';

const Marks = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isMobile } = useSelector((state) => state.layout);
  
  // Common state
  const [loading, setLoading] = useState(true);
  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  // Student specific state
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Tutor specific state
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [tutorSubmissions, setTutorSubmissions] = useState([]);
  const [tutorStats, setTutorStats] = useState(null);
  const [insights, setInsights] = useState(null);

  const BADGES = {
    perfect_score: { label: 'Perfect 100', icon: '🎯', color: '#ffb300', desc: 'Scored 100% in an assessment' },
    consistent_performer: { label: 'Elite Consistent', icon: '🔥', color: '#4ff7b8', desc: 'Completed 5+ assessments' },
    hot_streak: { label: 'Triple Threat', icon: '⚡', color: '#4f8ef7', desc: 'Last 3 scores above 80%' }
  };

  useEffect(() => {
    if (user.role === 'student') {
      fetchStudentData();
    } else {
      fetchTutorData();
    }
  }, [user.role]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [resData, analyticsData] = await Promise.all([
        axios.get('http://localhost:5000/api/assessments/my-results', config),
        axios.get('http://localhost:5000/api/assessments/my-analytics', config)
      ]);
      setResults(resData.data);
      setAnalytics(analyticsData.data);
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorData = async () => {
    setLoading(true);
    try {
      const [assessmentsData, statsData] = await Promise.all([
        axios.get('http://localhost:5000/api/assessments', config),
        axios.get('http://localhost:5000/api/assessments/stats', config)
      ]);
      const tutorOwned = assessmentsData.data.filter(a => a.tutorId?._id === user._id || a.tutorId === user._id);
      setAssessments(tutorOwned);
      setTutorStats(statsData.data);
      if (tutorOwned.length > 0) {
        setSelectedAssessmentId(tutorOwned[0]._id);
        fetchSubmissions(tutorOwned[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load educator metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (id) => {
    try {
      const [{ data: subs }, { data: insightData }] = await Promise.all([
        axios.get(`http://localhost:5000/api/assessments/${id}/submissions`, config),
        axios.get(`http://localhost:5000/api/assessments/${id}/insights`, config)
      ]);
      setTutorSubmissions(subs);
      setInsights(insightData);
    } catch (error) {
      toast.error('Failed to load assessment data');
    }
  };

  const handleAssessmentChange = (e) => {
    const id = e.target.value;
    setSelectedAssessmentId(id);
    fetchSubmissions(id);
  };

  const getGrade = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { label: 'A+', color: 'var(--accent4)' };
    if (percentage >= 80) return { label: 'A', color: 'var(--accent4)' };
    if (percentage >= 70) return { label: 'B', color: 'var(--accent)' };
    return { label: 'C', color: 'var(--accent5)' };
  };
  const handleExportCSV = () => {
    if (!tutorSubmissions.length) return toast.error('No data to export');
    const headers = ['Student Name', 'Email', 'Score', 'Total Points', 'Accuracy%', 'Date'];
    const rows = tutorSubmissions.map(s => [
      s.studentId?.name,
      s.studentId?.email,
      s.score,
      s.totalPoints,
      Math.round((s.score / s.totalPoints) * 100),
      new Date(s.timestamp).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `results_${selectedAssessmentId.slice(-6)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  const renderStudentView = () => (
    <>
      <div className="stats-grid-v4">
        {[
          { label: 'GPA Equivalent', value: analytics?.gpa || '0.0', icon: <GraduationCap size={20} />, color: 'var(--accent)' },
          { label: 'Institutional Percentile', value: analytics?.percentile || 'P-0%', icon: <TrendingUp size={20} />, color: 'var(--accent4)' },
          { label: 'Academic Rank', value: analytics?.rank || 'N/A', icon: <Trophy size={20} />, color: 'var(--accent4)' },
          { label: 'Accuracy', value: `${analytics?.average || 0}%`, icon: <Star size={20} />, color: 'var(--accent2)' },
        ].map((s, i) => (
          <div key={i} className="glass-card stat-card-v4 animated-entry" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon-wrap" style={{ color: s.color, background: `${s.color}15` }}>{s.icon}</div>
            <div className="stat-meta">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {analytics?.achievements?.length > 0 && (
        <div className="achievements-shelf glass-card animated-entry">
           <div className="shelf-header">
              <Award size={18} color="var(--accent4)" />
              <h3>Academic Merit Badges</h3>
           </div>
           <div className="badge-grid">
              {analytics.achievements.map((slug, idx) => {
                const badge = BADGES[slug];
                if (!badge) return null;
                return (
                  <div key={idx} className="merit-badge-v4" title={badge.desc}>
                     <div className="badge-icon" style={{ borderColor: badge.color }}>{badge.icon}</div>
                     <span className="badge-label">{badge.label}</span>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      <div className="content-layout-v4">
         <div className="glass-card transcript-card-v4 animated-entry" style={{ animationDelay: '0.4s' }}>
            <div className="card-header-v4">
               <h2>Academic Transcript</h2>
               <button className="premium-btn lite"><Download size={16} /> Export PDF</button>
            </div>
            <div className="table-shell-v4">
               {results.length === 0 ? (
                  <div className="empty-state-v4"><Award size={48} opacity={0.2} /><p>No assessment records found.</p></div>
               ) : (
                  <table className="transcript-table">
                     <thead><tr><th>UNIT</th><th>COURSE</th><th>SCORE</th><th>GRADE</th><th>ACTION</th></tr></thead>
                     <tbody>
                        {results.map((r, i) => {
                           const grade = getGrade(r.score, r.totalPoints);
                           return (
                              <tr key={i} className="transcript-row">
                                 <td><div className="unit-cell"><span className="unit-name">{r.assessmentId?.title}</span></div></td>
                                 <td><span className="course-pill">{r.assessmentId?.courseId?.title}</span></td>
                                 <td><span className="score-val">{r.score}/{r.totalPoints}</span></td>
                                 <td><span className="grade-box" style={{ color: grade.color, borderColor: grade.color }}>{grade.label}</span></td>
                                 <td>
                                    <div className="action-stack-v4">
                                       <button onClick={() => navigate(`/assessment/${r.assessmentId?._id}`)} className="view-link">Review <ArrowUpRight size={14} /></button>
                                       <button onClick={() => toast.success('Appeal request initiated. Tutor will be notified.')} className="appeal-link">Appeal</button>
                                    </div>
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               )}
            </div>
         </div>
      </div>
    </>
  );

  const renderTutorView = () => (
    <>
       <div className="stats-grid-v4">
        {[
          { label: 'Total Assessments', value: tutorStats?.count || 0, icon: <FileText size={20} />, color: 'var(--accent)' },
          { label: 'Global Submissions', value: tutorStats?.attempts || 0, icon: <Users size={20} />, color: 'var(--accent4)' },
          { label: 'Overall Accuracy', value: `${tutorStats?.averagePerformance || 0}%`, icon: <Target size={20} />, color: 'var(--accent5)' },
          { label: 'Top Performer', value: tutorSubmissions[0]?.studentId?.name?.split(' ')[0] || 'N/A', icon: <Award size={20} />, color: 'var(--accent2)' },
        ].map((s, i) => (
          <div key={i} className="glass-card stat-card-v4 animated-entry" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon-wrap" style={{ color: s.color, background: `${s.color}15` }}>{s.icon}</div>
            <div className="stat-meta">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="educator-controls glass-card animated-entry">
         <div className="picker-wrap">
            <Filter size={18} color="var(--accent)" />
            <div className="flex-stack">
               <label>Select Assessment Protocol</label>
               <select value={selectedAssessmentId} onChange={handleAssessmentChange}>
                  {assessments.map(a => <option key={a._id} value={a._id}>{a.title} ({a.courseId?.title})</option>)}
               </select>
            </div>
         </div>
         <div className="search-wrap">
            <Search size={18} />
            <input placeholder="Filter students by name..." />
         </div>
      </div>

      <div className="glass-card transcript-card-v4 animated-entry">
         <div className="card-header-v4">
            <div className="flex-v">
               <h2>Student Performance Matrix</h2>
               <p className="sub-tag">Collective scoring and competency data across the institution</p>
            </div>
            <button onClick={handleExportCSV} className="premium-btn lite"><Download size={16} /> Export CSV</button>
         </div>

         {insights && insights.insights?.length > 0 && (
           <div className="heatmap-section animated-entry">
              <div className="heatmap-header">
                 <div className="h-info">
                    <TrendingUp size={16} />
                    <span>Sequence Accuracy Heatmap</span>
                 </div>
                 <div className="h-legend">
                    <span className="leg"><div className="dot low"></div> Tough</span>
                    <span className="leg"><div className="dot mid"></div> Moderate</span>
                    <span className="leg"><div className="dot high"></div> Easy</span>
                 </div>
              </div>
              <div className="heatmap-grid">
                 {insights.insights.map((q, i) => (
                   <div key={i} className="heatmap-node" title={q.questionText}>
                      <div className={`node-fill ${q.accuracy >= 80 ? 'high' : q.accuracy >= 50 ? 'mid' : 'low'}`}>
                         {q.accuracy}%
                      </div>
                      <span className="node-idx">Q{i+1}</span>
                   </div>
                 ))}
              </div>
           </div>
         )}

         <div className="table-shell-v4">
            {tutorSubmissions.length === 0 ? (
               <div className="empty-state-v4"><Users size={48} opacity={0.2} /><p>No students have completed this unit yet.</p></div>
            ) : (
               <table className="transcript-table">
                  <thead><tr><th>STUDENT</th><th>ACCURACY</th><th>SCORE</th><th>COMPLETION DATE</th><th>ACTION</th></tr></thead>
                  <tbody>
                     {tutorSubmissions.map((s, idx) => {
                        const accuracy = Math.round((s.score / s.totalPoints) * 100);
                        return (
                           <tr key={idx}>
                              <td>
                                 <div className="student-profile">
                                    <div className="s-avatar">{s.studentId?.name?.charAt(0)}</div>
                                    <div className="s-info">
                                       <span className="s-name">{s.studentId?.name}</span>
                                       <span className="s-email">{s.studentId?.email}</span>
                                    </div>
                                 </div>
                              </td>
                              <td>
                                 <div className={`acc-pill ${accuracy >= 80 ? 'high' : accuracy >= 50 ? 'mid' : 'low'}`}>
                                    {accuracy}% Accuracy
                                 </div>
                              </td>
                              <td className="score-val">{s.score} / {s.totalPoints}</td>
                              <td className="date-cell">{new Date(s.timestamp).toLocaleDateString()}</td>
                              <td><button className="view-link">View Detail <ArrowUpRight size={14} /></button></td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            )}
         </div>
      </div>
    </>
  );

  return (
    <Layout title={`Marks & Results Hub / ${user.role.toUpperCase()}`}>
      <div className="marks-wrapper-v4">
        {loading ? (
          <div className="hub-loader"><div className="spinner-v4"></div></div>
        ) : (
          user.role === 'student' ? renderStudentView() : renderTutorView()
        )}
      </div>

      <style>{`
        .marks-wrapper-v4 { display: flex; flex-direction: column; gap: 32px; animation: fadeIn 0.6s both; }
        
        .stats-grid-v4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .stat-card-v4 { padding: 24px; display: flex; align-items: center; gap: 20px; transition: 0.3s; border: 1px solid var(--border); }
        .stat-card-v4:hover { transform: translateY(-4px); border-color: var(--accent); }
        .stat-icon-wrap { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .stat-meta h3 { font-size: 24px; font-weight: 900; margin: 0; font-family: 'Syne', sans-serif; }
        .stat-meta p { font-size: 10px; font-weight: 800; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

        .achievements-shelf { padding: 24px 32px; border: 1px solid var(--border); background: linear-gradient(135deg, var(--bg2), var(--bg3)); }
        .shelf-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .shelf-header h3 { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text2); }
        .badge-grid { display: flex; flex-wrap: wrap; gap: 16px; }
        .merit-badge-v4 { display: flex; align-items: center; gap: 12px; background: var(--bg); padding: 8px 16px; border-radius: 14px; border: 1px solid var(--border); transition: 0.3s; cursor: help; }
        .merit-badge-v4:hover { border-color: var(--accent); transform: scale(1.05); }
        .badge-icon { font-size: 18px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid; }
        .badge-label { font-size: 11px; font-weight: 800; color: var(--text); }

        .educator-controls { padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; gap: 32px; border: 1px solid var(--border); }
        @media (max-width: 768px) { .educator-controls { flex-direction: column; align-items: stretch; } }
        
        .flex-v { display: flex; flex-direction: column; gap: 4px; }
        .sub-tag { font-size: 12px; color: var(--text3); font-weight: 500; }

        .heatmap-section { margin-bottom: 32px; padding: 24px; background: var(--bg3); border-radius: 20px; border: 1px solid var(--border); }
        .heatmap-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .h-info { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; color: var(--text2); text-transform: uppercase; }
        .h-legend { display: flex; gap: 16px; font-size: 11px; font-weight: 700; color: var(--text3); }
        .leg { display: flex; align-items: center; gap: 6px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.low { background: var(--accent3); }
        .dot.mid { background: var(--accent); }
        .dot.high { background: var(--accent4); }

        .heatmap-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .heatmap-node { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .node-fill { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 11px; font-weight: 900; color: var(--bg); transition: 0.3s; border: 2px solid transparent; }
        .node-fill.high { background: var(--accent4); }
        .node-fill.mid { background: var(--accent); }
        .node-fill.low { background: var(--accent3); }
        .node-idx { font-size: 10px; font-weight: 800; color: var(--text3); }
        .heatmap-node:hover .node-fill { transform: scale(1.1); filter: brightness(1.2); }
        
        .picker-wrap { display: flex; align-items: center; gap: 20px; flex: 1; }
        .flex-stack { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .flex-stack label { font-size: 10px; font-weight: 900; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; }
        .picker-wrap select { background: var(--bg3); border: 1px solid var(--border); color: var(--text); padding: 10px 16px; border-radius: 12px; font-weight: 700; width: 100%; outline: none; }
        
        .search-wrap { display: flex; align-items: center; gap: 12px; background: var(--bg2); border: 1px solid var(--border); padding: 12px 20px; border-radius: 16px; min-width: 300px; }
        .search-wrap input { background: transparent; border: none; color: var(--text); outline: none; width: 100%; font-size: 14px; }

        .transcript-card-v4 { padding: 32px; border: 1px solid var(--border); background: var(--bg2); }
        .card-header-v4 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .card-header-v4 h2 { font-size: 20px; font-weight: 800; margin: 0; font-family: 'Syne', sans-serif; }
        .unit-badge { font-size: 10px; font-weight: 900; color: var(--accent); background: rgba(79, 142, 247, 0.1); padding: 6px 12px; border-radius: 8px; }

        .table-shell-v4 { overflow-x: auto; margin: 0 -32px; padding: 0 32px; }
        .transcript-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .transcript-table th { text-align: left; padding: 16px; font-size: 10px; font-weight: 900; color: var(--text3); text-transform: uppercase; border-bottom: 1px solid var(--border); }
        .transcript-table td { padding: 20px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        
        .unit-cell { display: flex; flex-direction: column; }
        .unit-name { font-size: 15px; font-weight: 700; color: var(--text); }
        .course-pill { font-size: 11px; font-weight: 700; color: var(--text2); background: var(--bg3); padding: 4px 12px; border-radius: 8px; }
        
        .student-profile { display: flex; align-items: center; gap: 16px; }
        .s-avatar { width: 36px; height: 36px; border-radius: 12px; background: var(--bg3); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: var(--accent); border: 1px solid var(--border); }
        .s-info { display: flex; flex-direction: column; }
        .s-name { font-size: 14px; font-weight: 700; color: var(--text); }
        .s-email { font-size: 11px; color: var(--text3); }

        .acc-pill { padding: 6px 14px; border-radius: 10px; font-size: 11px; font-weight: 800; width: fit-content; }
        .acc-pill.high { background: rgba(79, 247, 184, 0.1); color: var(--accent4); }
        .acc-pill.mid { background: rgba(247, 184, 79, 0.1); color: var(--accent); }
        .acc-pill.low { background: rgba(247, 79, 79, 0.1); color: var(--accent3); }

        .score-val { font-size: 14px; font-weight: 800; color: var(--text); }
        .grade-box { font-size: 16px; font-weight: 900; padding: 4px 12px; border: 2px solid; border-radius: 8px; width: fit-content; }
        .date-cell { font-size: 12px; color: var(--text3); font-weight: 600; }
        .view-link { border: none; background: transparent; color: var(--accent); font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 4px; cursor: pointer; transition: 0.2s; }
        .view-link:hover { transform: translateX(4px); }
        .action-stack-v4 { display: flex; flex-direction: column; gap: 4px; }
        .appeal-link { border: none; background: transparent; color: var(--accent3); font-size: 10px; font-weight: 800; text-transform: uppercase; cursor: pointer; opacity: 0.6; transition: 0.2s; width: fit-content; }
        .appeal-link:hover { opacity: 1; text-decoration: underline; }

        .empty-state-v4 { padding: 60px 0; text-align: center; color: var(--text3); display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .hub-loader { display: flex; align-items: center; justify-content: center; min-height: 400px; }
        .animated-entry { animation: slideUpFade 0.6s both; }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Layout>
  );
};

export default Marks;
