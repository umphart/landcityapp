import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { 
  FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaHashtag, 
  FaMoneyBillWave, FaCheck, FaTimes, FaSearch, FaFilter,
  FaHome, FaBuilding
} from 'react-icons/fa';
import './Properties.css';

const PROPERTY_TYPES = [
  { value: 'plot', label: '🏗️ Plot' },
  { value: 'house', label: '🏠 House' },
  { value: 'commercial', label: '🏢 Commercial' },
  { value: 'apartment', label: '🏬 Apartment' },
];

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({ total: 0, available: 0, sold: 0, reserved: 0 });

  const [formData, setFormData] = useState({
    property_type: 'plot',
    layout_name: '',
    plot_number: '',
    plot_size: '',
    location: 'Kano State',
    price: '',
    status: 'available',
    client_id: '',
    buyer_name: '',
    buyer_phone: '',
  });

  useEffect(() => {
    fetchProperties();
    fetchClients();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm, filterStatus, filterType]);

  const filterProperties = () => {
    let filtered = [...properties];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.plot_number?.toLowerCase().includes(term) ||
        p.location?.toLowerCase().includes(term) ||
        p.layout_name?.toLowerCase().includes(term) ||
        p.clients?.name?.toLowerCase().includes(term)
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.property_type === filterType);
    }
    setFilteredProperties(filtered);
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      const clientIds = [...new Set(
        (propertiesData || []).filter(p => p.client_id).map(p => p.client_id)
      )];

      let clientsMap = {};
      if (clientIds.length > 0) {
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, name, phone')
          .in('id', clientIds);

        (clientsData || []).forEach(client => {
          clientsMap[client.id] = client;
        });
      }

      const merged = (propertiesData || []).map(property => ({
        ...property,
        clients: property.client_id ? clientsMap[property.client_id] || null : null
      }));

      setProperties(merged);
      setStats({
        total: merged.length,
        available: merged.filter(p => p.status === 'available').length,
        sold: merged.filter(p => p.status === 'sold').length,
        reserved: merged.filter(p => p.status === 'reserved').length,
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Error loading properties. Check database setup.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone')
        .order('name');

      if (!error) {
        setClientsList(data || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.plot_number || !formData.plot_size || !formData.price) {
        toast.error('Please fill in plot number, size, and price');
        return;
      }

      const propertyData = {
        property_type: formData.property_type,
        layout_name: formData.layout_name.trim() || null,
        plot_number: formData.plot_number.trim(),
        plot_size: formData.plot_size.trim(),
        location: formData.location.trim(),
        price: parseFloat(formData.price),
        status: formData.status,
        client_id: formData.client_id || null,
        buyer_name: formData.status === 'sold' ? (formData.buyer_name?.trim() || null) : null,
        buyer_phone: formData.status === 'sold' ? (formData.buyer_phone?.trim() || null) : null,
      };

      if (editingProperty) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editingProperty.id);

        if (error) throw error;
        toast.success('Property updated successfully');
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([propertyData]);

        if (error) {
          if (error.code === '23505') {
            toast.error('Plot number already exists');
            return;
          }
          throw error;
        }
        toast.success('Property added successfully');
      }

      resetForm();
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(error.message || 'Error saving property');
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      property_type: property.property_type || 'plot',
      layout_name: property.layout_name || '',
      plot_number: property.plot_number || '',
      plot_size: property.plot_size || '',
      location: property.location || 'Kano State',
      price: property.price || '',
      status: property.status || 'available',
      client_id: property.client_id || '',
      buyer_name: property.buyer_name || '',
      buyer_phone: property.buyer_phone || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const { error } = await supabase.from('properties').delete().eq('id', id);
        if (error) throw error;
        toast.success('Property deleted successfully');
        fetchProperties();
      } catch (error) {
        toast.error('Error deleting property');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      property_type: 'plot',
      layout_name: '',
      plot_number: '',
      plot_size: '',
      location: 'Kano State',
      price: '',
      status: 'available',
      client_id: '',
      buyer_name: '',
      buyer_phone: '',
    });
    setEditingProperty(null);
    setShowForm(false);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₦0';
    return `₦${Number(amount).toLocaleString('en-NG')}`;
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading properties...</p>
    </div>
  );

  return (
    <div className="properties-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Properties Management</h1>
          <p className="subtitle">Manage plots, houses, and commercial properties</p>
        </div>
        <button onClick={() => { setEditingProperty(null); setShowForm(true); }} className="btn-primary">
          <FaPlus /> Add New Property
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="mini-stat-card">
          <div className="mini-stat-icon" style={{ background: '#e3f2fd', color: '#1976d2' }}><FaHashtag /></div>
          <div className="mini-stat-info"><h3>{stats.total}</h3><p>Total</p></div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-icon" style={{ background: '#e8f5e9', color: '#388e3c' }}><FaCheck /></div>
          <div className="mini-stat-info"><h3>{stats.available}</h3><p>Available</p></div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-icon" style={{ background: '#fff3e0', color: '#e65100' }}><FaMapMarkerAlt /></div>
          <div className="mini-stat-info"><h3>{stats.reserved}</h3><p>Reserved</p></div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-icon" style={{ background: '#fce4ec', color: '#c62828' }}><FaMoneyBillWave /></div>
          <div className="mini-stat-info"><h3>{stats.sold}</h3><p>Sold</p></div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search by plot number, layout, location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="plot">Plots</option>
            <option value="house">Houses</option>
            <option value="commercial">Commercial</option>
            <option value="apartment">Apartments</option>
          </select>
        </div>
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="modal-content modal-compact">
            <button onClick={resetForm} className="btn-close-top"><FaTimes /></button>
            <div className="modal-body">
              <div className="modal-header">
                <h2>{editingProperty ? <><FaEdit /> Edit Property</> : <><FaPlus /> Add New Property</>}</h2>
              </div>
              <form onSubmit={handleSubmit}>
                {/* Property Type & Layout Name */}
                <div className="form-section-compact">
                  <h3><FaHome /> Property Info</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Property Type *</label>
                      <select value={formData.property_type} onChange={(e) => setFormData({ ...formData, property_type: e.target.value })} required>
                        {PROPERTY_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Layout Name (Area/Zone)</label>
                      <input
                        type="text"
                        value={formData.layout_name}
                        onChange={(e) => setFormData({ ...formData, layout_name: e.target.value })}
                        placeholder="e.g., Gwarzo Layout, Kano New Layout"
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
                      <input type="text" value={formData.plot_number} onChange={(e) => setFormData({ ...formData, plot_number: e.target.value })} placeholder="e.g., PLT-001" required />
                    </div>
                    <div className="form-group">
                      <label>Plot Size *</label>
                      <input type="text" value={formData.plot_size} onChange={(e) => setFormData({ ...formData, plot_size: e.target.value })} placeholder="e.g., 50x50" required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price (₦) *</label>
                      <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" required min="0" />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Enter location" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Assign Client (Optional)</label>
                      <select value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}>
                        <option value="">Not assigned</option>
                        {clientsList.map(client => <option key={client.id} value={client.id}>{client.name} - {client.phone}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Buyer info - only show when status is sold */}
                  {formData.status === 'sold' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Buyer Name</label>
                        <input type="text" value={formData.buyer_name} onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })} placeholder="Enter buyer name" />
                      </div>
                      <div className="form-group">
                        <label>Buyer Phone</label>
                        <input type="tel" value={formData.buyer_phone} onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })} placeholder="080XXXXXXXX" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary"><FaCheck /> {editingProperty ? 'Update Property' : 'Save Property'}</button>
                  <button type="button" onClick={resetForm} className="btn-secondary"><FaTimes /> Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Properties Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Plot No.</th>
              <th>Type</th>
              <th>Layout</th>
              <th>Size</th>
              <th>Location</th>
              <th>Price</th>
              <th>Client/Buyer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <tr key={property.id} className={property.status === 'sold' ? 'row-completed' : ''}>
                  <td className="plot-number">{property.plot_number}</td>
                  <td>
                    <span className="property-type-badge">
                      {property.property_type === 'house' ? '🏠 House' : 
                       property.property_type === 'commercial' ? '🏢 Commercial' : 
                       property.property_type === 'apartment' ? '🏬 Apartment' : '🏗️ Plot'}
                    </span>
                  </td>
                  <td>{property.layout_name || '-'}</td>
                  <td>{property.plot_size || '-'}</td>
                  <td>{property.location || 'Kano State'}</td>
                  <td className="paid-amount">{formatCurrency(property.price)}</td>
                  <td>
                    {property.status === 'sold' && property.buyer_name ? (
                      <div>
                        <span className="client-name">{property.buyer_name}</span>
                        <br />
                        <small>{property.buyer_phone}</small>
                      </div>
                    ) : property.clients?.name ? (
                      <div>
                        <span className="client-name">{property.clients.name}</span>
                        <br />
                        <small>{property.clients.phone}</small>
                      </div>
                    ) : (
                      <span className="no-assign">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${property.status}`}>
                      {property.status === 'sold' ? '✓ Sold' : property.status === 'reserved' ? '⟳ Reserved' : 'Available'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(property)} className="btn-icon btn-edit" title="Edit"><FaEdit /></button>
                      <button onClick={() => handleDelete(property.id)} className="btn-icon btn-delete" title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" className="no-data">No properties found. Click "Add New Property" to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Properties;