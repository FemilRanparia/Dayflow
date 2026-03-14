import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isHR } = useAuth();
    const { organization, logo, name, brandColor, clearOrganization } = useOrganization();
    const navigate = useNavigate();
    const location = useLocation();

    // Helper function to get full image URL
    const getImageUrl = (path, name = 'User') => {
        if (!path) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
        if (path.startsWith('http')) return path;
        // Remove /api from the URL since uploads are served at root level
        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace('/api', '');
        return `${baseUrl}${path}`;
    };

    const handleLogout = () => {
        logout();
        clearOrganization();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="navbar" style={{ borderBottom: `3px solid ${brandColor}` }}>
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-brand">
                    {logo ? (
                        <img
                            src={getImageUrl(logo, name)}
                            alt={name}
                            className="navbar-brand-logo"
                        />
                    ) : (
                        <div
                            className="navbar-brand-icon"
                            style={{ backgroundColor: brandColor }}
                        >
                            {name.charAt(0)}
                        </div>
                    )}
                    <span className="navbar-brand-text">{name}</span>
                </Link>

                <ul className="navbar-menu">
                    <li>
                        <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard')}`}>
                            Dashboard
                        </Link>
                    </li>
                    {user?.role !== 'SuperAdmin' && (
                        <>
                            <li>
                                <Link to="/profile" className={`navbar-link ${isActive('/profile')}`}>
                                    Profile
                                </Link>
                            </li>
                            <li>
                                <Link to="/attendance" className={`navbar-link ${isActive('/attendance')}`}>
                                    Attendance
                                </Link>
                            </li>
                            <li>
                                <Link to="/leaves" className={`navbar-link ${isActive('/leaves')}`}>
                                    Leaves
                                </Link>
                            </li>
                        </>
                    )}
                    {user?.role === 'SuperAdmin' && (
                        <li>
                            <Link to="/organizations" className={`navbar-link ${isActive('/organizations')}`}>
                                Organizations
                            </Link>
                        </li>
                    )}
                    {isHR && (
                        <li>
                            <Link to="/employees" className={`navbar-link ${isActive('/employees')}`}>
                                Employees
                            </Link>
                        </li>
                    )}
                    {(isHR || user?.role === 'SuperAdmin') && (
                        <li>
                            <Link to="/organization-settings" className={`navbar-link ${isActive('/organization-settings')}`}>
                                Settings
                            </Link>
                        </li>
                    )}
                </ul>

                <div className="navbar-user">
                    <div className="navbar-user-info">
                        <span className="navbar-user-name">
                            {user?.firstName} {user?.lastName}
                        </span>
                        <span className="navbar-user-role">{user?.role}</span>
                        {organization && (
                            <span className="navbar-user-org">{organization.name}</span>
                        )}
                    </div>
                    <img
                        src={getImageUrl(user?.profilePicture, `${user?.firstName} ${user?.lastName}`)}
                        alt="Profile"
                        className="navbar-avatar"
                    />
                    <button onClick={handleLogout} className="navbar-logout">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
