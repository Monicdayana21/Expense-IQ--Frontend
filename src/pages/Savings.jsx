import { useState, useEffect } from 'react';
import API from '../api/axios';
import SavingsModal from '../components/SavingsModal';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try { const res = await API.get('/savings'); setGoals(res.data); }
    catch { toast.error('Failed to load savings'); }
    finally { setLoading(false); }
  };

  const handleAdd = async (data) => {
    try {
      const res = await API.post('/savings', data);
      setGoals([res.data, ...goals]); setModalOpen(false);
      toast.success('Goal created!');
    } catch { toast.error('Failed to create goal'); }
  };

  const handleEdit = async (data) => {
    try {
      const res = await API.put(`/savings/${editingGoal.id}`, data);
      setGoals(goals.map(g => g.id === editingGoal.id ? res.data : g));
      setEditingGoal(null); setModalOpen(false);
      toast.success('Goal updated!');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      await API.delete(`/savings/${id}`);
      setGoals(goals.filter(g => g.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  const totalTarget = goals.reduce((s, g) => s + parseFloat(g.target_amount), 0);
  const totalSaved = goals.reduce((s, g) => s + parseFloat(g.current_amount), 0);

  if (loading) return <div className="page-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="savings-page">
      <div className="page-top-bar">
        <p className="page-top-stat">
          {goals.length} goal{goals.length !== 1 ? 's' : ''} · Saved {fmt(totalSaved)} of {fmt(totalTarget)}
        </p>
        <button className="btn btn-primary" onClick={() => { setEditingGoal(null); setModalOpen(true); }} id="add-goal-btn">
          <HiOutlinePlus /> New Goal
        </button>
      </div>

      {/* Overall Progress */}
      {goals.length > 0 && (
        <div className="savings-overall">
          <div className="savings-overall-header">
            <h3>Overall Savings Progress</h3>
            <span className="savings-overall-pct">{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%</span>
          </div>
          <div className="budget-bar-container">
            <div className="budget-bar" style={{ width: `${totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0}%`, background: '#670d2f' }}></div>
          </div>
          <div className="budget-labels"><span>{fmt(totalSaved)} saved</span><span>{fmt(totalTarget)} target</span></div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="savings-grid">
          {goals.map(goal => {
            const pct = parseFloat(goal.target_amount) > 0 ? Math.min(100, Math.round((parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100)) : 0;
            const remaining = parseFloat(goal.target_amount) - parseFloat(goal.current_amount);
            const daysLeft = goal.deadline ? Math.max(0, Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))) : null;
            return (
              <div key={goal.id} className="savings-card">
                <div className="savings-card-header">
                  <h4>{goal.name}</h4>
                  <div className="savings-card-actions">
                    <button className="action-btn edit" onClick={() => { setEditingGoal(goal); setModalOpen(true); }}><HiOutlinePencil /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(goal.id)}><HiOutlineTrash /></button>
                  </div>
                </div>
                <div className="savings-ring-wrapper">
                  <svg viewBox="0 0 120 120" className="savings-ring">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(15,23,42,0.05)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#670d2f" strokeWidth="10"
                      strokeDasharray={`${(pct / 100) * 327} 327`}
                      strokeLinecap="round" transform="rotate(-90 60 60)" />
                  </svg>
                  <div className="savings-ring-text">
                    <span className="savings-ring-pct">{pct}%</span>
                    <span className="savings-ring-label">saved</span>
                  </div>
                </div>
                <div className="savings-card-details">
                  <div className="savings-detail"><span>Saved</span><strong>{fmt(goal.current_amount)}</strong></div>
                  <div className="savings-detail"><span>Target</span><strong>{fmt(goal.target_amount)}</strong></div>
                  <div className="savings-detail"><span>Remaining</span><strong>{fmt(Math.max(0, remaining))}</strong></div>
                  {daysLeft !== null && <div className="savings-detail"><span>Deadline</span><strong>{daysLeft} days left</strong></div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state"><div className="empty-icon"><HiOutlineShieldCheck /></div><h3>No savings goals yet</h3><p>Create a goal to start tracking your savings</p></div>
      )}

      <SavingsModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingGoal(null); }} onSubmit={editingGoal ? handleEdit : handleAdd} goal={editingGoal} />
    </div>
  );
};

export default Savings;
