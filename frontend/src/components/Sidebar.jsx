import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard,
    FileText,
    History,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Sun,
    Moon,
    Shield,
    Menu,
    X,
    Home
} from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const location = useLocation();
    const { user, logout, userType } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems = [
        { path: '/', icon: Home, label: 'Home', show: true },
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true },
        { path: '/history', icon: History, label: 'History', show: true },
        { path: '/team', icon: Users, label: 'Team', show: userType === 'team' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics', show: true },
        { path: '/settings', icon: Settings, label: 'Settings', show: true },
    ];

    const handleLogout = () => {
        logout();
        setIsMobileOpen(false);
    };

    const toggleMobile = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="sidebar-mobile-toggle"
                onClick={toggleMobile}
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                {/* Logo Section */}
                <div className="sidebar-header">
                    <Link to="/dashboard" className="sidebar-logo" onClick={() => setIsMobileOpen(false)}>
                        {!isCollapsed && <span className="sidebar-logo-text">Safe Log AI</span>}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.filter(item => item.show).map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <Icon size={20} className="sidebar-nav-icon" />
                                {!isCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
                                {isActive && <div className="sidebar-nav-indicator" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="sidebar-footer">
                    {/* Theme Toggle */}
                    <button
                        className="sidebar-action-btn"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        {!isCollapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>}
                    </button>

                    {/* User Info */}
                    {user && (
                        <div className="sidebar-user">
                            <div className="sidebar-user-avatar">
                                {user.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {!isCollapsed && (
                                <div className="sidebar-user-info">
                                    <div className="sidebar-user-name">{user.username}</div>
                                    <div className="sidebar-user-type">{userType}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Logout */}
                    <button
                        className="sidebar-action-btn logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>

                    {/* Collapse Toggle (Desktop Only) */}
                    <button
                        className="sidebar-collapse-btn"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <Menu size={18} />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
