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
        initial_deposit: editingClient.initial_deposit || '',
        payment_schedule: (editingClient.payment_schedule || 12).toString(),
        payment_method: editingClient.payment_method || 'cash',
        notes: editingClient.notes || '',
      });
    }
  }, [editingClient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('Please fill in client name and phone number');
      return;
    }

    if (!formData.plot_number) {
      alert('Please enter at least one plot number');
      return;
    }

    if (!formData.plot_price) {
      alert('Please enter plot price(s)');
      return;
    }

    // Validate plot numbers and prices have matching counts
    const plotNumbers = formData.plot_number.split(',').map(p => p.trim()).filter(p => p);
    const plotPrices = formData.plot_price.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
    const plotSizes = formData.plot_size ? formData.plot_size.split(',').map(s => s.trim()) : [];
    const initialDeposits = formData.initial_deposit ? formData.initial_deposit.split(',').map(d => parseFloat(d.trim())).filter(d => !isNaN(d)) : [];

    if (plotNumbers.length !== plotPrices.length) {
      alert(`Number of plot numbers (${plotNumbers.length}) must match number of plot prices (${plotPrices.length})`);
      return;
    }

    for (let i = 0; i < plotPrices.length; i++) {
      if (plotPrices[i] <= 0) {
        alert(`Plot price for ${plotNumbers[i]} must be greater than 0`);
        return;
      }
    }

    // Calculate total price and deposit
    const totalPrice = plotPrices.reduce((sum, price) => sum + price, 0);
    const totalDeposit = initialDeposits.reduce((sum, deposit) => sum + deposit, 0);

    if (totalDeposit > totalPrice) {
      alert('Total initial deposit cannot exceed total plot price');
      return;
    }

    onSave(formData);
  };

  // Helper function to format comma-separated values for display
  const formatCommaValue = (value) => {
    if (!value) return '';
    return value.split(',').map(v => v.trim()).join(', ');
  };

  // Get count of plots
  const getPlotCount = () => {
    if (!formData.plot_number) return 0;
    return formData.plot_number.split(',').filter(p => p.trim()).length;
  };

  const plotCount = getPlotCount();

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content modal-compact" style={{ maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
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
              
              <div className="form-group">
                <label>Plot Number(s) *</label>
                <input
                  type="text"
                  value={formData.plot_number}
                  onChange={(e) => setFormData({ ...formData, plot_number: e.target.value })}
                  placeholder="e.g., PLOT001, PLOT002, PLOT003"
                  required
                />
                <small style={{ fontSize: '11px', color: '#64748b' }}>
                  Separate multiple plots with commas. Example: PLOT001, PLOT002, BLOCK A
                </small>
              </div>

              <div className="form-group">
                <label>Plot Size(s)</label>
                <input
                  type="text"
                  value={formData.plot_size}
                  onChange={(e) => setFormData({ ...formData, plot_size: e.target.value })}
                  placeholder="e.g., 50x50, 50x100, 100x200"
                />
                <small style={{ fontSize: '11px', color: '#64748b' }}>
                  Separate multiple sizes with commas, matching plot order
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Plot Price(s) (₦) *</label>
                  <input
                    type="text"
                    value={formData.plot_price}
                    onChange={(e) => setFormData({ ...formData, plot_price: e.target.value })}
                    placeholder="e.g., 2000000, 1500000, 3000000"
                    required
                  />
                  <small style={{ fontSize: '11px', color: '#64748b' }}>
                    Separate multiple prices with commas, matching plot order
                  </small>
                </div>
                <div className="form-group">
                  <label>Initial Deposit(s) (₦)</label>
                  <input
                    type="text"
                    value={formData.initial_deposit}
                    onChange={(e) => setFormData({ ...formData, initial_deposit: e.target.value })}
                    placeholder="e.g., 500000, 300000, 600000"
                  />
                  <small style={{ fontSize: '11px', color: '#64748b' }}>
                    Separate multiple deposits with commas, matching plot order
                  </small>
                </div>
              </div>

              {/* Summary for multiple plots */}
              {plotCount > 0 && formData.plot_price && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginTop: '12px',
                  fontSize: '13px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>Number of Plots:</strong>
                    <span style={{ color: '#b8860b', fontWeight: 'bold' }}>{plotCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>Total Plot Price:</strong>
                    <span style={{ color: '#b8860b', fontWeight: 'bold' }}>
                      ₦{formData.plot_price.split(',').reduce((sum, p) => sum + (parseFloat(p) || 0), 0).toLocaleString('en-NG')}
                    </span>
                  </div>
                  {formData.initial_deposit && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Total Initial Deposit:</strong>
                      <span style={{ color: '#059669', fontWeight: 'bold' }}>
                        ₦{formData.initial_deposit.split(',').reduce((sum, d) => sum + (parseFloat(d) || 0), 0).toLocaleString('en-NG')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Settings */}
            <div className="form-section-compact">
              <h3><FaCalendarAlt /> Payment Settings</h3>
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
                  <label>Payment Schedule (Months) *</label>
                  <select
                    value={formData.payment_schedule}
                    onChange={(e) => setFormData({ ...formData, payment_schedule: e.target.value })}
                    required
                  >
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="18">18 Months</option>
                    <option value="24">24 Months</option>
                    <option value="30">30 Months</option>
                    <option value="36">36 Months</option>
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

            {/* Preview of how data will be saved */}
            {(formData.plot_number || formData.plot_size || formData.plot_price) && (
              <div style={{ 
                background: '#fefce8', 
                padding: '10px', 
                borderRadius: '6px', 
                marginTop: '10px',
                fontSize: '11px',
                border: '1px solid #fde047'
              }}>
                <strong>📋 Data Preview:</strong><br />
                <strong>Plots:</strong> {formData.plot_number || '—'}<br />
                <strong>Sizes:</strong> {formData.plot_size || '—'}<br />
                <strong>Prices:</strong> {formData.plot_price || '—'}<br />
                <strong>Deposits:</strong> {formData.initial_deposit || '—'}
              </div>
            )}

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