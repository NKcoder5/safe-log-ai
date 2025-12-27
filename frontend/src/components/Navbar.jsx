import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserTypeBadge from './UserTypeBadge';
import './Navbar.css';

const Navbar = () => {
  const { logout, isAuthenticated, userType, teamId } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          Safe Log AI
        </Link>
        <div className="navbar-links">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link to="/history" className="navbar-link">
            History
          </Link>
          <Link to="/team" className="navbar-link">
            Team
          </Link>
          <UserTypeBadge userType={userType} />
          <button onClick={handleLogout} className="navbar-link navbar-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

