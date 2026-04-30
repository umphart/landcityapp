import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  FaUsers, FaBuilding, FaMoneyBillWave, FaClock, 
  FaChartLine, FaChartBar, FaChartPie, FaCalendarCheck,
  FaArrowUp, FaArrowDown, FaEllipsisV
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProperties: 0,
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    activeClients: 0,
    monthlyGrowth: 0,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [paymentTypeData, setPaymentTypeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get total clients and active clients
      const { data: clientsData, count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: false });

      const activeClients = (clientsData || []).filter(c => c.status === 'active').length;
      const completedClients = (clientsData || []).filter(c => c.status === 'completed').length;

      // Get all payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      const totalPayments = (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const pendingCount = (payments || []).filter(p => Number(p.remaining_balance) > 0).length;
      const completedCount = (payments || []).filter(p => Number(p.remaining_balance) <= 0).length;

      // Get recent payments with client info
      const { data: recent } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          payment_type,
          payment_method,
          remaining_balance,
          payment_date,
          client_id,
          clients:client_id (name, phone, plot_number)
        `)
        .order('payment_date', { ascending: false })
        .limit(10);

      setStats({
        totalClients: totalClients || 0,
        totalProperties: totalClients || 0,
        totalPayments,
        pendingPayments: pendingCount,
        completedPayments: completedCount,
        activeClients: activeClients || 0,
        monthlyGrowth: 12.5, // Placeholder - calculate from actual data
      });

      setRecentPayments(recent || []);

      // Prepare monthly data
      const monthlyPayments = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach(m => { monthlyPayments[m] = { month: m, revenue: 0, count: 0 }; });

      (payments || []).forEach(payment => {
        const month = new Date(payment.payment_date).toLocaleString('default', { month: 'short' });
        if (monthlyPayments[month]) {
          monthlyPayments[month].revenue += Number(payment.amount) || 0;
          monthlyPayments[month].count += 1;
        }
      });

      setMonthlyData(Object.values(monthlyPayments));

      // Payment type distribution
      const cashPayments = (payments || []).filter(p => p.payment_method === 'cash').length;
      const transferPayments = (payments || []).filter(p => p.payment_method === 'bank_transfer').length;
      const checkPayments = (payments || []).filter(p => p.payment_method === 'check').length;
      const posPayments = (payments || []).filter(p => p.payment_method === 'pos').length;

      setPaymentTypeData([
        { name: 'Cash', value: cashPayments },
        { name: 'Transfer', value: transferPayments },
        { name: 'Check', value: checkPayments },
        { name: 'POS', value: posPayments },
      ].filter(item => item.value > 0));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#b8860b', '#0f3b3b', '#6366f1', '#059669', '#f59e0b', '#dc2626'];
  const PIE_COLORS = ['#b8860b', '#0f3b3b', '#6366f1', '#059669'];

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₦0';
    return `₦${Number(amount).toLocaleString('en-NG')}`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, bgColor }) => (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ background: bgColor }}>
        <Icon className="stat-icon-svg" style={{ color }} />
      </div>
      <div className="stat-content">
        <span className="stat-label">{title}</span>
        <h3 className="stat-value">{value}</h3>
        {subtitle && (
          <div className="stat-subtitle">
            {trend && (
              <span className={`trend ${trend > 0 ? 'up' : 'down'}`}>
                {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
                {Math.abs(trend)}%
              </span>
            )}
            <span>{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return (
    <div className="dashboard-loading">
      <div className="loading-spinner"></div>
      <p>Loading dashboard data...</p>
    </div>
  );

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your properties today.</p>
        </div>
        <div className="header-right">
          <div className="date-display">
            <FaCalendarCheck />
            <span>{new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard 
          icon={FaUsers}
          title="Total Clients"
          value={stats.totalClients}
          subtitle={`${stats.activeClients} active`}
          trend={8.2}
          color="#1976d2"
          bgColor="#e3f2fd"
        />
        <StatCard 
          icon={FaBuilding}
          title="Properties"
          value={stats.totalProperties}
          subtitle="All plots"
          trend={5.1}
          color="#7b1fa2"
          bgColor="#f3e5f5"
        />
        <StatCard 
          icon={FaMoneyBillWave}
          title="Total Revenue"
          value={formatCurrency(stats.totalPayments)}
          subtitle="All time"
          trend={12.5}
          color="#059669"
          bgColor="#e8f5e9"
        />
        <StatCard 
          icon={FaClock}
          title="Pending"
          value={stats.pendingPayments}
          subtitle="Awaiting payment"
          color="#e65100"
          bgColor="#fff3e0"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><FaChartBar /> Monthly Revenue</h3>
            <button className="chart-menu-btn"><FaEllipsisV /></button>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b8860b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#b8860b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    fontSize: '13px'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#b8860b" 
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><FaChartPie /> Payment Methods</h3>
            <button className="chart-menu-btn"><FaEllipsisV /></button>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    fontSize: '13px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span style={{ fontSize: '13px', color: '#475569' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-grid">
        {/* Recent Transactions */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><FaChartLine /> Recent Transactions</h3>
            <button className="chart-menu-btn"><FaEllipsisV /></button>
          </div>
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Plot</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length > 0 ? (
                  recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <div className="client-cell">
                          <div className="client-avatar">
                            {payment.clients?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <strong>{payment.clients?.name || 'N/A'}</strong>
                            <small>{payment.clients?.phone || ''}</small>
                          </div>
                        </div>
                      </td>
                      <td>{payment.clients?.plot_number || 'N/A'}</td>
                      <td>
                        <span className={`type-badge ${payment.payment_type}`}>
                          {payment.payment_type === 'initial_deposit' ? 'Deposit' : 'Installment'}
                        </span>
                      </td>
                      <td className="amount-cell">{formatCurrency(payment.amount)}</td>
                      <td>{new Date(payment.payment_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <span className={`status-dot ${Number(payment.remaining_balance) <= 0 ? 'completed' : 'pending'}`}>
                          {Number(payment.remaining_balance) <= 0 ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <FaMoneyBillWave className="empty-icon" />
                      <p>No transactions yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><FaChartPie /> Quick Summary</h3>
            <button className="chart-menu-btn"><FaEllipsisV /></button>
          </div>
          <div className="summary-list">
            <div className="summary-item">
              <div className="summary-icon" style={{ background: '#e3f2fd' }}>
                <FaUsers style={{ color: '#1976d2' }} />
              </div>
              <div className="summary-info">
                <strong>Active Clients</strong>
                <span>{stats.activeClients} clients with ongoing payments</span>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon" style={{ background: '#e8f5e9' }}>
                <FaMoneyBillWave style={{ color: '#059669' }} />
              </div>
              <div className="summary-info">
                <strong>Completed Payments</strong>
                <span>{stats.completedPayments} fully paid</span>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon" style={{ background: '#fff3e0' }}>
                <FaClock style={{ color: '#e65100' }} />
              </div>
              <div className="summary-info">
                <strong>Pending Balance</strong>
                <span>{formatCurrency(stats.pendingPayments)}</span>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon" style={{ background: '#fce4ec' }}>
                <FaChartLine style={{ color: '#c62828' }} />
              </div>
              <div className="summary-info">
                <strong>Monthly Growth</strong>
                <span className="trend up"><FaArrowUp /> {stats.monthlyGrowth}% from last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;