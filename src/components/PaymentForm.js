import React, { useState } from 'react';
import { FaMoneyBillWave, FaUser, FaPhone, FaMapMarkerAlt, FaCheck, FaTimes } from 'react-icons/fa';

const PaymentForm = ({ client, onSave, onClose, formatCurrency }) => {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const success = await onSave(paymentData);
    if (!success) {
      setSaving(false);
    }
  };

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content modal-compact">
        <button onClick={onClose} className="btn-close-top">
          <FaTimes />
        </button>
        <div className="modal-body">
          <div className="modal-header">
            <h2><FaMoneyBillWave /> Record Payment</h2>
          </div>
          <div className="client-info-summary">
            <div className="info-item"><FaUser /> <span><strong>{client.name}</strong></span></div>
            <div className="info-item"><FaPhone /> <span>{client.phone}</span></div>
            <div className="info-item"><FaMapMarkerAlt /> <span>Plot: {client.plot_number} ({client.plot_size})</span></div>
            <div className="info-item">💰 <span>Price: {formatCurrency(client.plot_price)}</span></div>
            <div className="info-item">✅ <span>Paid: {formatCurrency(client.totalPaid)}</span></div>
            <div className="info-item remaining-highlight">
              ⚠️ <span>Remaining: {formatCurrency(client.remainingBalance)}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Payment Amount (₦) *</label>
              <input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                placeholder="Enter amount"
                required
                min="1"
                max={client.remainingBalance}
                step="0.01"
                autoFocus
              />
              <small className="form-hint">Max: {formatCurrency(client.remainingBalance)}</small>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={paymentData.payment_method}
                onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
              >
                <option value="cash">💵 Cash</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
                <option value="check">📝 Check</option>
                <option value="pos">💳 POS Terminal</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                placeholder="Payment notes (optional)"
                rows="2"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                <FaCheck /> {saving ? 'Processing...' : 'Record Payment'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary">
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;