import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import UserTypeBadge from './UserTypeBadge';
import './Navbar.css';

const Navbar = () => {
  const { logout, isAuthenticated, userType, teamId } = useAuth();
  const { openAuthDrawer } = useUI();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRestrictedNav = () => {
    openAuthDrawer('login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-brand">
          <div className="brand-logo">
            <span className="brand-text">Safe Log AI</span>
          </div>
        </Link>
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/history" className="navbar-link">
                History
              </Link>
              <Link to="/team" className="navbar-link">
                Team
              </Link>
              <Link to="/settings" className="navbar-link">
                Settings
              </Link>
              <UserTypeBadge userType={userType} />
              <button onClick={handleLogout} className="navbar-link navbar-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={handleRestrictedNav} className="navbar-link">
                Dashboard
              </button>
              <button onClick={handleRestrictedNav} className="navbar-link">
                History
              </button>
              <button onClick={handleRestrictedNav} className="navbar-link">
                Team
              </button>
              <div className="navbar-divider"></div>
              <button onClick={() => openAuthDrawer('login')} className="navbar-link navbar-login">
                Sign In
              </button>
              <button onClick={() => openAuthDrawer('signup')} className="navbar-btn-primary">
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

