import { useState, useEffect } from 'react';
import API from '../api/axios';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { HiOutlineCurrencyDollar, HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineCash, HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, trendRes] = await Promise.all([
        API.get('/analytics/dashboard'),
        API.get('/analytics/monthly-trends')
      ]);
      setData(dashRes.data);
      setTrends(trendRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  if (loading) {
    return <div className="page-loading"><div className="loading-spinner"></div></div>;
  }

  const budgetPercent = data?.monthly_budget > 0 
    ? Math.min(100, Math.round((data.total_spent / data.monthly_budget) * 100)) 
    : 0;

  const isOverBudget = data?.budget_remaining < 0;

  return (
    <div className="dashboard-page">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <h2>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}</h2>
        <p>Here's your financial overview for this month</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<HiOutlineCurrencyDollar />}
          label="Total Spent"
          value={formatCurrency(data?.total_spent)}
          subtext={`${data?.expense_count || 0} transactions`}
          color="#c0392b"
        />
        <StatCard
          icon={<HiOutlineTrendingUp />}
          label="Monthly Income"
          value={formatCurrency(data?.monthly_income)}
          subtext="Set in settings"
          color="#3d8b5e"
        />
        <StatCard
          icon={<HiOutlineShieldCheck />}
          label="Budget Remaining"
          value={formatCurrency(Math.abs(data?.budget_remaining || 0))}
          subtext={isOverBudget ? 'Over budget limit!' : `${budgetPercent}% used`}
          color={isOverBudget ? '#dc2626' : '#670d2f'}
          trend={isOverBudget ? 'down' : 'up'}
        />
        <StatCard
          icon={<HiOutlineCash />}
          label="Total Saved"
          value={formatCurrency(data?.total_savings_saved)}
          subtext={`of ${formatCurrency(data?.total_savings_target)} target`}
          color="#d4930d"
        />
      </div>

      {/* Budget Progress */}
      {data?.monthly_budget > 0 && (
        <div className="dashboard-card budget-card">
          <div className="card-header">
            <h3>Budget Progress</h3>
            <span className={`budget-badge ${isOverBudget ? 'danger' : budgetPercent > 75 ? 'warning' : 'success'}`}>
              {budgetPercent}%
            </span>
          </div>
          <div className="budget-bar-container">
            <div 
              className={`budget-bar ${isOverBudget ? 'over' : budgetPercent > 75 ? 'warning' : ''}`} 
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            ></div>
          </div>
          <div className="budget-labels">
            <span>{formatCurrency(data.total_spent)} spent</span>
            <span>{formatCurrency(data.monthly_budget)} budget</span>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Spending Trend */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Spending Trend</h3>
            <span className="card-subtitle">Last 6 months</span>
          </div>
          <div className="chart-container">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
                  <XAxis dataKey="month_name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(value) => [formatCurrency(value), 'Spent']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#670d2f" fill="#670d2f" fillOpacity={0.1} strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p><HiOutlineChartBar style={{ marginRight: '8px' }} /> Start adding expenses to see trends</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>By Category</h3>
            <span className="card-subtitle">This month</span>
          </div>
          <div className="chart-container category-chart">
            {data?.category_breakdown?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.category_breakdown}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {data.category_breakdown.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      formatter={(value) => [formatCurrency(value), '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="category-legend">
                  {data.category_breakdown.map((cat, idx) => (
                    <div key={idx} className="legend-item">
                      <span className="legend-dot" style={{ background: cat.color }}></span>
                      <span className="legend-label">{cat.name}</span>
                      <span className="legend-value">{formatCurrency(cat.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-chart">
                <p><HiOutlineTag style={{ marginRight: '8px' }} /> No category data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Recent Transactions</h3>
          <span className="card-subtitle">Latest 5</span>
        </div>
        {data?.recent_expenses?.length > 0 ? (
          <div className="recent-transactions">
            {data.recent_expenses.map((exp) => (
              <div key={exp.id} className="transaction-item">
                <div className="transaction-icon" style={{ background: `${exp.category_color || '#670d2f'}15`, color: exp.category_color || '#670d2f' }}>
                  <HiOutlineCurrencyDollar />
                </div>
                <div className="transaction-info">
                  <span className="transaction-desc">{exp.description || 'Untitled'}</span>
                  <span className="transaction-cat">{exp.category_name || 'Uncategorized'} · {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <span className="transaction-amount">-{formatCurrency(exp.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-small">
            <p>No transactions yet. Start by adding an expense!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
