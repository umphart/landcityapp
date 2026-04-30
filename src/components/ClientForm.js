import React, { useState, useEffect } from 'react';
import { FaUser, FaMapMarkerAlt, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';

const ClientForm = ({ editingClient, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    plot_number: '',
    plot_size: '',
    plot_price: '',
    initial_deposit: '',
    payment_schedule: '12',
    payment_method: 'cash',
    notes: '',
  });

  useEffect(() => {
    if (editingClient) {
      setFormData({
        name: editingClient.name || '',
        phone: editingClient.phone || '',
        plot_number: editingClient.plot_number || '',
        plot_size: editingClient.plot_size || '',
        plot_price: editingClient.plot_price || '',
        initial_deposit: editingClient.initialDeposit || '',
        payment_schedule: (editingClient.payment_schedule || 12).toString(),
        payment_method: 'cash',
        notes: editingClient.notes || '',
      });
    }
  }, [editingClient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const plotPrice = parseFloat(formData.plot_price);
    const initialDeposit = parseFloat(formData.initial_deposit) || 0;

    if (!formData.name || !formData.phone || !formData.plot_number) {
      alert('Please fill in all required fields');
      return;
    }

    if (isNaN(plotPrice) || plotPrice <= 0) {
      alert('Please enter a valid plot price');
      return;
    }

    if (initialDeposit > plotPrice) {
      alert('Initial deposit cannot exceed plot price');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content modal-compact">
        <button onClick={onClose} className="btn-close-top">
          <FaTimes />
        </button>
        <div className="modal-body">
          <div className="modal-header">
            <h2>
              {editingClient ? <><FaUser /> Edit Client</> : <><FaUser /> Add New Client</>}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="compact-form">
            {/* Personal Information */}
            <div className="form-section-compact">
              <h3><FaUser /> Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter client's full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="080XXXXXXXX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="form-section-compact">
              <h3><FaMapMarkerAlt /> Property Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Plot Number *</label>
                  <input
                    type="text"
                    value={formData.plot_number}
                    onChange={(e) => setFormData({ ...formData, plot_number: e.target.value })}
                    placeholder="e.g., PLT-001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Plot Size (e.g., 50x50)</label>
                  <input
                    type="text"
                    value={formData.plot_size}
                    onChange={(e) => setFormData({ ...formData, plot_size: e.target.value })}
                    placeholder="Enter plot size"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Plot Price (₦) *</label>
                  <input
                    type="number"
                    value={formData.plot_price}
                    onChange={(e) => setFormData({ ...formData, plot_price: e.target.value })}
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Initial Deposit (₦)</label>
                  <input
                    type="number"
                    value={formData.initial_deposit}
                    onChange={(e) => setFormData({ ...formData, initial_deposit: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="check">📝 Check</option>
                    <option value="pos">💳 POS Terminal</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Schedule *</label>
                  <select
                    value={formData.payment_schedule}
                    onChange={(e) => setFormData({ ...formData, payment_schedule: e.target.value })}
                    required
                  >
                    <option value="12">12 Months</option>
                    <option value="18">18 Months</option>
                    <option value="24">24 Months</option>
                    <option value="30">30 Months</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes (optional)"
                  rows="2"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <FaCheck /> {editingClient ? 'Update Client' : 'Save Client'}
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

export default ClientForm;