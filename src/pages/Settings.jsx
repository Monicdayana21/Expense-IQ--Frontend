import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    monthly_income: user?.monthly_income || '',
    monthly_budget: user?.monthly_budget || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/auth/me', {
        name: form.name,
        monthly_income: parseFloat(form.monthly_income) || 0,
        monthly_budget: parseFloat(form.monthly_budget) || 0
      });
      updateUser(res.data);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="settings-page">
      <div className="settings-card">
        <div className="settings-header">
          <div className="settings-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div><h3>{user?.name}</h3><p>{user?.email}</p></div>
        </div>
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="settings-name">Display Name</label>
            <input id="settings-name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="settings-income">Monthly Income (₹)</label>
              <input id="settings-income" type="number" step="0.01" min="0" placeholder="50000" value={form.monthly_income} onChange={e => setForm({ ...form, monthly_income: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="settings-budget">Monthly Budget (₹)</label>
              <input id="settings-budget" type="number" step="0.01" min="0" placeholder="30000" value={form.monthly_budget} onChange={e => setForm({ ...form, monthly_budget: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} id="save-settings">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
