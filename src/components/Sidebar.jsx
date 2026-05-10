import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineCurrencyDollar, 
  HiOutlineChartBar, 
  HiOutlineCash,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChevronLeft
} from 'react-icons/hi';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
    { path: '/expenses', icon: <HiOutlineCurrencyDollar />, label: 'Expenses' },
    { path: '/analytics', icon: <HiOutlineChartBar />, label: 'Analytics' },
    { path: '/savings', icon: <HiOutlineCash />, label: 'Savings' },
    { path: '/settings', icon: <HiOutlineCog />, label: 'Settings' },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <button className="sidebar-toggle" onClick={onToggleCollapse} title={isCollapsed ? "Expand" : "Collapse"}>
          <HiOutlineChevronLeft />
        </button>

        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon"><HiOutlineCurrencyDollar /></span>
            <span className="logo-text">ExpenseIQ</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title={isCollapsed ? item.label : ""}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'User'}</span>
              <span className="sidebar-user-email">{user?.email || ''}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">
            <HiOutlineLogout />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
