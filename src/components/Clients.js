import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { 
  FaPlus, 
  FaUser,
  FaChartLine,
  FaCheck,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import ClientForm from './ClientForm';
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';
import ClientTable from './ClientTable';
import StatsCards from './StatsCards';
import ReceiptModal from './ReceiptModal';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    completedClients: 0,
    totalRevenue: 0,
    pendingBalance: 0
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, filterStatus]);

  const filterClients = () => {
    let filtered = [...clients];
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.plot_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(client => client.status === filterStatus);
    }
    setFilteredClients(filtered);
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (paymentsError) console.error('Payments fetch error:', paymentsError);

      const paymentsByClient = {};
      (paymentsData || []).forEach(payment => {
        if (!paymentsByClient[payment.client_id]) {
          paymentsByClient[payment.client_id] = [];
        }
        paymentsByClient[payment.client_id].push(payment);
      });

      const clientsWithBalances = (clientsData || []).map(client => {
        const clientPayments = paymentsByClient[client.id] || [];
        const totalPaid = clientPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const initialDeposit = clientPayments.find(p => p.payment_type === 'initial_deposit')?.amount || 0;
        const remainingBalance = (Number(client.plot_price) || 0) - totalPaid;
        return {
          ...client,
          payments: clientPayments,
          totalPaid,
          initialDeposit: Number(initialDeposit),
          remainingBalance,
          status: client.status || (remainingBalance <= 0 ? 'completed' : 'active')
        };
      });

      setClients(clientsWithBalances);
      
      const active = clientsWithBalances.filter(c => c.status === 'active').length;
      const completed = clientsWithBalances.filter(c => c.status === 'completed').length;
      const revenue = clientsWithBalances.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
      const pending = clientsWithBalances.reduce((sum, c) => sum + (c.remainingBalance > 0 ? c.remainingBalance : 0), 0);
      
      setStats({
        totalClients: clientsWithBalances.length,
        activeClients: active,
        completedClients: completed,
        totalRevenue: revenue,
        pendingBalance: pending
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients. Please check your database setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClient = async (formData) => {
    try {
      const plotPrice = parseFloat(formData.plot_price);
      const initialDeposit = parseFloat(formData.initial_deposit) || 0;
      const remainingBalance = plotPrice - initialDeposit;

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            plot_number: formData.plot_number.trim(),
            plot_size: formData.plot_size.trim(),
            plot_price: plotPrice,
            payment_schedule: parseInt(formData.payment_schedule),
            notes: formData.notes || null,
          })
          .eq('id', editingClient.id);
        if (error) throw error;
        toast.success('Client updated successfully');
      } else {
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert([{
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            plot_number: formData.plot_number.trim(),
            plot_size: formData.plot_size.trim(),
            plot_price: plotPrice,
            payment_schedule: parseInt(formData.payment_schedule),
            status: initialDeposit >= plotPrice ? 'completed' : 'active',
            notes: formData.notes || null,
          }])
          .select()
          .single();

        if (error) throw error;
        if (!newClient) throw new Error('Failed to create client');

        if (initialDeposit > 0) {
          const { error: paymentError } = await supabase
            .from('payments')
            .insert([{
              client_id: newClient.id,
              amount: initialDeposit,
              payment_type: 'initial_deposit',
              payment_method: formData.payment_method,
              installment_number: 0,
              total_installments: parseInt(formData.payment_schedule),
              remaining_balance: remainingBalance,
              notes: 'Initial deposit',
            }]);
          if (paymentError) {
            toast.error('Client created but initial deposit recording failed');
          }
        }
        toast.success('Client added successfully');
      }
      setShowForm(false);
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(error.message || 'An error occurred while saving');
    }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      const amount = parseFloat(paymentData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid payment amount');
        return false;
      }
      if (amount > selectedClient.remainingBalance) {
        toast.error(`Payment cannot exceed remaining balance of ₦${selectedClient.remainingBalance.toLocaleString()}`);
        return false;
      }

      const { data: existingPayments } = await supabase
        .from('payments')
        .select('installment_number')
        .eq('client_id', selectedClient.id)
        .neq('payment_type', 'initial_deposit')
        .order('installment_number', { ascending: false })
        .limit(1);

      const nextInstallment = (existingPayments && existingPayments.length > 0) 
        ? (existingPayments[0].installment_number || 0) + 1 : 1;

      const newRemainingBalance = selectedClient.remainingBalance - amount;
      const newStatus = newRemainingBalance <= 0 ? 'completed' : 'active';

      const { data: newPayment, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          client_id: selectedClient.id,
          amount: amount,
          payment_type: 'installment',
          payment_method: paymentData.payment_method,
          installment_number: nextInstallment,
          total_installments: selectedClient.payment_schedule,
          remaining_balance: newRemainingBalance,
          notes: paymentData.notes || `Installment #${nextInstallment} of ${selectedClient.payment_schedule}`,
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', selectedClient.id);

      toast.success(newStatus === 'completed' ? '🎉 Payment completed! Property fully paid.' : 'Payment recorded successfully');
      
      setShowPaymentForm(false);
      
      // Show receipt
      if (newPayment) {
        setSelectedPayment(newPayment);
        setShowReceipt(true);
      }
      
      fetchClients();
      return true;
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error(error.message || 'Failed to record payment');
      return false;
    }
  };

  const viewPaymentHistory = async (client) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('client_id', client.id)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      setPaymentHistory(data || []);
      setSelectedClient(client);
      setShowPaymentHistory(true);
    } catch (error) {
      toast.error('Error fetching payment history');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client? All payment records will also be deleted.')) {
      try {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error('Error deleting client');
      }
    }
  };

  const handlePaymentClick = (client) => {
    setSelectedClient(client);
    setShowPaymentForm(true);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₦0';
    return `₦${Number(amount).toLocaleString('en-NG')}`;
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading clients...</p>
    </div>
  );

  return (
    <div className="clients-container">
      <div className="page-header">
        <div>
          <h1>Clients Management</h1>
          <p className="subtitle">Manage your clients and payment plans</p>
        </div>
        <button onClick={() => { setEditingClient(null); setShowForm(true); }} className="btn-primary">
          <FaPlus /> Add New Client
        </button>
      </div>

      <StatsCards 
        totalClients={stats.totalClients}
        activeClients={stats.activeClients}
        completedClients={stats.completedClients}
        totalRevenue={formatCurrency(stats.totalRevenue)}
        pendingBalance={formatCurrency(stats.pendingBalance)}
      />

      <div className="search-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, phone, or plot number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Clients</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed Only</option>
          </select>
        </div>
      </div>

      <ClientTable 
        clients={filteredClients}
        onPaymentClick={handlePaymentClick}
        onViewHistory={viewPaymentHistory}
        onEdit={handleEdit}
        onDelete={handleDelete}
        formatCurrency={formatCurrency}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
      />

      {showForm && (
        <ClientForm 
          editingClient={editingClient}
          onSave={handleSaveClient}
          onClose={() => { setShowForm(false); setEditingClient(null); }}
        />
      )}

      {showPaymentForm && selectedClient && (
        <PaymentForm 
          client={selectedClient}
          onSave={handleSavePayment}
          onClose={() => setShowPaymentForm(false)}
          formatCurrency={formatCurrency}
        />
      )}

      {showPaymentHistory && selectedClient && (
        <PaymentHistory 
          client={selectedClient}
          payments={paymentHistory}
          onClose={() => setShowPaymentHistory(false)}
          formatCurrency={formatCurrency}
        />
      )}

      {showReceipt && selectedPayment && selectedClient && (
        <ReceiptModal 
          client={selectedClient}
          payment={selectedPayment}
          onClose={() => { setShowReceipt(false); setSelectedPayment(null); }}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default Clients;