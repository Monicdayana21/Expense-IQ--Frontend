import { useState, useEffect } from 'react';
import API from '../api/axios';
import ExpenseModal from '../components/ExpenseModal';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineRefresh, HiOutlineCurrencyDollar, HiOutlineInbox } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [expRes, catRes] = await Promise.all([API.get('/expenses'), API.get('/categories')]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
    } catch { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  };

  const handleAdd = async (data) => {
    try {
      const res = await API.post('/expenses', data);
      setExpenses([res.data, ...expenses]);
      setModalOpen(false);
      toast.success('Expense added!');
    } catch { toast.error('Failed to add expense'); }
  };

  const handleEdit = async (data) => {
    try {
      const res = await API.put(`/expenses/${editingExpense.id}`, data);
      setExpenses(expenses.map(e => e.id === editingExpense.id ? res.data : e));
      setEditingExpense(null); setModalOpen(false);
      toast.success('Expense updated!');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await API.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(e => e.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  const filtered = expenses.filter(exp => {
    const matchSearch = !search || exp.description?.toLowerCase().includes(search.toLowerCase()) || exp.category_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || String(exp.category_id) === filterCategory;
    return matchSearch && matchCat;
  });

  const grouped = filtered.reduce((acc, exp) => {
    const dk = new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[dk]) acc[dk] = [];
    acc[dk].push(exp);
    return acc;
  }, {});

  const totalFiltered = filtered.reduce((s, e) => s + parseFloat(e.amount), 0);

  if (loading) return <div className="page-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="expenses-page">
      <div className="page-top-bar">
        <p className="page-top-stat">{filtered.length} expense{filtered.length !== 1 ? 's' : ''} · Total: <strong>{fmt(totalFiltered)}</strong></p>
        <button className="btn btn-primary" onClick={() => { setEditingExpense(null); setModalOpen(true); }} id="add-expense-btn">
          <HiOutlinePlus /> Add Expense
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <HiOutlineSearch className="search-icon" />
          <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" id="expense-search" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-select" id="category-filter">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {(search || filterCategory) && <button className="btn btn-ghost" onClick={() => { setSearch(''); setFilterCategory(''); }}>Clear</button>}
      </div>

      {Object.keys(grouped).length > 0 ? (
        <div className="expense-groups">
          {Object.entries(grouped).map(([date, exps]) => (
            <div key={date} className="expense-group">
              <div className="expense-group-header">
                <span className="expense-group-date">{date}</span>
                <span className="expense-group-total">{fmt(exps.reduce((s, e) => s + parseFloat(e.amount), 0))}</span>
              </div>
              <div className="expense-group-items">
                {exps.map(exp => (
                  <div key={exp.id} className="expense-item">
                    <div className="expense-item-icon" style={{ background: `${exp.category_color || '#670d2f'}15`, color: exp.category_color || '#670d2f' }}><HiOutlineCurrencyDollar /></div>
                    <div className="expense-item-info">
                      <span className="expense-item-desc">{exp.description || 'Untitled'}</span>
                      <span className="expense-item-cat">{exp.category_name || 'Uncategorized'}{exp.is_recurring && <span className="recurring-badge"><HiOutlineRefresh style={{ fontSize: '10px', marginRight: '4px' }} /> Recurring</span>}</span>
                    </div>
                    <span className="expense-item-amount">{fmt(exp.amount)}</span>
                    <div className="expense-item-actions">
                      <button className="action-btn edit" onClick={() => { setEditingExpense(exp); setModalOpen(true); }}><HiOutlinePencil /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(exp.id)}><HiOutlineTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state"><div className="empty-icon"><HiOutlineInbox /></div><h3>No expenses found</h3><p>{search || filterCategory ? 'Try adjusting your filters' : 'Click "Add Expense" to start tracking'}</p></div>
      )}

      <ExpenseModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingExpense(null); }} onSubmit={editingExpense ? handleEdit : handleAdd} categories={categories} expense={editingExpense} />
    </div>
  );
};

export default Expenses;
