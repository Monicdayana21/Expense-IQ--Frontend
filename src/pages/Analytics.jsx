import { useState, useEffect } from 'react';
import API from '../api/axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { HiOutlineDownload } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [dashboard, setDashboard] = useState(null);
  const [trends, setTrends] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [d, t, dy] = await Promise.all([
        API.get('/analytics/dashboard'),
        API.get('/analytics/monthly-trends'),
        API.get('/analytics/daily-spending')
      ]);
      setDashboard(d.data); setTrends(t.data); setDaily(dy.data);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  const handleExport = async () => {
    try {
      const res = await API.get('/analytics/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'expenses.csv';
      document.body.appendChild(a); a.click(); a.remove();
      toast.success('Exported!');
    } catch { toast.error('Export failed'); }
  };

  const tooltipStyle = { background: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };

  if (loading) return <div className="page-loading"><div className="loading-spinner"></div></div>;

  const incomeVsExpense = [
    { name: 'Income', value: dashboard?.monthly_income || 0, color: '#059669' },
    { name: 'Expenses', value: dashboard?.total_spent || 0, color: '#dc2626' },
    { name: 'Savings', value: Math.max(0, (dashboard?.monthly_income || 0) - (dashboard?.total_spent || 0)), color: '#670d2f' }
  ];

  return (
    <div className="analytics-page">
      <div className="page-top-bar">
        <p className="page-top-stat">Detailed financial insights</p>
        <button className="btn btn-secondary" onClick={handleExport} id="export-btn"><HiOutlineDownload /> Export CSV</button>
      </div>

      {/* Income vs Expense vs Savings */}
      <div className="analytics-summary-cards">
        {incomeVsExpense.map(item => (
          <div key={item.name} className="analytics-summary-card" style={{ '--accent': item.color }}>
            <span className="analytics-summary-label">{item.name}</span>
            <span className="analytics-summary-value">{fmt(item.value)}</span>
            <div className="analytics-summary-bar">
              <div style={{ width: `${dashboard?.monthly_income > 0 ? Math.min(100, (item.value / dashboard.monthly_income) * 100) : 0}%`, background: item.color }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        {/* Monthly Trends */}
        <div className="dashboard-card">
          <div className="card-header"><h3>Monthly Spending Trends</h3></div>
          <div className="chart-container">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
                  <XAxis dataKey="month_name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(v), 'Spent']} />
                  <Area type="monotone" dataKey="total" stroke="#670d2f" fill="#670d2f" fillOpacity={0.1} strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="empty-chart"><p><HiOutlineChartBar style={{ marginRight: '8px' }} /> No monthly data yet</p></div>}
          </div>
        </div>

        {/* Daily Spending Bar */}
        <div className="dashboard-card">
          <div className="card-header"><h3>Daily Spending (This Month)</h3></div>
          <div className="chart-container">
            {daily.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${v}`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(v), 'Spent']} />
                  <Bar dataKey="total" fill="#670d2f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty-chart"><p>📅 No daily data yet</p></div>}
          </div>
        </div>
      </div>

      {/* Category Breakdown Full */}
      <div className="dashboard-card">
        <div className="card-header"><h3>Category Breakdown</h3></div>
        <div className="analytics-category-section">
          {dashboard?.category_breakdown?.length > 0 ? (
            <>
              <div className="analytics-pie-wrapper">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={dashboard.category_breakdown} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                      {dashboard.category_breakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(v), '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="analytics-category-list">
                {dashboard.category_breakdown.map((cat, i) => {
                  const pct = dashboard.total_spent > 0 ? ((parseFloat(cat.total) / dashboard.total_spent) * 100).toFixed(1) : 0;
                  return (
                    <div key={i} className="analytics-cat-item">
                      <div className="analytics-cat-left">
                        <span className="analytics-cat-icon" style={{ background: `${cat.color}20`, color: cat.color }}>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                      <div className="analytics-cat-right">
                        <span className="analytics-cat-amount">{fmt(cat.total)}</span>
                        <span className="analytics-cat-pct">{pct}%</span>
                      </div>
                      <div className="analytics-cat-bar"><div style={{ width: `${pct}%`, background: cat.color }}></div></div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : <div className="empty-chart"><p>🏷️ No category data yet</p></div>}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
