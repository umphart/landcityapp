import React from 'react';
import { FaPhone, FaEdit, FaTrash, FaMoneyBillWave, FaHistory } from 'react-icons/fa';

const ClientTable = ({ clients, onPaymentClick, onViewHistory, onEdit, onDelete, formatCurrency, searchTerm, filterStatus }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Plot No.</th>
            <th>Size</th>
            <th>Price</th>
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
            clients.map((client) => (
              <tr key={client.id} className={client.status === 'completed' ? 'row-completed' : ''}>
                <td className="client-name">{client.name}</td>
                <td><FaPhone className="inline-icon" /> {client.phone}</td>
                <td className="plot-number">{client.plot_number}</td>
                <td>{client.plot_size || 'N/A'}</td>
                <td>{formatCurrency(client.plot_price)}</td>
                <td>{formatCurrency(client.initialDeposit)}</td>
                <td className="paid-amount">{formatCurrency(client.totalPaid)}</td>
                <td className={client.remainingBalance > 0 ? 'remaining-balance' : 'completed-balance'}>
                  {formatCurrency(client.remainingBalance)}
                </td>
                <td><span className="schedule-badge">{client.payment_schedule}mo</span></td>
                <td>
                  <span className={`status-badge status-${client.status}`}>
                    {client.status === 'completed' ? '✓ Completed' : '⟳ Active'}
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
                    <button onClick={() => onDelete(client.id)} className="btn-icon btn-delete" title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
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