import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { FaPlus, FaSearch, FaFilter, FaMoneyBillWave, FaCheck, FaTimes, FaHistory } from 'react-icons/fa';
import './Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [clientsMap, setClientsMap] = useState({});
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
    fetchAllData();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, clientsMap, searchTerm, filterType]);

  const filterPayments = () => {
    let filtered = [...payments];
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const client = clientsMap[p.client_id];
        return client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client?.plot_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client?.phone?.includes(searchTerm);
      });
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.payment_type === filterType);
    }
    setFilteredPayments(filtered);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch payments first
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;
      
      if (paymentsData && paymentsData.length > 0) {
        // Get unique client IDs
        const clientIds = [...new Set(paymentsData.map(p => p.client_id).filter(id => id))];
        
        // Fetch all related clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name, phone, plot_number, plot_price, plot_size, payment_schedule')
          .in('id', clientIds);
        
        if (clientsError) throw clientsError;
        
        // Create a map for quick lookup
        const clientsMapData = {};
        (clientsData || []).forEach(client => {
          clientsMapData[client.id] = client;
        });
        
        setClientsMap(clientsMapData);
        setPayments(paymentsData || []);
        
        // Calculate stats
        const totalAmount = (paymentsData || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const deposits = (paymentsData || []).filter(p => p.payment_type === 'initial_deposit').length;
        const installments = (paymentsData || []).filter(p => p.payment_type === 'installment').length;
        
        setStats({
          totalPayments: (paymentsData || []).length,
          totalAmount,
          deposits,
          installments,
        });
      } else {
        setPayments([]);
        setClientsMap({});
        setStats({
          totalPayments: 0,
          totalAmount: 0,
          deposits: 0,
          installments: 0,
        });
      }
    } catch (error) {
      toast.error('Error fetching payments: ' + error.message);
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₦0';
    return `₦${Number(amount).toLocaleString('en-NG')}`;
  };

  const getPaymentTypeLabel = (payment) => {
    if (payment.payment_type === 'initial_deposit') {
      return 'Deposit';
    }
    return `Installment #${payment.installment_number}/${payment.total_installments}`;
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
        <table className="payments-table">
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
              filteredPayments.map((payment) => {
                const client = clientsMap[payment.client_id];
                const isCompleted = Number(payment.remaining_balance) <= 0;
                
                return (
                  <tr key={payment.id}>
                    <td>{new Date(payment.payment_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="client-name">{client?.name || 'Unknown Client'}</td>
                    <td>{client?.phone || 'N/A'}</td>
                    <td className="plot-number">{client?.plot_number || 'N/A'}</td>
                    <td>{formatCurrency(client?.plot_price)}</td>
                    <td>
                      <span className={`payment-type ${payment.payment_type}`}>
                        {getPaymentTypeLabel(payment)}
                      </span>
                    </td>
                    <td>{payment.payment_method?.replace('_', ' ')}</td>
                    <td className="paid-amount">{formatCurrency(payment.amount)}</td>
                    <td className={!isCompleted ? 'remaining-balance' : 'completed-balance'}>
                      {formatCurrency(payment.remaining_balance)}
                    </td>
                    <td>
                      <span className={`status-badge ${isCompleted ? 'paid' : 'pending'}`}>
                        {isCompleted ? '✓ Paid' : '⟳ Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })
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