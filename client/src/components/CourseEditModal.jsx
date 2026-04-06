import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  X, Save, Trash2, Plus, Video, 
  FileText, Layers, Users, DollarSign 
} from 'lucide-react';
import '../styles/theme.css';

const CourseEditModal = ({ course, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    price: 0,
    maxStudents: 0,
    status: 'Draft',
    thumbnail: ''
  });
  const [modules, setModules] = useState([]);
  const [newModule, setNewModule] = useState({ title: '', content: '', type: 'video', url: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        level: course.level || 'Beginner',
        price: course.price || 0,
        maxStudents: course.maxStudents || 0,
        status: course.status || 'Draft',
        thumbnail: course.thumbnail || ''
      });
      setModules(course.modules || []);
    } else {
      // Reset for new course
      setFormData({
        title: '',
        description: '',
        category: '',
        level: 'Beginner',
        price: 0,
        maxStudents: 0,
        status: 'Draft',
        thumbnail: ''
      });
      setModules([]);
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user || !user.token) {
      alert('Authentication error. Please re-login.');
      return;
    }
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      // Cast strings to numbers as expected by the model
      const finalData = {
        ...formData,
        price: Number(formData.price),
        maxStudents: Number(formData.maxStudents)
      };

      if (course) {
        // Update existing
        await axios.put(`http://localhost:5000/api/courses/${course._id}`, finalData, config);
      } else {
        // Create new
        await axios.post(`http://localhost:5000/api/courses`, finalData, config);
      }

      onSave();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const addModule = async () => {
    if (!newModule.title || !course) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const { data } = await axios.post(`http://localhost:5000/api/courses/${course._id}/modules`, newModule, config);
      setModules(data.modules);
      setNewModule({ title: '', content: '', type: 'video', url: '' });
    } catch (error) {
      alert('Failed to add module');
    }
  };

  const removeModule = async (moduleId) => {
    if (!window.confirm('Delete this module?')) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const { data } = await axios.delete(`http://localhost:5000/api/courses/${course._id}/modules/${moduleId}`, config);
      setModules(data.modules);
    } catch (error) {
      alert('Failed to remove module');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        padding: '0'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{course ? 'Edit Course Designer' : 'Create New Course'}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text3)' }}>{course ? 'Refine your curriculum and settings.' : 'Start building your new learning experience.'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg3)', border: 'none', color: 'var(--text2)', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Left Column: Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} /> General Information
            </h3>
            
            <div className="form-group">
              <label>Course Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Advanced React Architecture" />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="What will students learn?" style={{ resize: 'none' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Development" />
              </div>
              <div className="form-group">
                <label>Level</label>
                <select name="level" value={formData.level} onChange={handleChange}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label><DollarSign size={14} /> Price ($)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label><Users size={14} /> Max Students (0=∞)</label>
                <input type="number" name="maxStudents" value={formData.maxStudents} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Draft">Draft (Hidden)</option>
                <option value="Published">Published (Public)</option>
                <option value="Archived">Archived (Ended)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Thumbnail URL</label>
              <input type="text" name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="https://image.url/photo.jpg" />
            </div>
          </div>

          {/* Right Column: Curriculum */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Curriculum Builder
            </h3>

            {!course ? (
              <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Please Save the course details first<br/>to start adding modules.</p>
              </div>
            ) : (
              <>
                <div style={{ background: 'var(--bg3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>ADD NEW MODULE</p>
                  <input 
                    type="text" 
                    placeholder="Module Title" 
                    value={newModule.title} 
                    onChange={e => setNewModule({...newModule, title: e.target.value})}
                    style={{ marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select value={newModule.type} onChange={e => setNewModule({...newModule, type: e.target.value})} style={{ width: '100px' }}>
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="URL / Source" 
                      value={newModule.url} 
                      onChange={e => setNewModule({...newModule, url: e.target.value})}
                    />
                  </div>
                  <button onClick={addModule} className="premium-btn" style={{ width: '100%', padding: '8px', fontSize: '12px', background: 'var(--accent6)' }}>
                    Add Module to Curriculum
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700' }}>CURRENT MODULES ({modules.length})</p>
                  {modules.map((m, i) => (
                    <div key={i} style={{ 
                      padding: '10px 16px', 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {m.type === 'video' ? <Video size={14} color="var(--accent)" /> : <FileText size={14} color="var(--accent4)" />}
                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{m.title}</span>
                      </div>
                      <button onClick={() => removeModule(m._id)} style={{ background: 'none', border: 'none', color: 'var(--accent2)', cursor: 'pointer', opacity: 0.6 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '10px', fontSize: '14px', fontWeight: '600' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="premium-btn" style={{ padding: '10px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading ? 'Processing...' : (
              <>
                <Save size={18} /> {course ? 'Save Changes' : 'Create Course'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseEditModal;
