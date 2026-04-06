import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { ChevronLeft, Play, FileText, CheckCircle, Clock, Lock, ChevronRight, MessageSquare, Download } from 'lucide-react';
import '../styles/theme.css';

const CoursePlayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(data);
        if (data.modules?.length > 0) {
          setActiveModule(data.modules[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <Layout title="Loading Course..."><p>Please wait...</p></Layout>;
  if (!course) return <Layout title="Course Not Found"><p>This course does not exist.</p></Layout>;

  return (
    <Layout title={`${course.title} / Learning Portal`}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/courses" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text3)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
          <ChevronLeft size={16} /> Back to Catalog
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) 1fr', gap: '32px' }}>
        {/* Main Player Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', background: '#000', aspectRatio: '16/9', position: 'relative' }}>
            {activeModule?.type === 'video' ? (
              <iframe
                width="100%"
                height="100%"
                src={activeModule.url}
                title={activeModule.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0 }}
              ></iframe>
            ) : activeModule?.type === 'pdf' ? (
              <iframe
                src={`${activeModule.url}#toolbar=0`}
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0, border: 'none' }}
              ></iframe>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', color: 'var(--text2)' }}>
                <Play size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>Select a module to start learning</p>
              </div>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>{activeModule?.title || course.title}</h2>
            <p style={{ color: 'var(--text2)', fontSize: '15px', lineHeight: '1.6' }}>{course.description}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79, 142, 247, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Discussion</p>
                <p style={{ fontSize: '13px', fontWeight: '700' }}>12 New Comments</p>
              </div>
            </div>
            <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(79, 247, 184, 0.1)', color: 'var(--accent4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Resources</p>
                <p style={{ fontSize: '13px', fontWeight: '700' }}>4 Files Attached</p>
              </div>
            </div>
            <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(247, 200, 79, 0.1)', color: 'var(--accent5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Duration</p>
                <p style={{ fontSize: '13px', fontWeight: '700' }}>45m Remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content List */}
        <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Course Content</h3>
            <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{course.modules?.length || 0} Modules • 12h 30m total</p>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
            {course.modules?.map((mod, i) => (
              <div 
                key={i} 
                onClick={() => setActiveModule(mod)}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  borderLeft: activeModule === mod ? '4px solid var(--accent)' : '4px solid transparent',
                  background: activeModule === mod ? 'rgba(79, 142, 247, 0.05)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ color: activeModule === mod ? 'var(--accent)' : 'var(--text3)' }}>
                  {mod.type === 'video' ? <Play size={16} /> : <FileText size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: activeModule === mod ? '700' : '500', color: activeModule === mod ? 'var(--text)' : 'var(--text2)' }}>{mod.title}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>{mod.type}</p>
                </div>
                {i === 0 && <CheckCircle size={14} color="var(--accent4)" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoursePlayer;
