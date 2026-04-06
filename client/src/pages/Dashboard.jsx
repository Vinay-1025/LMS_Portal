import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import {
  Users, BookOpen, Clock,
  CheckCircle, ArrowUpRight,
  Calendar as CalendarIcon,
  FileText, PlayCircle
} from 'lucide-react';
import '../styles/theme.css';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { isMobile } = useSelector((state) => state.layout);

  const getWelcomeMessage = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const studentStats = [
    { label: 'Active Courses', value: '4', icon: <BookOpen size={20} />, color: 'var(--accent)' },
    { label: 'Avg. Attendance', value: '92%', icon: <CalendarIcon size={20} />, color: 'var(--accent4)' },
    { label: 'Completed Tests', value: '12', icon: <CheckCircle size={20} />, color: 'var(--accent2)' },
    { label: 'Study Hours', value: '128h', icon: <Clock size={20} />, color: 'var(--accent5)' },
  ];

  const tutorStats = [
    { label: 'Total Students', value: '156', icon: <Users size={20} />, color: 'var(--accent)' },
    { label: 'Courses Created', value: '6', icon: <BookOpen size={20} />, color: 'var(--accent2)' },
    { label: 'Assigned Batches', value: '4', icon: <CalendarIcon size={20} />, color: 'var(--accent4)' },
    { label: 'Pending Grades', value: '23', icon: <FileText size={20} />, color: 'var(--accent3)' },
  ];

  const stats = user?.role === 'tutor' || user?.role === 'admin' ? tutorStats : studentStats;

  return (
    <Layout title={`Home / ${user?.role === 'tutor' ? 'Instructor' : 'Learner'} Dashboard`}>
      <div className="dashboard-hero" style={{ marginBottom: isMobile ? '24px' : '40px' }}>
        <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', marginBottom: '8px' }}>
          {getWelcomeMessage()}, <span className="gradient-text">{user?.name}</span>!
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: isMobile ? '14px' : '16px' }}>
          Here's what's happening in your EduNexus LMS today.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: isMobile ? '12px' : '24px',
        marginBottom: isMobile ? '32px' : '40px'
      }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-card" style={{
            padding: isMobile ? '16px' : '24px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'var(--transition)',
            cursor: 'default',
            animation: `fadeUp ${0.4 + i * 0.1}s ease`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? '10px' : '16px' }}>
              <div style={{
                width: isMobile ? '36px' : '44px',
                height: isMobile ? '36px' : '44px',
                borderRadius: '10px',
                backgroundColor: stat.color + '1a', // 10% opacity
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color
              }}>
                {stat.icon}
              </div>
              <div style={{ color: 'var(--accent4)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpRight size={14} />
                +12%
              </div>
            </div>
            <h3 style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: '800', marginBottom: '4px' }}>{stat.value}</h3>
            <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
        gap: '24px'
      }}>
        <div className="glass-card" style={{ padding: isMobile ? '16px' : '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Continue Learning</h2>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>View All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'Full-Stack Web Development', progress: 65, instructor: 'Dr. Sarah Smith', color: 'var(--accent)' },
              { name: 'Advanced Data Science', progress: 40, instructor: 'Mark Johnson', color: 'var(--accent2)' },
              { name: 'UI/UX Design Masterclass', progress: 85, instructor: 'Elena Rodriguez', color: 'var(--accent4)' }
            ].map((course, i) => (
              <div key={i} style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: course.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    <PlayCircle size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{course.name}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text3)' }}>Instructor: {course.instructor}</p>
                  </div>
                </div>
                <div style={{ width: isMobile ? '100%' : '120px', textAlign: isMobile ? 'left' : 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>{course.progress}%</div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg3)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${course.progress}%`, height: '100%', background: course.color }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: isMobile ? '16px' : '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Upcoming Deadlines</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { task: 'React Query Thesis', deadline: 'Today, 11:59 PM', priority: 'High', color: 'var(--accent3)' },
              { task: 'MongoDB Schema Design', deadline: 'Tomorrow', priority: 'Medium', color: 'var(--accent5)' },
              { task: 'System Architecture Quiz', deadline: 'Apr 02, 2025', priority: 'Low', color: 'var(--accent4)' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '4px', height: '40px', borderRadius: '4px', background: item.color }}></div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{item.task}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{item.deadline}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="premium-btn" style={{ width: '100%', marginTop: '32px', fontSize: '14px' }}>View Calendar</button>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
