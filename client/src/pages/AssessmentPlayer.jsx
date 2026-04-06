import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  ChevronLeft, ChevronRight, Clock, CheckCircle, 
  AlertTriangle, X, Play, Target, Award, 
  HelpCircle, Zap, Shield
} from 'lucide-react';
import '../styles/theme.css';

const AssessmentPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    
    const [assessment, setAssessment] = useState(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);

    const timerRef = useRef(null);
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchAssessment();
        return () => clearInterval(timerRef.current);
    }, [id]);

    const fetchAssessment = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/assessments/${id}`, config);
            setAssessment(data);
            setAnswers(data.submission ? data.submission.answers : new Array(data.questions.length).fill(null));
            setTimeLeft(data.timeLimit * 60);
            if (data.submission) {
                setResult(data.submission);
                setSubmitted(true);
            }
            setLoading(false);
        } catch (error) { setLoading(false); }
    };

    const startTest = () => {
        setIsStarted(true);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleOptionSelect = (optionIdx) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIdx] = optionIdx;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        clearInterval(timerRef.current);
        try {
            const { data } = await axios.post(`http://localhost:5000/api/assessments/${id}/submit`, { answers }, config);
            setResult(data);
            setSubmitted(true);
            toast.success('Protocol finalized');
        } catch (error) { toast.error('Submission disruption'); }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return <div className="p-loader"><div className="spinner"></div></div>;
    if (!assessment) return <div className="p-error">PROTOCOL NOT FOUND</div>;

    if (submitted && result) {
        return (
            <div className="result-shell animated-entry">
                <div className="glass-card result-card">
                    <div className="award-v4"><Award size={40} /></div>
                    <h1>Protocol Analyzed</h1>
                    <p className="unit-name">{assessment.title}</p>
                    
                    <div className="score-matrix-v4">
                        <div className="matrix-unit">
                            <span className="label">SCORE PARITY</span>
                            <h2 className="val green">{result.score} <small>/ {result.totalPoints}</small></h2>
                        </div>
                        <div className="matrix-unit">
                            <span className="label">ACCURACY REF</span>
                            <h2 className="val blue">{Math.round((result.score / result.totalPoints) * 100)}%</h2>
                        </div>
                    </div>

                    <div className="result-actions">
                        <Link to="/assessments" className="premium-btn full-width">Exit Dashboard</Link>
                        <button onClick={() => { setSubmitted(false); setIsReviewing(true); setIsStarted(true); }} className="secondary-v4-btn full-width">Review Sequence</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isStarted) {
        return (
            <div className="intro-shell animated-entry">
               <div className="glass-card intro-card">
                    <Shield size={48} color="var(--accent)" className="intro-icon" />
                    <h2>{assessment.title}</h2>
                    <p className="description-v4">{assessment.description}</p>
                    
                    <div className="briefing-box">
                        <div className="brief-item"><Clock size={16} /> <span><strong>Time Limit:</strong> {assessment.timeLimit} Min</span></div>
                        <div className="brief-item"><HelpCircle size={16} /> <span><strong>Sequence:</strong> {assessment.questions.length} Units</span></div>
                        <div className="brief-item"><Zap size={16} /> <span><strong>Alert:</strong> Auto-submission protocol active.</span></div>
                    </div>

                    <button onClick={startTest} className="premium-btn full-width-v4">
                        Start Assessment Protocol <Play size={18} />
                    </button>
               </div>
            </div>
        );
    }

    const q = assessment.questions[currentQuestionIdx];

    return (
        <div className="player-matrix-v4">
            <div className="focus-header">
                <div className="header-left">
                    <button onClick={() => navigate('/assessments')} className="close-v4"><X size={20} /></button>
                    <div className="title-stack">
                        <span className="id-ref">PROTOCOL: {assessment.title}</span>
                        <h3>Question {currentQuestionIdx + 1} OF {assessment.questions.length}</h3>
                    </div>
                </div>
                
                <div className={`timer-v4 ${timeLeft < 60 ? 'critical' : ''}`}>
                    <Clock size={20} />
                    <span>{formatTime(timeLeft)}</span>
                </div>

                <div className="header-actions">
                    {isReviewing ? (
                        <button onClick={() => setSubmitted(true)} className="premium-btn">Back to Analysis</button>
                    ) : (
                        <button onClick={handleSubmit} className="premium-btn">Finish & Deploy</button>
                    )}
                </div>
            </div>

            <div className="main-test-layout">
                <div className="sequence-viewport">
                    <div className="probe-container">
                        <h2>{q.text}</h2>
                        <div className="option-grid-v4">
                            {q.options.map((opt, i) => {
                                const isCorrect = i === q.correctIndex;
                                const isSelected = answers[currentQuestionIdx] === i;
                                let stateClass = '';
                                if (isReviewing) {
                                    if (isCorrect) stateClass = 'correct';
                                    else if (isSelected && !isCorrect) stateClass = 'wrong';
                                } else if (isSelected) stateClass = 'selected';

                                return (
                                    <div 
                                        key={i}
                                        onClick={() => !isReviewing && handleOptionSelect(i)}
                                        className={`option-v4 ${stateClass}`}
                                    >
                                        <div className="radio-v4">{isSelected && <div className="inner"></div>}</div>
                                        <span className="text">{opt}</span>
                                        {isReviewing && isCorrect && <CheckCircle size={18} className="icon c" />}
                                        {isReviewing && isSelected && !isCorrect && <X size={18} className="icon w" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="nav-row-v4">
                        <button disabled={currentQuestionIdx === 0} onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)} className="nav-v4-btn">
                            <ChevronLeft size={20} /> Previous Phase
                        </button>
                        <button disabled={currentQuestionIdx === assessment.questions.length - 1} onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)} className="nav-v4-btn primary">
                            Next Phase <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="map-sidebar">
                   <div className="glass-card map-card">
                      <h3>Protocol Map</h3>
                      <div className="map-grid">
                         {assessment.questions.map((_, i) => (
                           <div key={i} onClick={() => setCurrentQuestionIdx(i)} className={`map-node ${currentQuestionIdx === i ? 'active' : answers[i] !== null ? 'done' : ''}`}>
                             {i + 1}
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
            </div>

            <style>{`
                .player-matrix-v4 { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; animation: fadeIn 0.4s both; }
                .focus-header { padding: 0 40px; height: 90px; background: var(--bg2); border-bottom: 2px solid var(--border); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
                
                .header-left { display: flex; align-items: center; gap: 24px; }
                .close-v4 { background: var(--bg3); border: 1px solid var(--border); color: var(--text3); padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
                .close-v4:hover { color: var(--accent3); border-color: var(--accent3); }
                .title-stack h3 { font-size: 16px; font-weight: 800; margin: 0; }
                .id-ref { font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; }

                .timer-v4 { display: flex; align-items: center; gap: 12px; font-size: 24px; font-weight: 900; font-family: 'Syne', sans-serif; padding: 8px 24px; background: rgba(79, 142, 247, 0.1); color: var(--accent); border-radius: 16px; }
                .timer-v4.critical { background: rgba(247, 79, 79, 0.1); color: var(--accent3); animation: shake 0.5s infinite; }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(2px); } }

                .main-test-layout { flex: 1; display: grid; grid-template-columns: 1fr 340px; gap: 40px; padding: 40px; max-width: 1400px; margin: 0 auto; width: 100%; }
                .probe-container h2 { font-size: 28px; font-weight: 800; line-height: 1.4; margin-bottom: 40px; font-family: 'Syne', sans-serif; }
                .option-grid-v4 { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
                .option-v4 { padding: 24px; border-radius: 20px; background: var(--bg2); border: 1px solid var(--border); cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; gap: 20px; }
                .option-v4:hover { border-color: var(--accent); transform: translateX(8px); background: var(--bg3); }
                .option-v4.selected { border-color: var(--accent); background: rgba(79, 142, 247, 0.05); }
                .option-v4.correct { border-color: var(--accent4); background: rgba(79, 247, 184, 0.05); }
                .option-v4.wrong { border-color: var(--accent3); background: rgba(247, 79, 79, 0.05); }
                
                .radio-v4 { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; }
                .selected .radio-v4 { border-color: var(--accent); } .selected .radio-v4 .inner { width: 10px; height: 10px; background: var(--accent); border-radius: 50%; }
                .option-v4 .text { font-size: 16px; font-weight: 600; color: var(--text2); }
                .option-v4.selected .text { color: var(--text); }
                .option-v4 .icon { margin-left: auto; }
                .icon.c { color: var(--accent4); } .icon.w { color: var(--accent3); }

                .nav-row-v4 { display: flex; gap: 20px; margin-top: auto; }
                .nav-v4-btn { padding: 16px 32px; border-radius: 16px; border: 1px solid var(--border); background: var(--bg2); color: var(--text); font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
                .nav-v4-btn.primary { background: var(--bg3); } .nav-v4-btn:hover:not(:disabled) { border-color: var(--accent); transform: translateY(-2px); }
                .nav-v4-btn:disabled { opacity: 0.3; cursor: not-allowed; }

                .map-card { padding: 32px; }
                .map-card h3 { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); margin-bottom: 24px; }
                .map-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
                .map-node { aspect-ratio: 1; border-radius: 12px; background: var(--bg3); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; cursor: pointer; transition: 0.2s; color: var(--text3); }
                .map-node.active { background: var(--accent); color: white; border-color: var(--accent); box-shadow: 0 0 16px var(--accent); }
                .map-node.done { background: rgba(79, 247, 184, 0.1); color: var(--accent4); border-color: var(--accent4); }

                .result-shell, .intro-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: radial-gradient(circle at top right, var(--bg2), var(--bg)); }
                .result-card, .intro-card { max-width: 600px; width: 100%; padding: 48px; text-align: center; }
                .award-v4 { width: 80px; height: 80px; border-radius: 50%; background: var(--bg3); color: var(--accent4); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; border: 2px solid var(--accent4); box-shadow: 0 0 20px var(--accent4); }
                .result-card h1 { font-size: 36px; font-weight: 900; margin-bottom: 8px; font-family: 'Syne', sans-serif; }
                .score-matrix-v4 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 40px 0; }
                .matrix-unit { padding: 24px; background: var(--bg3); border-radius: 20px; border: 1px solid var(--border); }
                .matrix-unit .label { font-size: 9px; font-weight: 900; color: var(--text3); letter-spacing: 1px; }
                .matrix-unit .val { font-size: 32px; font-weight: 900; margin: 8px 0 0 0; font-family: 'Syne', sans-serif; }
                .val.green { color: var(--accent4); } .val.blue { color: var(--accent); }
                .secondary-v4-btn { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 14px; border-radius: 12px; font-weight: 800; cursor: pointer; margin-top: 12px; }

                .intro-icon { margin-bottom: 24px; }
                .description-v4 { color: var(--text2); margin-bottom: 32px; line-height: 1.6; }
                .briefing-box { padding: 24px; background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; text-align: left; }
                .brief-item { display: flex; align-items: center; gap: 12px; font-size: 14px; }
            `}</style>
        </div>
    );
};

export default AssessmentPlayer;
