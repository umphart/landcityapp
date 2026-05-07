import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaSignInAlt, FaArrowLeft, FaExclamationCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-card">
        <div className="login-header">
          <div className="logo-wrapper">
            <img src="/assets/logo.jpeg" alt="Landcity Logo" className="login-logo" />
          </div>
          <h1>Landcity<span>.</span>Properties</h1>
          <p>Admin Portal</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}
          
          <div className="form-group">
            <label>Username</label>
            <div className="input-wrapper">
            
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
          
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Signing in...
              </>
            ) : (
              <>
                <FaSignInAlt /> Sign In
              </>
            )}
          </button>
             </form>
      </div>
    </div>
  );
};

export default Login;