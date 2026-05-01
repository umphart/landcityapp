import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { 
  FaKey, FaSave, FaEye, FaEyeSlash, FaUserShield,
  FaBuilding, FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt,
  FaWhatsapp, FaYoutube, FaDatabase, FaSync, FaExclamationTriangle, FaUsers, FaMoneyBillWave
} from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('password');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Company settings form
  const [companyForm, setCompanyForm] = useState({
    companyName: 'Landcity Properties Nigeria Limited',
    phone1: '+234 911 366 8055',
    phone2: '+234 906 705 7443',
    email: 'info@lancitypropertiesnigltd.com',
    website: 'www.lancitypropertiesnigltd.com',
    address: 'Shop No. 76&75 Rahama Shopping Complex, Mariri, Maiduguri Road, Opp. Audu Manager Filling Station, Kumbotso L.G, Kano State',
    whatsapp: '+234 803 230 6942',
    youtube: '@landcityproperties',
  });

  // Database stats
  const [dbStats, setDbStats] = useState({
    clients: 0,
    properties: 0,
    payments: 0,
    inquiries: 0,
    teamMembers: 0,
  });

  useEffect(() => {
    fetchDbStats();
    checkAdminUser();
  }, []);

  const checkAdminUser = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('username, full_name, role')
        .eq('username', 'admin')
        .single();
      
      if (data) {
        console.log('Admin user found:', data);
      } else {
        console.warn('No admin user found in database');
      }
    } catch (error) {
      console.error('Error checking admin user:', error);
    }
  };

  const fetchDbStats = async () => {
    try {
      const [clientsRes, propertiesRes, paymentsRes, inquiriesRes, teamRes] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('team_members').select('*', { count: 'exact', head: true }),
      ]);

      setDbStats({
        clients: clientsRes.count || 0,
        properties: propertiesRes.count || 0,
        payments: paymentsRes.count || 0,
        inquiries: inquiriesRes.count || 0,
        teamMembers: teamRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // ========== PASSWORD CHANGE ==========
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Get current user from session
      const username = sessionStorage.getItem('landcityAdminUser') || 'admin';
      
      console.log('Attempting password change for user:', username);
      console.log('Current password entered:', passwordForm.currentPassword);
      
      // Get user from database
      const { data: userData, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError) {
        console.error('User fetch error:', userError);
        
        // Check if table exists
        if (userError.code === '42P01') {
          toast.error('Admin users table not found. Please run the SQL setup in Supabase.');
          return;
        }
        throw new Error('Admin user not found in database');
      }

      console.log('User data from DB:', { 
        username: userData.username, 
        storedPassword: userData.password_hash,
        enteredPassword: passwordForm.currentPassword,
        passwordsMatch: userData.password_hash === passwordForm.currentPassword
      });

      if (!userData) {
        throw new Error('Admin user not found');
      }

      // Check if current password matches
      if (userData.password_hash !== passwordForm.currentPassword) {
        throw new Error(`Current password is incorrect. Stored: "${userData.password_hash}", Entered: "${passwordForm.currentPassword}"`);
      }

      // Update password
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ password_hash: passwordForm.newPassword })
        .eq('username', username);

      if (updateError) {
        console.error('Password update error:', updateError);
        throw updateError;
      }

      toast.success('Password changed successfully!');
      
      // Clear form
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // ========== COMPANY SETTINGS ==========
  const handleCompanySettings = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert([{
          id: 1,
          company_name: companyForm.companyName,
          phone1: companyForm.phone1,
          phone2: companyForm.phone2,
          email: companyForm.email,
          website: companyForm.website,
          address: companyForm.address,
          whatsapp: companyForm.whatsapp,
          youtube: companyForm.youtube,
          updated_at: new Date(),
        }]);

      if (error) {
        if (error.code === '42P01') {
          toast.error('Settings table not found. Please run the SQL setup.');
          return;
        }
        throw error;
      }

      toast.success('Company settings saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // ========== RESET PASSWORD (Emergency) ==========
  const handleResetPassword = async () => {
    if (!window.confirm('This will reset the admin password to "admin123". Continue?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .upsert([{
          username: 'admin',
          password_hash: 'admin123',
          full_name: 'Admin User',
          email: 'admin@landcity.com',
          role: 'super_admin'
        }], { onConflict: 'username' });

      if (error) throw error;
      
      toast.success('Password reset to: admin123');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to reset password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'password', icon: FaKey, label: 'Change Password' },
    { id: 'company', icon: FaBuilding, label: 'Company Info' },
    { id: 'database', icon: FaDatabase, label: 'Database' },
  ];

  return (
    <div className="settings-container">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Manage your account and application settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="settings-content">
        {/* ========== PASSWORD TAB ========== */}
        {activeTab === 'password' && (
          <div className="settings-card">
            <div className="settings-card-header">
              <FaUserShield className="settings-card-icon" />
              <div>
                <h3>Change Password</h3>
                <p>Update your admin account password</p>
              </div>
            </div>
            <form onSubmit={handlePasswordChange} className="settings-form">
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Enter new password (min 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  <FaSave /> {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>

              <div className="reset-section">
                <div className="reset-divider">
                  <span><FaExclamationTriangle /> Emergency Reset</span>
                </div>
                <p className="reset-text">
                  If you forgot your password, click below to reset it to the default password.
                </p>
                <button 
                  type="button" 
                  className="btn-reset" 
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  Reset Password to "admin123"
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========== COMPANY TAB ========== */}
        {activeTab === 'company' && (
          <div className="settings-card">
            <div className="settings-card-header">
              <FaBuilding className="settings-card-icon" />
              <div>
                <h3>Company Information</h3>
                <p>Update your company details displayed on the website</p>
              </div>
            </div>
            <form onSubmit={handleCompanySettings} className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label><FaBuilding /> Company Name</label>
                  <input
                    type="text"
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label><FaEnvelope /> Email</label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FaPhone /> Phone 1</label>
                  <input
                    type="text"
                    value={companyForm.phone1}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone1: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label><FaPhone /> Phone 2</label>
                  <input
                    type="text"
                    value={companyForm.phone2}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone2: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FaGlobe /> Website</label>
                  <input
                    type="text"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label><FaWhatsapp /> WhatsApp</label>
                  <input
                    type="text"
                    value={companyForm.whatsapp}
                    onChange={(e) => setCompanyForm({ ...companyForm, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label><FaYoutube /> YouTube Channel</label>
                <input
                  type="text"
                  value={companyForm.youtube}
                  onChange={(e) => setCompanyForm({ ...companyForm, youtube: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label><FaMapMarkerAlt /> Address</label>
                <textarea
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  <FaSave /> {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========== DATABASE TAB ========== */}
        {activeTab === 'database' && (
          <div className="settings-card">
            <div className="settings-card-header">
              <FaDatabase className="settings-card-icon" />
              <div>
                <h3>Database Statistics</h3>
                <p>Overview of your database records</p>
              </div>
            </div>
            
            <div className="db-stats-grid">
              <div className="db-stat-card">
                <div className="db-stat-icon clients-icon-bg"><FaUsers /></div>
                <div><h3>{dbStats.clients}</h3><p>Clients</p></div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon properties-icon-bg"><FaBuilding /></div>
                <div><h3>{dbStats.properties}</h3><p>Properties</p></div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon payments-icon-bg"><FaMoneyBillWave /></div>
                <div><h3>{dbStats.payments}</h3><p>Payments</p></div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon inquiries-icon-bg"><FaEnvelope /></div>
                <div><h3>{dbStats.inquiries}</h3><p>Inquiries</p></div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon team-icon-bg"><FaUserShield /></div>
                <div><h3>{dbStats.teamMembers}</h3><p>Team Members</p></div>
              </div>
            </div>

            <div className="db-actions">
              <button className="btn-primary" onClick={fetchDbStats}>
                <FaSync /> Refresh Stats
              </button>
              <button 
                className="btn-secondary"
                onClick={() => window.open('https://supabase.com/dashboard/project/epjrvxbbppumrprofgbo', '_blank')}
              >
                <FaDatabase /> Open Supabase Dashboard
              </button>
            </div>

            <div className="db-info">
              <h4>Connection Info</h4>
              <div className="info-row">
                <span>Status:</span>
                <span className="status-badge status-active">Connected</span>
              </div>
              <div className="info-row">
                <span>Database:</span>
                <span>Supabase PostgreSQL</span>
              </div>
              <div className="info-row">
                <span>Project URL:</span>
                <span>epjrvxbbppumrprofgbo.supabase.co</span>
              </div>
              <div className="info-row">
                <span>Auth Method:</span>
                <span>Anon Key</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;