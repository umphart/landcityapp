import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { FaPlus, FaSearch, FaFilter, FaMoneyBillWave, FaCheck, FaTimes, FaHistory } from 'react-icons/fa';
import './Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    deposits: 0,
    installments: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, filterType]);

  const filterPayments = () => {
    let filtered = [...payments];
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clients?.plot_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clients?.phone?.includes(searchTerm)
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.payment_type === filterType);
    }
    setFilteredPayments(filtered);
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients:client_id (name, phone, plot_number, plot_price, plot_size, payment_schedule)
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      
      setPayments(data || []);
      
      const totalAmount = (data || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const deposits = (data || []).filter(p => p.payment_type === 'initial_deposit').length;
      const installments = (data || []).filter(p => p.payment_type === 'installment').length;
      
      setStats({
        totalPayments: (data || []).length,
        totalAmount,
        deposits,
        installments,
      });
    } catch (error) {
      toast.error('Error fetching payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₦0';
    return `₦${Number(amount).toLocaleString('en-NG')}`;
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading payments...</p>
    </div>
  );

  return (
    <div className="payments-container">
      <div className="page-header">
        <div>
          <h1>Payment Records</h1>
          <p className="subtitle">View all payment transactions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="mini-stat-card">
          <div className="mini-stat-icon" style={{ background: '#e3f2fd', color: '#1976d2' }}>
            <FaHistory />
          </div>
          <div className="mini-stat-info">
            <h3>{stats.totalPayments}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-icon" style={{ background: '#e8f5e9', color: '#388e3c' }}>
            <FaMoneyBillWave />
          </div>
          <div className="mini-stat-info">
            <h3>{formatCurrency(stats.totalAmount)}</h3>
            <p>Total Amount</p>
          </div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-icon" style={{ background: '#f3e5f5', color: '#7b1fa2' }}>
            <FaPlus />
          </div>
          <div className="mini-stat-info">
            <h3>{stats.deposits}</h3>
            <p>Deposits</p>
          </div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-icon" style={{ background: '#fff3e0', color: '#e65100' }}>
            <FaHistory />
          </div>
          <div className="mini-stat-info">
            <h3>{stats.installments}</h3>
            <p>Installments</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by client name, phone, or plot number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Payments</option>
            <option value="initial_deposit">Deposits Only</option>
            <option value="installment">Installments Only</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Phone</th>
              <th>Plot No.</th>
              <th>Plot Price</th>
              <th>Type</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.payment_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="client-name">{payment.clients?.name || 'N/A'}</td>
                  <td>{payment.clients?.phone || 'N/A'}</td>
                  <td className="plot-number">{payment.clients?.plot_number || 'N/A'}</td>
                  <td>{formatCurrency(payment.clients?.plot_price)}</td>
                  <td>
                    <span className={`payment-type ${payment.payment_type}`}>
                      {payment.payment_type === 'initial_deposit' ? 'Deposit' : `Inst #${payment.installment_number}/${payment.total_installments}`}
                    </span>
                  </td>
                  <td>{payment.payment_method?.replace('_', ' ')}</td>
                  <td className="paid-amount">{formatCurrency(payment.amount)}</td>
                  <td className={Number(payment.remaining_balance) > 0 ? 'remaining-balance' : 'completed-balance'}>
                    {formatCurrency(payment.remaining_balance)}
                  </td>
                  <td>
                    <span className={`status-badge ${Number(payment.remaining_balance) <= 0 ? 'paid' : 'pending'}`}>
                      {Number(payment.remaining_balance) <= 0 ? '✓ Paid' : '⟳ Pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">
                  {searchTerm || filterType !== 'all' ? 'No payments match your search criteria' : 'No payment records found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;