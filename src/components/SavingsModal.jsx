import { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';

const SavingsModal = ({ isOpen, onClose, onSubmit, goal }) => {
  const [form, setForm] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    deadline: ''
  });

  useEffect(() => {
    if (goal) {
      setForm({
        name: goal.name || '',
        target_amount: goal.target_amount || '',
        current_amount: goal.current_amount || '',
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''
      });
    } else {
      setForm({ name: '', target_amount: '', current_amount: '', deadline: '' });
    }
  }, [goal, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.target_amount) return;
    onSubmit({
      ...form,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
      deadline: form.deadline || null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{goal ? 'Edit Savings Goal' : 'New Savings Goal'}</h2>
          <button className="modal-close" onClick={onClose}><HiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="goal-name">Goal Name</label>
            <input
              id="goal-name"
              type="text"
              placeholder="e.g. Emergency Fund"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="goal-target">Target Amount (₹)</label>
              <input
                id="goal-target"
                type="number"
                step="0.01"
                min="0"
                placeholder="50000"
                value={form.target_amount}
                onChange={e => setForm({ ...form, target_amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="goal-current">Saved So Far (₹)</label>
              <input
                id="goal-current"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={form.current_amount}
                onChange={e => setForm({ ...form, current_amount: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="goal-deadline">Deadline (Optional)</label>
            <input
              id="goal-deadline"
              type="date"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingsModal;
