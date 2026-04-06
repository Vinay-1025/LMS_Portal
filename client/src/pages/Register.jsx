import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../features/authSlice';
import { GraduationCap, Mail, Lock, User, UserPlus, Loader2 } from 'lucide-react';
import '../styles/theme.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });

  const { name, email, password, role } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message);
    }

    if (isSuccess || user) {
      navigate('/');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { name, email, password, role };
    dispatch(register(userData));
  };

  return (
    <div className="register-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg)'
    }}>
      <div className="glass-card" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '40px',
        animation: 'fadeUp 0.6s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            marginBottom: '16px'
          }}>
            <GraduationCap size={32} color="white" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '28px', fontWeight: '800' }}>Create Account</h1>
          <p style={{ color: 'var(--text2)', marginTop: '8px' }}>Join the EduNexus LMS platform as a Learner or Educator.</p>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text2)' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} size={18} />
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '10px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text2)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} size={18} />
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="john@institution.edu"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '10px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text2)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} size={18} />
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '10px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: 'var(--text2)' }}>Select Your Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div 
                onClick={() => setFormData(p => ({...p, role: 'student'}))}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: role === 'student' ? 'rgba(79, 142, 247, 0.1)' : 'var(--bg2)',
                  border: role === 'student' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>🎒</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: role === 'student' ? 'var(--accent)' : 'var(--text2)' }}>Student</div>
              </div>
              <div 
                onClick={() => setFormData(p => ({...p, role: 'tutor'}))}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: role === 'tutor' ? 'rgba(124, 94, 247, 0.1)' : 'var(--bg2)',
                  border: role === 'tutor' ? '2px solid var(--accent2)' : '1px solid var(--border)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>👨‍🏫</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: role === 'tutor' ? 'var(--accent2)' : 'var(--text2)' }}>Tutor</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="premium-btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text3)' }}>
          Already have an account? {' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
