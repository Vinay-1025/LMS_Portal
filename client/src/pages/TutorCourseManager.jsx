import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import CourseEditModal from '../components/CourseEditModal';
import { 
  Users, Calendar, CheckSquare, Code, 
  ArrowRight, Search, Download, AlertCircle,
  FileText, TrendingUp, Clock, ChevronDown,
  Edit3, Trash2, PlusCircle
} from 'lucide-react';
import '../styles/theme.css';

const TutorCourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const fetchMyCourses = async () => {
    if (!user || !user.token) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const { data } = await axios.get('http://localhost:5000/api/courses', config);
      const myCourses = data.filter(c => (c.tutor?._id === user._id || user.role === 'admin') && c.status !== 'Archived');
      setCourses(myCourses);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchCourseReport = async (courseId) => {
    if (!user || !user.token) return;
    setReportLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const { data } = await axios.get(`http://localhost:5000/api/courses/${courseId}/report`, config);
      setReport(data);
      setReportLoading(false);
    } catch (error) {
      console.error(error);
      setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    fetchCourseReport(course._id);
  };

  const handleEdit = (e, course) => {
    e.stopPropagation();
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleArchive = async (e, courseId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to archive this course? It will be hidden from students.')) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`, config);
      fetchMyCourses();
      if (selectedCourse?._id === courseId) setSelectedCourse(null);
    } catch (error) {
      alert('Failed to archive course');
    }
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  return (
    <Layout title="Course Management / Instructor Insight">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 3fr', gap: '24px', height: 'calc(100vh - 160px)' }}>
        
        {/* Left Sidebar: My Courses */}
        <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid var(--border)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'rgba(79, 142, 247, 0.05)' 
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent)' }}>Course Designer</h3>
                <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{courses.length} Active Curriculums</p>
              </div>
              <button onClick={handleCreate} className="premium-btn" style={{ 
                padding: '12px 20px', 
                fontSize: '13px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
                boxShadow: '0 8px 25px rgba(124, 94, 247, 0.4)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <PlusCircle size={18} /> Add New Course
              </button>
            </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {loading ? (
              <p style={{ padding: '20px', textAlign: 'center' }}>Loading...</p>
            ) : courses.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)' }}>No courses found.</p>
            ) : (
              courses.map(course => (
                <div 
                  key={course._id}
                  onClick={() => handleSelectCourse(course)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    background: selectedCourse?._id === course._id ? 'rgba(79, 142, 247, 0.1)' : 'transparent',
                    border: selectedCourse?._id === course._id ? '1px solid var(--accent)' : '1px solid var(--border)',
                    transition: 'var(--transition)',
                    position: 'relative'
                  }}
                  className="table-row-hover"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: selectedCourse?._id === course._id ? 'var(--accent)' : 'var(--text)' }}>{course.title}</h4>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={(e) => handleEdit(e, course)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '4px' }}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={(e) => handleArchive(e, course._id)} style={{ background: 'none', border: 'none', color: 'var(--accent2)', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text3)' }}>
                      <Users size={12} /> {course.enrolledStudents?.length || 0} Students
                    </div>
                    <div style={{ 
                      padding: '2px 8px', 
                      borderRadius: '10px', 
                      background: course.status === 'Draft' ? 'var(--bg3)' : 'rgba(79, 142, 247, 0.1)', 
                      fontSize: '10px', 
                      color: course.status === 'Published' ? 'var(--accent)' : 'var(--text3)',
                      fontWeight: '700'
                    }}>
                      {course.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Area: Detailed Report */}
        <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedCourse ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', textAlign: 'center' }}>
              <TrendingUp size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p>Select a course from the sidebar to<br/>view comprehensive student analytics.</p>
            </div>
          ) : reportLoading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>Fetching performance data...</p>
            </div>
          ) : (
            <>
              {/* Report Header */}
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{report?.courseTitle}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text3)' }}>
                    Track attendance, assessments, and coding lab engagement for all {report?.enrolledCount} enrolled students.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="premium-btn" style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                    <Download size={14} style={{ marginRight: '6px' }} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Stats Summary Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '20px', background: 'rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Avg Attendance</p>
                  <p style={{ fontSize: '18px', fontWeight: '800' }}>
                    {Math.round(report?.students?.reduce((acc, st) => acc + st.attendance.percentage, 0) / (report?.students?.length || 1))}%
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Avg Performance</p>
                  <p style={{ fontSize: '18px', fontWeight: '800' }}>
                    {Math.round(report?.students?.reduce((acc, st) => acc + st.performance.avgScore, 0) / (report?.students?.length || 1))}%
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Active Labs</p>
                  <p style={{ fontSize: '18px', fontWeight: '800' }}>
                    {report?.students?.filter(s => s.coding.active).length} / {report?.enrolledCount}
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>Capacity</p>
                  <p style={{ fontSize: '18px', fontWeight: '800', color: report?.enrolledCount >= report?.maxStudents && report?.maxStudents > 0 ? 'var(--accent2)' : 'inherit' }}>
                    {report?.enrolledCount} / {report?.maxStudents === 0 ? '∞' : report?.maxStudents}
                  </p>
                </div>
              </div>

              {/* Student Table */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--bg2)', zIndex: 5 }}>
                    <tr>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Student Name</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Attendance</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Avg. Score</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Coding Lab</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report?.students?.map((student, i) => (
                      <tr key={i} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <p style={{ fontSize: '14px', fontWeight: '700' }}>{student.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text3)' }}>{student.email}</p>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', width: '60px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: student.attendance.percentage < 75 ? 'var(--accent2)' : 'var(--accent4)', width: `${student.attendance.percentage}%` }}></div>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>{Math.round(student.attendance.percentage)}%</span>
                          </div>
                          <p style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>{student.attendance.present}/{student.attendance.total} sessions visited</p>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700' }}>{student.performance.avgScore}%</span>
                            {student.performance.lateSubmissions && (
                              <div title="Late Submission Detected" style={{ color: 'var(--accent2)', display: 'flex', alignItems: 'center' }}>
                                <AlertCircle size={14} />
                              </div>
                            )}
                          </div>
                          <p style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>{student.performance.totalSubmissions} assessments completed</p>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {student.coding.active ? (
                            <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(79, 247, 184, 0.1)', color: 'var(--accent4)', fontSize: '11px', fontWeight: '700' }}>
                              Active Work
                            </span>
                          ) : (
                            <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--bg3)', color: 'var(--text3)', fontSize: '11px', fontWeight: '700' }}>
                              No Activity
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                            View Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                    {report?.students?.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>
                          No students enrolled in this course yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <CourseEditModal 
        isOpen={isModalOpen} 
        course={editingCourse} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchMyCourses} 
      />
    </Layout>
  );
};

export default TutorCourseManager;
