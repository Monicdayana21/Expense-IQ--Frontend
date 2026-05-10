const StatCard = ({ icon, label, value, subtext, color, trend }) => {
  return (
    <div className="stat-card" style={{ '--card-accent': color || '#670d2f' }}>
      <div className="stat-card-icon" style={{ background: `${color || '#670d2f'}15`, color: color || '#670d2f' }}>
        {icon}
      </div>
      <div className="stat-card-content">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value">{value}</span>
        {subtext && (
          <span className={`stat-card-subtext ${trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : ''}`}>
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
