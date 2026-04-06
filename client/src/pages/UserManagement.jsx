import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllUsers, createAdminUser, updateAdminUser, deleteAdminUser, resetUserStatus } from '../features/userSlice';
import Layout from '../components/Layout';
import { ShieldCheck, UserPlus, MoreVertical, Edit2, Trash2, Search, Filter, Shield, X, Check, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../styles/theme.css';

const API_URL = 'http://localhost:5000/api/auth';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { users, isLoading, isSuccess, isError, message } = useSelector((state) => state.user);
  
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    permissions: []
  });

  const availablePermissions = [
    'Courses', 'Attendance', 'Assessments', 'Coding Labs', 
    'Meets', 'Marks', 'Communication', 'Analytics', 'Settings'
  ];

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && (showModal || showDeleteConfirm)) {
      // Success toast is now handled by the slice action completion if we want, 
      // but let's do it here for specific UI feedback
      if (editingUser) toast.success('User updated successfully');
      else if (userToDelete) toast.success('User removed successfully');
      else toast.success('User created successfully');
      
      closeModal();
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      dispatch(resetUserStatus());
    }

    if (isError && message) {
      toast.error(message);
      dispatch(resetUserStatus());
    }
  }, [isSuccess, isError, message, dispatch]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePermission = (perm) => {
    const updatedPerms = formData.permissions.includes(perm)
      ? formData.permissions.filter(p => p !== perm)
      : [...formData.permissions, perm];
    setFormData({ ...formData, permissions: updatedPerms });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingUser) {
      dispatch(updateAdminUser({ id: editingUser._id, userData: formData }));
    } else {
      dispatch(createAdminUser(formData));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '', 
      permissions: user.permissions || []
    });
    setShowModal(true);
  };

  const handleDelete = () => {
    if (userToDelete) {
      dispatch(deleteAdminUser(userToDelete._id));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'student', permissions: [] });
    setError(null);
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'var(--admin)';
      case 'tutor': return 'var(--tutor)';
      case 'management': return 'var(--mgmt)';
      case 'student': return 'var(--student)';
      default: return 'var(--text2)';
    }
  };

  return (
    <Layout title="User Management / Permissions & Access">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '400px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} size={18} />
          <input
            type="text"
            placeholder="Search users by name, email or role..."
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', fontWeight: '600' }}>
            <Filter size={18} /> Filter Roles
          </button>
          <button className="premium-btn" onClick={() => { setEditingUser(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} /> Add User
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading && users.length === 0 ? (
           <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
             <Loader2 className="animate-spin" size={48} color="var(--accent)" />
           </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase' }}>Joined</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: getRoleColor(u.role) }}>{u.name.charAt(0)}</div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>{u.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: getRoleColor(u.role) }}>
                      <Shield size={14} />
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text2)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      background: 'rgba(79, 247, 184, 0.1)',
                      color: 'var(--accent4)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      border: '1px solid var(--accent4)'
                    }}>
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleEdit(u)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer' }} title={u.permissions.join(', ') || 'No custom permissions'}><ShieldCheck size={16} /></button>
                      <button onClick={() => { setUserToDelete(u); setShowDeleteModal(true); }} style={{ background: 'transparent', border: 'none', color: 'var(--accent3)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '600px', width: '100%', padding: '32px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{editingUser ? 'Update Account' : 'Create New Account'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            {isError && message && <div style={{ background: 'rgba(247, 110, 79, 0.1)', color: 'var(--accent3)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--accent3)', fontSize: '13px' }}>{message}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text2)' }}>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text2)' }}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text2)' }}>{editingUser ? 'New Password (Optional)' : 'Temporary Password'}</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!editingUser} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text2)' }}>Account Role</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}>
                    <option value="student">Student</option>
                    <option value="tutor">Tutor</option>
                    <option value="management">Management</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', marginBottom: '16px', fontSize: '14px', color: 'var(--text2)', fontWeight: '600' }}>Custom Module Permissions</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {availablePermissions.map(perm => (
                    <div 
                      key={perm} 
                      onClick={() => togglePermission(perm)}
                      style={{
                        padding: '10px', borderRadius: '8px', cursor: 'pointer',
                        background: formData.permissions.includes(perm) ? 'rgba(79, 142, 247, 0.1)' : 'var(--bg3)',
                        border: '1px solid',
                        borderColor: formData.permissions.includes(perm) ? 'var(--accent)' : 'var(--border)',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'var(--transition)'
                      }}
                    >
                      <div style={{
                        width: '16px', height: '16px', borderRadius: '4px', border: '2px solid',
                        borderColor: formData.permissions.includes(perm) ? 'var(--accent)' : 'var(--text3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        background: formData.permissions.includes(perm) ? 'var(--accent)' : 'transparent'
                      }}>
                        {formData.permissions.includes(perm) && <Check size={12} color="white" />}
                      </div>
                      <span style={{ fontSize: '12px', color: formData.permissions.includes(perm) ? 'var(--text)' : 'var(--text2)' }}>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isLoading} className="premium-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : (editingUser ? <Edit2 size={20} /> : <UserPlus size={20} />)}
                  {isLoading ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update Account' : 'Create Account')}
                </button>
              </div>
              <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text3)', marginTop: '16px' }}>
                Note: A welcome email with temporary credentials will be sent to the user.
              </p>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(247, 79, 79, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent3)', margin: '0 auto 24px' }}>
              <Trash2 size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>Remove Account?</h3>
            <p style={{ color: 'var(--text3)', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
              Are you sure you want to remove <strong>{userToDelete?.name}</strong>? This will deactivate the account and prevent further access.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} disabled={isLoading} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--accent3)', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
                {isLoading ? 'Removing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagement;
