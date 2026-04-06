import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Layout from '../components/Layout';
import { 
  Plus, Trash2, Save, X, ChevronLeft, 
  ChevronRight, CheckCircle, HelpCircle, List, 
  Clock, FileText, AlertCircle, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../styles/theme.css';

const AssessmentBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    timeLimit: 30,
    questions: [
      { text: '', options: ['', '', '', ''], correctIndex: 0, points: 1 }
    ]
  });

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    fetchCourses();
    if (id) fetchAssessment();
  }, [id]);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/courses', config);
      // Filter for tutor's courses if not admin
      const tutorCourses = user.role === 'admin' ? data : data.filter(c => c.tutor?._id === user._id || c.tutor === user._id);
      setCourses(tutorCourses);
      if (tutorCourses.length > 0 && !formData.courseId) {
        setFormData(prev => ({ ...prev, courseId: tutorCourses[0]._id }));
      }
    } catch (error) { toast.error('Failed to load courses'); }
  };

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/assessments/${id}`, config);
      setFormData({
        title: data.title,
        description: data.description,
        courseId: data.courseId?._id || data.courseId,
        timeLimit: data.timeLimit,
        questions: data.questions
      });
    } catch (error) { toast.error('Failed to load assessment'); }
    finally { setLoading(false); }
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { text: '', options: ['', '', '', ''], correctIndex: 0, points: 1 }]
    });
  };

  const handleRemoveQuestion = (index) => {
    if (formData.questions.length === 1) return toast.error('At least one question required');
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (qIdx, optIdx, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIdx].options[optIdx] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSave = async () => {
    // Basic Validation
    if (!formData.title || !formData.courseId) return toast.error('Basic information missing');
    if (formData.questions.some(q => !q.text || q.options.some(o => !o))) {
      return toast.error('Please complete all questions and options');
    }

    setLoading(true);
    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/assessments/${id}`, formData, config);
        toast.success('Protocol updated');
      } else {
        await axios.post('http://localhost:5000/api/assessments', formData, config);
        toast.success('New quiz deployed');
      }
      navigate('/assessments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={id ? "Edit Assessment Protocol" : "Deploy New Assessment"}>
      <div className="builder-header-tier">
        <div className="step-tracker">
          <div className={`step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`} onClick={() => setStep(1)}>
            <div className="step-num">{step > 1 ? <CheckCircle size={14} /> : 1}</div>
            <span>Protocol Logic</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`} onClick={() => step >= 1 && setStep(2)}>
            <div className="step-num">{step > 2 ? <CheckCircle size={14} /> : 2}</div>
            <span>Sequence Matrix</span>
          </div>
        </div>
        <div className="builder-actions">
           <button onClick={() => navigate('/assessments')} className="icon-btn-lite"><X size={18} /></button>
           <button onClick={handleSave} disabled={loading} className="premium-btn">
             <Save size={18} /> {loading ? 'Saving...' : 'Deploy Protocol'}
           </button>
        </div>
      </div>

      <div className="builder-content-v3">
        {step === 1 ? (
          <div className="glass-card core-info-matrix animated-entry">
             <div className="matrix-header">
                <Sparkles size={18} color="var(--accent)" />
                <h3>Primary Protocol Parameters</h3>
             </div>
             <div className="matrix-form">
                <div className="field-group full">
                   <label>Course Synchronization</label>
                   <select 
                    value={formData.courseId} 
                    onChange={e => setFormData({...formData, courseId: e.target.value})}
                    className="builder-select"
                   >
                     {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                   </select>
                </div>
                <div className="field-group full">
                   <label>Protocol Designation (Title)</label>
                   <input 
                    placeholder="e.g., Advanced React Patterns Midterm" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="builder-input"
                   />
                </div>
                <div className="field-group full">
                   <label>Executive Briefing (Description)</label>
                   <textarea 
                    rows="4" 
                    placeholder="Provide context for the learners..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="builder-textarea"
                   />
                </div>
                <div className="field-row">
                   <div className="field-group">
                      <label><Clock size={14} /> Latency Limit (Min)</label>
                      <input 
                       type="number" 
                       value={formData.timeLimit}
                       onChange={e => setFormData({...formData, timeLimit: e.target.value})}
                       className="builder-input"
                      />
                   </div>
                   <div className="field-group">
                      <label><HelpCircle size={14} /> Sequence Count</label>
                      <div className="static-val">{formData.questions.length} Units</div>
                   </div>
                </div>
             </div>
             <div className="matrix-footer">
                <button onClick={() => setStep(2)} className="next-phase-btn">Configure Matrix Sequence <ChevronRight size={18} /></button>
             </div>
          </div>
        ) : (
          <div className="question-matrix animated-entry">
             {formData.questions.map((q, qIdx) => (
               <div key={qIdx} className="glass-card question-unit-card">
                  <div className="unit-header">
                     <div className="unit-index">SEQ-0{qIdx + 1}</div>
                     <button onClick={() => handleRemoveQuestion(qIdx)} className="remove-unit-btn"><Trash2 size={16} /></button>
                  </div>
                  <div className="unit-body">
                     <div className="field-group full">
                        <label>Probe Definition (Question)</label>
                        <input 
                         placeholder="Enter question text..." 
                         value={q.text}
                         onChange={e => updateQuestion(qIdx, 'text', e.target.value)}
                         className="builder-input-unit"
                        />
                     </div>
                     <div className="options-grid-v3">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`option-slot ${q.correctIndex === oIdx ? 'correct' : ''}`}>
                             <div className="slot-indicator" onClick={() => updateQuestion(qIdx, 'correctIndex', oIdx)}>
                                {q.correctIndex === oIdx ? <CheckCircle size={14} /> : oIdx + 1}
                             </div>
                             <input 
                              placeholder={`Option ${oIdx + 1}`} 
                              value={opt}
                              onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                              className="option-val-input"
                             />
                          </div>
                        ))}
                     </div>
                     <div className="unit-meta">
                        <div className="point-selector">
                           <span>Points Allocation:</span>
                           <input 
                            type="number" 
                            min="1" 
                            value={q.points}
                            onChange={e => updateQuestion(qIdx, 'points', parseInt(e.target.value))}
                           />
                        </div>
                     </div>
                  </div>
               </div>
             ))}
             
             <button onClick={handleAddQuestion} className="glass-card add-unit-banner">
                <Plus size={24} /> <span>Integrate New Sequence Unit</span>
             </button>
             
             <div className="matrix-nav-row">
                <button onClick={() => setStep(1)} className="prev-phase-btn"><ChevronLeft size={18} /> Protocol Logic</button>
                <button onClick={handleSave} className="premium-btn">Complete Matrix & Deploy</button>
             </div>
          </div>
        )}
      </div>

      <style>{`
        .builder-header-tier { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .step-tracker { display: flex; align-items: center; gap: 16px; }
        .step-item { display: flex; align-items: center; gap: 12px; cursor: pointer; opacity: 0.5; transition: 0.3s; }
        .step-item.active { opacity: 1; }
        .step-item.completed { opacity: 0.8; }
        .step-num { width: 28px; height: 28px; border-radius: 50%; background: var(--bg3); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; border: 1px solid var(--border); }
        .step-item.active .step-num { background: var(--accent); color: white; border-color: var(--accent); box-shadow: 0 0 12px var(--accent); }
        .step-item.completed .step-num { background: var(--accent4); color: white; border-color: var(--accent4); }
        .step-item span { font-size: 13px; font-weight: 700; color: var(--text); }
        .step-line { width: 40px; height: 2px; background: var(--border); border-radius: 2px; }

        .builder-actions { display: flex; gap: 12px; }
        .icon-btn-lite { background: var(--bg2); border: 1px solid var(--border); color: var(--text3); padding: 10px; border-radius: 12px; cursor: pointer; transition: 0.2s; }
        .icon-btn-lite:hover { color: var(--accent3); border-color: var(--accent3); }

        .core-info-matrix { max-width: 800px; margin: 0 auto; }
        .matrix-header { padding: 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
        .matrix-header h3 { font-size: 16px; font-weight: 800; margin: 0; font-family: 'Syne', sans-serif; }
        .matrix-form { padding: 32px; display: grid; gap: 24px; }
        
        .field-group label { display: block; font-size: 10px; font-weight: 800; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .builder-select, .builder-input, .builder-textarea { width: 100%; background: var(--bg3); border: 1px solid var(--border); padding: 14px; border-radius: 14px; color: var(--text); font-size: 14px; font-weight: 500; outline: none; transition: 0.3s; }
        .builder-select:focus, .builder-input:focus, .builder-textarea:focus { border-color: var(--accent); background: var(--bg2); }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .static-val { padding: 14px; border-radius: 14px; background: var(--bg2); border: 1px solid var(--border); font-size: 14px; font-weight: 700; color: var(--accent); }

        .matrix-footer { padding: 24px 32px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
        .next-phase-btn { background: var(--accent); color: white; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s; }
        .next-phase-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(79, 142, 247, 0.4); }

        .question-matrix { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; padding-bottom: 80px; }
        .question-unit-card { padding: 0; overflow: hidden; }
        .unit-header { padding: 12px 24px; background: var(--bg3); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
        .unit-index { font-size: 10px; font-weight: 900; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
        .remove-unit-btn { background: none; border: none; color: var(--text3); cursor: pointer; transition: 0.2s; }
        .remove-unit-btn:hover { color: var(--accent3); }
        
        .unit-body { padding: 24px; display: grid; gap: 20px; }
        .builder-input-unit { width: 100%; background: var(--bg2); border: 1px solid var(--border); padding: 16px; border-radius: 12px; color: var(--text); font-size: 16px; font-weight: 600; outline: none; transition: 0.3s; }
        .builder-input-unit:focus { border-color: var(--accent); }

        .options-grid-v3 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .option-slot { display: flex; align-items: center; gap: 12px; background: var(--bg3); padding: 12px; border-radius: 12px; border: 1px solid var(--border); transition: 0.3s; }
        .option-slot.correct { border-color: var(--accent4); background: rgba(79, 247, 184, 0.05); }
        .slot-indicator { width: 24px; height: 24px; border-radius: 50%; background: var(--bg2); color: var(--text3); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; cursor: pointer; transition: 0.3s; border: 1px solid var(--border); }
        .option-slot.correct .slot-indicator { background: var(--accent4); color: white; border-color: var(--accent4); box-shadow: 0 0 10px var(--accent4); }
        .option-val-input { background: transparent; border: none; color: var(--text); font-size: 14px; font-weight: 500; outline: none; width: 100%; }
        
        .unit-meta { padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
        .point-selector { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text3); font-weight: 700; }
        .point-selector input { width: 50px; background: var(--bg3); border: 1px solid var(--border); padding: 4px 8px; border-radius: 6px; color: var(--accent); text-align: center; }

        .add-unit-banner { padding: 24px; display: flex; align-items: center; justify-content: center; gap: 16px; border: 2px dashed var(--border); color: var(--text3); transition: 0.3s; cursor: pointer; width: 100%; background: var(--bg2); }
        .add-unit-banner:hover { border-color: var(--accent); color: var(--accent); background: rgba(79, 142, 247, 0.05); }
        .add-unit-banner span { font-weight: 800; font-size: 15px; }

        .matrix-nav-row { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; }
        .prev-phase-btn { background: transparent; border: 1px solid var(--border); color: var(--text2); padding: 14px 24px; border-radius: 16px; font-weight: 700; display: flex; align-items: center; gap: 10px; cursor: pointer; }

        .animated-entry { animation: slideUpFade 0.5s both; }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Layout>
  );
};

export default AssessmentBuilder;
