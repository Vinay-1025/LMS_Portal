import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import Layout from '../components/Layout';
import { 
  Shield, AlertTriangle, Clock, Code, 
  ChevronLeft, User, Terminal, CheckCircle2, 
  ExternalLink, Search, Filter, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../styles/theme.css';

const LabReview = () => {
    const { id: labId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    
    const [submissions, setSubmissions] = useState([]);
    const [selectedSub, setSelectedSub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchSubmissions();
    }, [labId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/labs/${labId}/submissions`, config);
            setSubmissions(data);
            if (data.length > 0) setSelectedSub(data[0]);
        } catch (error) {
            toast.error('Failed to load lab submissions');
        } finally {
            setLoading(false);
        }
    };

    const filteredSubmissions = submissions.filter(s => 
        s.studentId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Layout title="Lab Review / Loading...">Loading reports...</Layout>;

    return (
        <Layout title="Lab Review Hub / Proctoring Reports">
            <div className="lab-review-wrapper">
                {/* Header Section */}
                <div className="review-header glass-card">
                    <button onClick={() => navigate('/labs')} className="back-btn">
                        <ChevronLeft size={18} /> Back to Labs
                    </button>
                    <div className="h-meta">
                        <h2>Proctoring Audit: {submissions[0]?.labId?.title || 'Unknown Lab'}</h2>
                        <span className="unit-tag">UNIT-REPORT: {labId.slice(-8).toUpperCase()}</span>
                    </div>
                </div>

                <div className="review-grid">
                    {/* Sidebar: Student List */}
                    <div className="student-sidebar glass-card">
                        <div className="search-box-v4">
                            <Search size={16} />
                            <input 
                                placeholder="Find student..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="student-list">
                            {filteredSubmissions.map(s => (
                                <div 
                                    key={s._id} 
                                    className={`student-item ${selectedSub?._id === s._id ? 'active' : ''}`}
                                    onClick={() => setSelectedSub(s)}
                                >
                                    <div className="s-avatar">{s.studentId?.name.charAt(0)}</div>
                                    <div className="s-info">
                                        <span className="s-name">{s.studentId?.name}</span>
                                        <div className="s-status-row">
                                           <span className={`status-pill ${s.status.toLowerCase()}`}>{s.status}</span>
                                           {s.incidents?.length > 0 && (
                                               <span className="incident-count">
                                                   <AlertTriangle size={10} /> {s.incidents.length}
                                               </span>
                                           )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Section: Audit Logic */}
                    <div className="audit-main">
                        {!selectedSub ? (
                            <div className="empty-audit glass-card">
                                <User size={48} opacity={0.1} />
                                <p>Select a student to audit their session</p>
                            </div>
                        ) : (
                            <>
                                {/* Top: Metrics */}
                                <div className="audit-metrics-grid">
                                    <div className="metric-card glass-card">
                                        <Terminal size={18} color="var(--accent)" />
                                        <div className="m-data">
                                            <p>Last Sync</p>
                                            <h3>{new Date(selectedSub.lastSaved).toLocaleTimeString()}</h3>
                                        </div>
                                    </div>
                                    <div className="metric-card glass-card">
                                        <Shield size={18} color="var(--accent3)" />
                                        <div className="m-data">
                                            <p>Security Status</p>
                                            <h3 style={{ color: selectedSub.incidents?.length > 0 ? 'var(--accent3)' : 'var(--accent4)' }}>
                                                {selectedSub.incidents?.length > 0 ? 'Flagged' : 'Clean'}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="metric-card glass-card">
                                        <Calendar size={18} color="var(--accent2)" />
                                        <div className="m-data">
                                            <p>Submitted On</p>
                                            <h3>{selectedSub.status === 'Submitted' ? new Date(selectedSub.updatedAt).toLocaleDateString() : 'Pending'}</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-split">
                                    {/* Left: Code View */}
                                    <div className="code-viewer glass-card">
                                        <div className="cv-header">
                                            <div className="flex-h"><Code size={16} /> <span>Student Workspace</span></div>
                                            <span className="lang-tag">{selectedSub.language.toUpperCase()}</span>
                                        </div>
                                        <div className="editor-wrap">
                                            <Editor 
                                                height="100%"
                                                language={selectedSub.language}
                                                theme="vs-dark"
                                                value={selectedSub.code}
                                                options={{
                                                    readOnly: true,
                                                    fontSize: 13,
                                                    minimap: { enabled: false },
                                                    fontFamily: "JetBrains Mono, monospace"
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Right: Incident Timeline */}
                                    <div className="incident-timeline glass-card">
                                        <div className="cv-header">
                                            <div className="flex-h"><AlertTriangle size={16} color="var(--accent3)" /> <span>Proctoring Log</span></div>
                                        </div>
                                        <div className="timeline-list">
                                            {selectedSub.incidents?.length === 0 ? (
                                                <div className="no-incidents">
                                                    <CheckCircle2 size={32} color="var(--accent4)" />
                                                    <p>Academic integrity verified. No security incidents recorded.</p>
                                                </div>
                                            ) : (
                                                selectedSub.incidents.map((inc, i) => (
                                                    <div key={i} className="timeline-item">
                                                        <div className="t-icon"><Clock size={12} /></div>
                                                        <div className="t-content">
                                                            <div className="t-header">
                                                                <span className="t-type">{inc.type.replace('_', ' ')}</span>
                                                                <span className="t-time">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                                                            </div>
                                                            <p className="t-details">{inc.details}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .lab-review-wrapper { display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.6s ease; }
                
                .review-header { padding: 24px 32px; display: flex; align-items: center; gap: 32px; border: 1px solid var(--border); }
                .back-btn { background: var(--bg3); border: 1px solid var(--border); color: var(--text2); padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
                .back-btn:hover { background: var(--border); color: var(--text); }
                .h-meta h2 { font-size: 20px; font-weight: 900; margin: 0; color: var(--text); }
                .unit-tag { font-size: 10px; font-weight: 900; color: var(--accent); background: rgba(79, 142, 247, 0.1); padding: 4px 10px; border-radius: 6px; letter-spacing: 1px; }

                .review-grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; min-height: calc(100vh - 250px); }
                
                .student-sidebar { display: flex; flex-direction: column; border: 1px solid var(--border); overflow: hidden; }
                .search-box-v4 { padding: 16px; border-bottom: 1px solid var(--border); background: var(--bg2); display: flex; align-items: center; gap: 12px; }
                .search-box-v4 input { background: transparent; border: none; color: var(--text); outline: none; width: 100%; font-size: 14px; }
                
                .student-list { flex: 1; overflow-y: auto; }
                .student-item { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px; cursor: pointer; transition: 0.2s; }
                .student-item:hover { background: var(--bg3); }
                .student-item.active { background: rgba(79, 142, 247, 0.05); border-left: 4px solid var(--accent); }
                
                .s-avatar { width: 36px; height: 36px; border-radius: 12px; background: var(--bg3); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--accent); border: 1px solid var(--border); }
                .s-info { display: flex; flex-direction: column; gap: 4px; flex: 1; }
                .s-name { font-size: 14px; font-weight: 800; color: var(--text); }
                .s-status-row { display: flex; align-items: center; gap: 8px; }
                .status-pill { font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
                .status-pill.submitted { background: rgba(79, 247, 184, 0.1); color: var(--accent4); }
                .status-pill.draft { background: rgba(247, 184, 79, 0.1); color: var(--accent); }
                .incident-count { font-size: 9px; font-weight: 900; color: var(--accent3); background: rgba(247, 79, 79, 0.1); padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px; }

                .audit-main { display: flex; flex-direction: column; gap: 24px; }
                .empty-audit { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--text3); }
                
                .audit-metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                .metric-card { padding: 20px 24px; border: 1px solid var(--border); display: flex; align-items: center; gap: 16px; }
                .m-data p { font-size: 10px; font-weight: 800; color: var(--text3); text-transform: uppercase; margin: 0; }
                .m-data h3 { font-size: 16px; font-weight: 900; margin: 4px 0 0; font-family: 'Syne', sans-serif; }

                .detail-split { display: grid; grid-template-columns: 1fr 380px; gap: 24px; flex: 1; }
                .code-viewer { border: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
                .cv-header { padding: 12px 20px; background: var(--bg2); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
                .flex-h { display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 800; color: var(--text2); text-transform: uppercase; }
                .lang-tag { font-size: 10px; font-weight: 900; color: var(--accent); background: var(--bg3); padding: 4px 8px; border-radius: 4px; }
                .editor-wrap { flex: 1; min-height: 400px; padding: 12px; background: #1e1e1e; }

                .incident-timeline { border: 1px solid var(--border); display: flex; flex-direction: column; background: var(--bg2); }
                .timeline-list { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
                .no-incidents { text-align: center; padding: 48px 0; color: var(--text3); display: flex; flex-direction: column; align-items: center; gap: 16px; }
                .no-incidents p { font-size: 13px; font-weight: 600; line-height: 1.6; }

                .timeline-item { display: flex; gap: 16px; position: relative; }
                .timeline-item:not(:last-child)::after { content: ''; position: absolute; left: 6px; top: 20px; bottom: -20px; width: 1px; background: var(--border); }
                .t-icon { width: 13px; height: 13px; border-radius: 50%; background: var(--accent3); position: relative; z-index: 1; margin-top: 4px; outline: 4px solid var(--bg2); }
                .t-content { flex: 1; background: var(--bg3); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border); }
                .t-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
                .t-type { font-size: 11px; font-weight: 900; color: var(--accent3); text-transform: uppercase; letter-spacing: 0.5px; }
                .t-time { font-size: 10px; color: var(--text3); font-weight: 700; }
                .t-details { font-size: 12px; color: var(--text2); line-height: 1.5; margin: 0; }
            `}</style>
        </Layout>
    );
};

export default LabReview;
