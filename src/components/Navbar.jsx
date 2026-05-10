import { useLocation } from 'react-router-dom';
import { HiOutlineMenuAlt2, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const pageTitles = {
  '/': 'Dashboard',
  '/expenses': 'Expenses',
  '/analytics': 'Analytics',
  '/savings': 'Savings Goals',
  '/settings': 'Settings',
};

const Navbar = ({ onMenuClick, theme, onThemeToggle }) => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'ExpenseIQ';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onMenuClick} id="menu-toggle">
          <HiOutlineMenuAlt2 />
        </button>
        <h1 className="navbar-title">{title}</h1>
      </div>
      <div className="navbar-right">
        <div className="navbar-actions">
          <span className="navbar-date">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}
          </span>
          <button className="theme-toggle" onClick={onThemeToggle} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <HiOutlineMoon /> : <HiOutlineSun />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
