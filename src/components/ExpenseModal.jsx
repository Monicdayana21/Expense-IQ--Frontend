import { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';

const ExpenseModal = ({ isOpen, onClose, onSubmit, categories, expense }) => {
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_interval: ''
  });

  useEffect(() => {
    if (expense) {
      setForm({
        amount: expense.amount || '',
        description: expense.description || '',
        category_id: expense.category_id || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        is_recurring: expense.is_recurring || false,
        recurring_interval: expense.recurring_interval || ''
      });
    } else {
      setForm({
        amount: '',
        description: '',
        category_id: categories?.[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        recurring_interval: ''
      });
    }
  }, [expense, isOpen, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    onSubmit({
      ...form,
      amount: parseFloat(form.amount),
      category_id: form.category_id ? parseInt(form.category_id) : null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{expense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="modal-close" onClick={onClose}><HiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="expense-amount">Amount (₹)</label>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="expense-description">Description</label>
            <input
              id="expense-description"
              type="text"
              placeholder="What did you spend on?"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expense-category">Category</label>
              <select
                id="expense-category"
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">Select category</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="expense-date">Date</label>
              <input
                id="expense-date"
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group-inline">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.is_recurring}
                onChange={e => setForm({ ...form, is_recurring: e.target.checked })}
              />
              <span className="checkmark"></span>
              Recurring expense
            </label>
            {form.is_recurring && (
              <select
                className="recurring-select"
                value={form.recurring_interval}
                onChange={e => setForm({ ...form, recurring_interval: e.target.value })}
              >
                <option value="">Select interval</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {expense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
