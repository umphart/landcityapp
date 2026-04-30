import React from 'react';
import { FaUser, FaChartLine, FaCheck, FaFileInvoiceDollar, FaClipboardList } from 'react-icons/fa';

const StatsCards = ({ totalClients, activeClients, completedClients, totalRevenue, pendingBalance }) => {
  return (
    <div className="stats-row">
      <div className="mini-stat-card">
        <div className="mini-stat-icon clients-icon"><FaUser /></div>
        <div className="mini-stat-info">
          <h3>{totalClients}</h3>
          <p>Total Clients</p>
        </div>
      </div>
      <div className="mini-stat-card">
        <div className="mini-stat-icon active-icon"><FaChartLine /></div>
        <div className="mini-stat-info">
          <h3>{activeClients}</h3>
          <p>Active</p>
        </div>
      </div>
      <div className="mini-stat-card">
        <div className="mini-stat-icon completed-icon"><FaCheck /></div>
        <div className="mini-stat-info">
          <h3>{completedClients}</h3>
          <p>Completed</p>
        </div>
      </div>
      <div className="mini-stat-card">
        <div className="mini-stat-icon revenue-icon"><FaFileInvoiceDollar /></div>
        <div className="mini-stat-info">
          <h3>{totalRevenue}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
      <div className="mini-stat-card">
        <div className="mini-stat-icon pending-icon"><FaClipboardList /></div>
        <div className="mini-stat-info">
          <h3>{pendingBalance}</h3>
          <p>Pending Balance</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;