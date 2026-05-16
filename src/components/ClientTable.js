import React from 'react';
import { FaPhone, FaEdit, FaTrash, FaMoneyBillWave, FaHistory } from 'react-icons/fa';

const ClientTable = ({ clients, onPaymentClick, onViewHistory, onEdit, onDelete, formatCurrency, searchTerm, filterStatus }) => {
  
  // Helper function to get display text for multiple values
  const getDisplayText = (value) => {
    if (!value) return '—';
    const stringValue = String(value);
    const parts = stringValue.split(',').map(p => p.trim());
    if (parts.length === 1) return parts[0];
    return `${parts[0]} +${parts.length - 1} more`;
  };

  // Get total price from comma-separated values
  const getTotalPrice = (priceString) => {
    if (!priceString) return 0;
    const stringValue = String(priceString);
    const prices = stringValue.split(',').map(p => parseFloat(p.trim()) || 0);
    return prices.reduce((sum, price) => sum + price, 0);
  };

  // Get total deposit from comma-separated values
  const getTotalDeposit = (depositString) => {
    if (!depositString) return 0;
    const stringValue = String(depositString);
    const deposits = stringValue.split(',').map(d => parseFloat(d.trim()) || 0);
    return deposits.reduce((sum, deposit) => sum + deposit, 0);
  };

  // Get plot count
  const getPlotCount = (plotNumberString) => {
    if (!plotNumberString) return 0;
    const stringValue = String(plotNumberString);
    return stringValue.split(',').length;
  };

  return (
    <div className="table-container">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Plot(s)</th>
            <th>Size(s)</th>
            <th>Total Price</th>
            <th>Deposit</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.length > 0 ? (
            clients.map((client) => {
              const plotCount = getPlotCount(client.plot_number);
              const totalPrice = getTotalPrice(client.plot_price);
              // Use either the stored total_deposit or calculate from initial_deposit field
              const totalDeposit = client.initial_deposit ? getTotalDeposit(client.initial_deposit) : 0;
              const totalPaid = client.total_paid || 0;
              // Calculate remaining balance: totalPrice - totalPaid
              const remainingBalance = totalPrice - totalPaid;
              
              return (
                <tr key={client.id} className={client.status === 'completed' ? 'row-completed' : ''}>
                  <td className="client-name">
                    {client.name}
                    {plotCount > 1 && <small style={{ display: 'block', fontSize: '10px', color: '#b8860b' }}>{plotCount} plots</small>}
                  </td>
                  <td><FaPhone className="inline-icon" /> {client.phone}</td>
                  <td className="plot-number" title={client.plot_number}>
                    {getDisplayText(client.plot_number)}
                  </td>
                  <td title={client.plot_size}>
                    {getDisplayText(client.plot_size)}
                  </td>
                  <td>{formatCurrency(totalPrice)}</td>
                  <td>{formatCurrency(totalDeposit)}</td>
                  <td className="paid-amount">{formatCurrency(totalPaid)}</td>
                  <td className={remainingBalance > 0 ? 'remaining-balance' : 'completed-balance'}>
                    {formatCurrency(remainingBalance)}
                  </td>
                  <td><span className="schedule-badge">{client.payment_schedule}mo</span></td>
                  <td>
                    <span className={`status-badge status-${client.status}`}>
                      {client.status === 'completed' ? '✓ Completed' : client.status === 'active' ? '⟳ Active' : client.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {client.status !== 'completed' && (
                        <button onClick={() => onPaymentClick(client)} className="btn-icon btn-payment" title="Record Payment">
                          <FaMoneyBillWave />
                        </button>
                      )}
                      <button onClick={() => onViewHistory(client)} className="btn-icon btn-history" title="View History">
                        <FaHistory />
                      </button>
                      <button onClick={() => onEdit(client)} className="btn-icon btn-edit" title="Edit">
                        <FaEdit />
                      </button>
                      {/* FIXED: Pass the full client object, not just the ID */}
                      <button onClick={() => onDelete(client)} className="btn-icon btn-delete" title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="11" className="no-data">
                {searchTerm || filterStatus !== 'all' ? 'No clients match your search criteria' : 'No clients found. Click "Add New Client" to get started.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;