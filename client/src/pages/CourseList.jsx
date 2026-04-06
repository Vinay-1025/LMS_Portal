import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Layout from '../components/Layout';
import { Search, BookOpen, Star, Users, Clock, Filter, ShoppingCart, Loader2 } from 'lucide-react';
import '../styles/theme.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/courses');
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (e, courseId) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to enroll');
      navigate('/login');
      return;
    }
    
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`, {}, config);
      alert('Enrollment successful!');
      fetchCourses(); // Refresh listing
      navigate(`/course/${courseId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Enrollment failed');
    }
  };

  return (
    <Layout title="Courses / Browse Catalog">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '400px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} size={18} />
          <input
            type="text"
            placeholder="Search courses, skills, or mentors..."
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              borderRadius: '12px',
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              outline: 'none'
            }}
          />
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '12px',
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          color: 'var(--text2)',
          cursor: 'pointer',
          fontWeight: '600'
        }}>
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', gridColumn: '1/-1' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent)" />
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1/-1', color: 'var(--text3)' }}>
            No courses found in the catalog.
          </div>
        ) : (
          courses.map((course, i) => {
            const isFull = course.maxStudents > 0 && course.enrolledStudents?.length >= course.maxStudents;
            const isEnrolled = course.enrolledStudents?.includes(user?._id);

            return (
              <div key={course._id} onClick={() => navigate(`/course/${course._id}`)} className="glass-card" style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'var(--transition)',
                cursor: 'pointer',
                opacity: isFull && !isEnrolled ? 0.8 : 1,
                animation: `fadeUp ${0.4 + i * 0.1}s ease`
              }}>
                <div style={{ position: 'relative', height: '180px', background: 'var(--bg3)' }}>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, var(--bg3), var(--bg2))' }}>
                      <BookOpen size={48} color="var(--text3)" />
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: isFull ? 'var(--accent2)' : 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {isFull ? 'FULL' : course.level}
                  </div>
                </div>
                
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= 4 ? "var(--accent5)" : "none"} color="var(--accent5)" />)}
                    <span style={{ fontSize: '12px', color: 'var(--text3)', marginLeft: '4px' }}>(4.8)</span>
                  </div>
                  
                  <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>{course.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>by {course.tutor?.name || 'Assigned Tutor'}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: isFull && !isEnrolled ? 'var(--accent2)' : 'var(--text3)', fontWeight: isFull ? 'bold' : 'normal' }}>
                      <Users size={14} />
                      {course.enrolledStudents?.length || 0} / {course.maxStudents === 0 ? '∞' : course.maxStudents}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text3)' }}>
                      <Clock size={14} />
                      12h 30m
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </div>
                    
                    {isEnrolled ? (
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/course/${course._id}`); }} className="premium-btn" style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--accent4)' }}>
                        Go to Learning
                      </button>
                    ) : isFull ? (
                      <button disabled style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'not-allowed' }}>
                        Course Full
                      </button>
                    ) : (
                      <button onClick={(e) => handleEnroll(e, course._id)} className="premium-btn" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShoppingCart size={16} />
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
};

export default CourseList;
