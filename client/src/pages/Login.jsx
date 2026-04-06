import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../features/authSlice';
import { GraduationCap, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import '../styles/theme.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
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
    const userData = { email, password };
    dispatch(login(userData));
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg)'
    }}>
      <div className="glass-card" style={{
        maxWidth: '450px',
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
          <h1 className="gradient-text" style={{ fontSize: '28px', fontWeight: '800' }}>EduNexus LMS</h1>
          <p style={{ color: 'var(--text2)', marginTop: '8px' }}>Welcome back! Please login to your account.</p>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text2)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} size={18} />
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="name@institution.edu"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '10px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'var(--transition)'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
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

          <button
            type="submit"
            className="premium-btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text3)' }}>
          Don't have an account? {' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
            Request Access
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
