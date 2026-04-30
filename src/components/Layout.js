import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaThLarge, 
  FaUsers, 
  FaBuilding, 
  FaMoneyBillWave, 
  FaSignOutAlt, 
  FaBars,
  FaHome
} from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">
            <FaBars />
          </button>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            <img src="/assets/logo.jpeg" alt="User" />
          </div>
          <div className="user-info">
            <strong>{user?.full_name || 'Admin User'}</strong>
            <span>Administrator</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaThLarge className="nav-icon" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/clients" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaUsers className="nav-icon" />
            <span>Clients</span>
          </NavLink>
          <NavLink to="/properties" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaBuilding className="nav-icon" />
            <span>Properties</span>
          </NavLink>
          <NavLink to="/payments" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaMoneyBillWave className="nav-icon" />
            <span>Payments</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <NavLink to="/" className="home-link">
            <FaHome className="nav-icon" />
            <span>View Website</span>
          </NavLink>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;