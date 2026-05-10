import { useLocation } from 'react-router-dom';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';

const pageTitles = {
  '/': 'Dashboard',
  '/expenses': 'Expenses',
  '/analytics': 'Analytics',
  '/savings': 'Savings Goals',
  '/settings': 'Settings',
};

const Navbar = ({ onMenuClick }) => {
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
        <span className="navbar-date">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          })}
        </span>
      </div>
    </header>
  );
};

export default Navbar;
