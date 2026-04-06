import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import Layout from '../components/Layout';
import { Terminal, Play, Save, Settings, Code, Command, Share2, HelpCircle, ChevronRight, Zap, Trash2, Moon, Sun, Shield, AlertTriangle, CheckCircle2, XCircle, Maximize, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../styles/theme.css';

const CodingLabs = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { isMobile } = useSelector((state) => state.layout || { isMobile: false });
    const [labs, setLabs] = useState([]);
    const [selectedLab, setSelectedLab] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [theme, setTheme] = useState('vs-dark');
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [showProctorModal, setShowProctorModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const saveTimeoutRef = useRef(null);
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    // Fetch labs on mount
    useEffect(() => {
        const fetchLabs = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/labs', config);
                setLabs(data);
                if (data.length > 0) handleSelectLab(data[0]);
            } catch (error) {
                console.error('Error fetching labs:', error);
            }
        };
        fetchLabs();
    }, []);

    const handleSelectLab = async (lab) => {
        setSelectedLab(lab);
        setLanguage(lab.languages[0]);

        // Try to fetch saved workspace
        try {
            const { data } = await axios.get(`http://localhost:5000/api/labs/workspace?labId=${lab._id}&language=${lab.languages[0]}`, config);
            if (data) {
                setCode(data.code);
                setIsSubmitted(data.status === 'Submitted');
            } else {
                setCode(lab.initialCode[lab.languages[0]] || '');
                setIsSubmitted(false);
            }
        } catch (error) {
            setCode(lab.initialCode[lab.languages[0]] || '');
            setIsSubmitted(false);
        }

        // Proctoring initialization
        if (lab.isProctored && user.role === 'student') {
            setShowProctorModal(true);
        }
    };

    const handleLanguageChange = async (newLang) => {
        setLanguage(newLang);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/labs/workspace?labId=${selectedLab._id}&language=${newLang}`, config);
            if (data && data.code) {
                setCode(data.code);
            } else {
                setCode(selectedLab.initialCode[newLang] || '');
            }
        } catch (error) {
            setCode(selectedLab.initialCode[newLang] || '');
        }
    };

    // Auto-save logic
    useEffect(() => {
        if (!selectedLab || isSubmitted) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);
            try {
                await axios.post('http://localhost:5000/api/labs/save', {
                    labId: selectedLab._id,
                    language,
                    code
                }, config);
            } catch (error) {
                console.error('Auto-save failed');
            } finally {
                setIsSaving(false);
            }
        }, 5000);

        return () => clearTimeout(saveTimeoutRef.current);
    }, [code, language, selectedLab, isSubmitted]);

    // Proctoring Engine
    useEffect(() => {
        if (!selectedLab?.isProctored || user.role !== 'student' || isSubmitted) return;

        const logIncident = async (type, details) => {
            try {
                await axios.post('http://localhost:5000/api/labs/log-incident', {
                    labId: selectedLab._id,
                    language,
                    type,
                    details
                }, config);
                toast.error(`Security Alert: ${type.replace('_', ' ')} detected and logged.`, {
                    icon: <AlertTriangle color="var(--accent3)" />,
                    style: { background: '#1a1a1a', color: '#fff', border: '1px solid var(--accent3)' }
                });
            } catch (err) { console.error('Incident logging failed'); }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                logIncident('TAB_SWITCH', 'Student left the assessment tab');
            }
        };

        const handleBlur = () => {
            logIncident('WINDOW_BLUR', 'Student switched focus away from browser window');
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                logIncident('EXIT_FULLSCREEN', 'Student exited proctored full-screen mode');
            } else {
                setIsFullscreen(true);
            }
        };

        const handlePaste = (e) => {
            e.preventDefault();
            logIncident('CLIPBOARD_PASTE', 'Attempted to paste external code');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('paste', handlePaste);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('paste', handlePaste);
        };
    }, [selectedLab, isSubmitted]);

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        }
        setShowProctorModal(false);
        setIsFullscreen(true);
    };

    const runCode = async (isSubmit = false) => {
        setIsRunning(true);
        setOutput([{ type: 'status', content: isSubmit ? '➜ Initiating Final Validation...' : `➜ Compiling ${language}...` }]);

        let finalStdout = '';
        if (language === 'javascript') {
            const logs = [];
            const customConsole = {
                log: (...args) => logs.push({ type: 'log', content: args.join(' ') }),
                error: (...args) => logs.push({ type: 'error', content: args.join(' ') }),
                warn: (...args) => logs.push({ type: 'warn', content: args.join(' ') }),
            };

            try {
                // Execute JS locally for instant feedback
                const run = new Function('console', code);
                run(customConsole);
                finalStdout = logs.map(l => l.content).join('\n');
                setOutput(prev => [...prev, ...logs, { type: 'status', content: '✓ Execution Finished' }]);
            } catch (error) {
                setOutput(prev => [...prev, { type: 'error', content: error.toString() }]);
            }
        } else {
            // Use Piston API for Python/Java
            try {
                const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
                    language: language === 'python' ? 'python' : language,
                    version: '*',
                    files: [{ content: code }]
                });
                const result = response.data.run;
                finalStdout = result.stdout;
                const newLogs = [];
                if (result.stdout) newLogs.push({ type: 'log', content: result.stdout });
                if (result.stderr) newLogs.push({ type: 'error', content: result.stderr });
                setOutput(prev => [...prev, ...newLogs, { type: 'status', content: `✓ Process exited with code ${result.code}` }]);
            } catch (error) {
                setOutput(prev => [...prev, { type: 'error', content: 'Execution Engine Offline' }]);
            }
        }

        // Verify test cases if present
        if (selectedLab.testCases?.length > 0) {
            const results = selectedLab.testCases.map(tc => {
                const passed = finalStdout.trim().includes(tc.expected.trim());
                return { ...tc, passed };
            });
            setTestResults(results);
            if (!isSubmit) setActiveTab('tests');
        }

        setIsRunning(false);
        return finalStdout;
    };

    const submitFinal = async () => {
        if (isSubmitted) return;
        const confirm = window.confirm("Are you sure you want to finalize your submission? This will lock the editor.");
        if (!confirm) return;

        setIsRunning(true);
        try {
            // Run one last validation
            await runCode(true);
            
            await axios.post('http://localhost:5000/api/labs/submit', {
                labId: selectedLab._id,
                language
            }, config);
            
            setIsSubmitted(true);
            toast.success('Assessment Submitted Successfully!', { icon: '🚀' });
        } catch (error) {
            toast.error('Submission failed');
        } finally {
            setIsRunning(false);
        }
    };

    if (isMobile) {
        return (
            <Layout title="Coding Labs / Restricted">
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: 'calc(100vh - 200px)', 
                    textAlign: 'center',
                    padding: '24px'
                }}>
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(79, 142, 247, 0.1)', 
                        borderRadius: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        marginBottom: '24px'
                    }}>
                        <Terminal size={40} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Desktop Only Feature</h2>
                    <p style={{ color: 'var(--text3)', fontSize: '15px', maxWidth: '300px', lineHeight: '1.6' }}>
                        The Coding Labs IDE requires a larger screen for a proper development experience. Please switch to a desktop device to continue coding.
                    </p>
                </div>
            </Layout>
        );
    }

    if (!selectedLab) return <Layout title="Coding Labs">Loading IDE...</Layout>;

    return (
        <Layout title={`Coding Labs / ${selectedLab.isProctored ? 'PROCTORED EXAM' : 'SANDBOX'}`}>
            {selectedLab.isProctored && !isSubmitted && (
                <div style={{ background: '#f74f4f', color: '#fff', padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: '800' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield size={16} /> 
                        SECURE ENVIRONMENT ACTIVE • TAB SWITCHING AND CLIPBOARD ACTIONS ARE MONITORED
                    </div>
                    {!isFullscreen && (
                        <button onClick={enterFullscreen} style={{ background: '#fff', color: '#f74f4f', border: 'none', padding: '4px 12px', borderRadius: '4px', fontWeight: '900', cursor: 'pointer' }}>
                            RESTORE FULL SCREEN
                        </button>
                    )}
                </div>
            )}

            {showProctorModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: 'var(--bg)', padding: '48px', borderRadius: '32px', maxWidth: '500px', textAlign: 'center', border: '1px solid var(--border)' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(247, 79, 79, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f74f4f', margin: '0 auto 32px' }}>
                            <Shield size={40} />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '16px' }}>Proctored Assessment</h2>
                        <p style={{ color: 'var(--text2)', marginBottom: '32px', lineHeight: '1.6' }}>
                            This lab is being proctored. By entering, you agree to:
                            <br/><br/>
                            1. Stay in Full Screen mode<br/>
                            2. Not switch tabs or browser windows<br/>
                            3. Not use external clipboard data
                        </p>
                        <button onClick={enterFullscreen} className="premium-btn" style={{ width: '100%', padding: '16px', background: '#f74f4f' }}>
                            I AGREE • ENTER FULL SCREEN
                        </button>
                    </div>
                </div>
            )}

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'minmax(300px, 1fr) 3fr', 
                gap: '2px', 
                height: 'calc(100vh - 120px)', 
                background: 'var(--border)', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                border: '1px solid var(--border)' 
            }}>

                {/* Left Panel: Explorer & Tasks */}
                <div style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', gap: '20px' }}>
                        <button onClick={() => setActiveTab('description')} style={{ background: 'none', border: 'none', color: activeTab === 'description' ? 'var(--accent)' : 'var(--text3)', fontSize: '12px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', borderBottom: activeTab === 'description' ? '2px solid var(--accent)' : 'none', paddingBottom: '16px', marginBottom: '-16px' }}>Problem</button>
                        <button onClick={() => setActiveTab('tests')} style={{ background: 'none', border: 'none', color: activeTab === 'tests' ? 'var(--accent)' : 'var(--text3)', fontSize: '12px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', borderBottom: activeTab === 'tests' ? '2px solid var(--accent)' : 'none', paddingBottom: '16px', marginBottom: '-16px' }}>Tests</button>
                        <button onClick={() => setActiveTab('explore')} style={{ background: 'none', border: 'none', color: activeTab === 'explore' ? 'var(--accent)' : 'var(--text3)', fontSize: '12px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', borderBottom: activeTab === 'explore' ? '2px solid var(--accent)' : 'none', paddingBottom: '16px', marginBottom: '-16px' }}>Explorer</button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                        {activeTab === 'explore' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {labs.map(lab => (
                                    <div
                                        key={lab._id}
                                        style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', background: selectedLab._id === lab._id ? 'rgba(79, 142, 247, 0.1)' : 'transparent', color: selectedLab._id === lab._id ? 'var(--accent)' : 'var(--text2)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }} onClick={() => handleSelectLab(lab)}>
                                            <Code size={14} /> {lab.title}
                                        </div>
                                        {(user.role === 'tutor' || user.role === 'admin') && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/labs/${lab._id}/review`); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                title="View Proctoring Reports"
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : activeTab === 'tests' ? (
                            <div className="tests-area">
                                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle2 size={16} color="var(--accent4)" /> Validation Pipeline
                                </h3>
                                {!testResults ? (
                                    <p style={{ fontSize: '12px', color: 'var(--text3)' }}>Run code to see test results.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {testResults.map((tr, i) => !tr.isHidden && (
                                            <div key={i} style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg3)', border: `1px solid ${tr.passed ? 'var(--accent4)' : 'var(--border)'}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: '800', color: tr.passed ? 'var(--accent4)' : 'var(--text3)' }}>
                                                        {tr.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />} CASE #{i+1}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontFamily: 'monospace' }}>
                                                    <span style={{ color: 'var(--text3)' }}>IN:</span> <span style={{ color: 'var(--text)' }}>{tr.input}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)' }}>
                                                Total Passed: {testResults.filter(t => t.passed).length} / {testResults.length}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>{selectedLab.title}</h2>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                                    <span style={{ fontSize: '11px', background: 'var(--bg3)', padding: '4px 8px', borderRadius: '4px', color: 'var(--accent)' }}>{selectedLab.level}</span>
                                    <span style={{ fontSize: '11px', background: 'var(--bg3)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text3)' }}>{selectedLab.category}</span>
                                </div>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>{selectedLab.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor & Terminal */}
                <div style={{ display: 'grid', gridTemplateRows: '1fr 250px', gap: '2px', background: 'var(--border)' }}>
                    {/* Editor Area */}
                    <div style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '10px 20px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    style={{ background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}
                                >
                                    {selectedLab.languages.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                                </select>
                                <button onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                                    {theme === 'vs-dark' ? <Sun size={14} /> : <Moon size={14} />}
                                </button>
                                {isSaving && <span style={{ fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic' }}>Auto-saving...</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {isSubmitted ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--bg3)', borderRadius: '8px', color: 'var(--accent4)', fontSize: '12px', fontWeight: '800' }}>
                                        <Lock size={14} /> SUBMISSION LOCKED
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={() => runCode()} disabled={isRunning} className="premium-btn lite" style={{ padding: '6px 20px', fontSize: '13px' }}>
                                            <Play size={14} style={{ marginRight: '6px' }} /> Run
                                        </button>
                                        <button onClick={submitFinal} disabled={isRunning} className="premium-btn" style={{ padding: '6px 20px', fontSize: '13px', background: 'var(--accent4)' }}>
                                            <CheckCircle2 size={14} style={{ marginRight: '6px' }} /> Final Submit
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Editor
                                height="100%"
                                language={language}
                                theme={theme}
                                value={code}
                                onChange={(value) => setCode(value)}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    readOnly: isSubmitted,
                                    domReadOnly: isSubmitted,
                                    contextmenu: !selectedLab.isProctored,
                                    pasteInAllowed: !selectedLab.isProctored,
                                    fontFamily: 'JetBrains Mono, monospace',
                                    padding: { top: 20 }
                                }}
                            />
                        </div>
                    </div>

                    {/* Terminal Area */}
                    <div style={{ background: '#0a0d14', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '8px 20px', borderBottom: '1px solid #1e2535', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f141f' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Terminal size={14} color="var(--accent)" />
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#5a607a', letterSpacing: '1px' }}>TERMINAL / OUTPUT</span>
                            </div>
                            <button onClick={() => setOutput([])} style={{ background: 'none', border: 'none', color: '#5a607a', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </div>
                        <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
                            {output.length === 0 ? (
                                <p style={{ color: '#31364a' }}>Console is clear. Click "Run" to execute code.</p>
                            ) : (
                                output.map((log, i) => (
                                    <div key={i} style={{
                                        color: log.type === 'log' ? '#e8eaf0' : log.type === 'error' ? '#f74f4f' : log.type === 'warn' ? '#f7b84f' : '#4ff7b8',
                                        marginBottom: '6px',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {log.content}
                                    </div>
                                ))
                            )}
                            <div className="animate-pulse" style={{ color: 'var(--accent)', marginTop: '8px' }}>_</div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CodingLabs;
