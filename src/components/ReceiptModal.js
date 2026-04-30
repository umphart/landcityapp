import React, { useRef } from 'react';
import { FaTimes, FaPrint } from 'react-icons/fa';

const ReceiptModal = ({ client, payment, onClose, formatCurrency }) => {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${client.name}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0;
            }
            .receipt-page {
              width: 100%;
              max-width: 190mm;
              margin: 0 auto;
            }
            .receipt-half {
              border: 2px solid #000;
              padding: 15px;
              margin-bottom: 15px;
              position: relative;
              page-break-inside: avoid;
            }
            .copy-label {
              position: absolute;
              top: 10px;
              right: 10px;
              background: #b8860b;
              color: white;
              padding: 3px 12px;
              font-size: 11px;
              font-weight: bold;
              border-radius: 3px;
            }
            .copy-label.company {
              background: #0f3b3b;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .header img {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              margin-bottom: 5px;
            }
            .header h1 {
              font-size: 16px;
              margin: 3px 0;
              color: #0f3b3b;
            }
            .header h2 {
              font-size: 12px;
              margin: 2px 0;
              color: #b8860b;
            }
            .header p {
              font-size: 9px;
              margin: 1px 0;
              color: #666;
            }
            .section-title {
              background: #0f3b3b;
              color: white;
              padding: 4px 10px;
              margin: 8px 0;
              font-weight: bold;
              font-size: 11px;
            }
            .two-col {
              display: flex;
              justify-content: space-between;
              gap: 15px;
            }
            .col {
              flex: 1;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
              border-bottom: 1px dotted #ccc;
              font-size: 10px;
            }
            .info-label {
              font-weight: bold;
            }
            .total-row {
              font-size: 13px;
              font-weight: bold;
              padding: 5px 0;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
              gap: 20px;
            }
            .sig-block {
              flex: 1;
              text-align: center;
            }
            .sig-line {
              border-top: 1px solid #000;
              padding-top: 3px;
              margin-top: 30px;
              font-size: 9px;
            }
            .footer-text {
              text-align: center;
              font-size: 8px;
              color: #666;
              margin-top: 8px;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .receipt-half { 
                border: 1px solid #000;
                margin-bottom: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-page">
            ${generateReceiptHTML(client, payment, formatCurrency, 'CLIENT COPY', '#b8860b')}
            ${generateReceiptHTML(client, payment, formatCurrency, 'COMPANY COPY', '#0f3b3b')}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const generateReceiptHTML = (client, payment, formatCurrency, copyLabel, copyColor) => `
    <div class="receipt-half">
      <div class="copy-label" style="background: ${copyColor};">${copyLabel}</div>
      
      <div class="header">
        <img src="/assets/logo.jpeg" alt="Logo" />
        <h1>LANDCITY PROPERTIES NIGERIA LIMITED</h1>
        <h2>Property Management | Real Estate Management</h2>
        <p>Shop No. 76&75 Rahama Shopping Complex, Mariri, Maiduguri Road,</p>
        <p>Opp. Audu Manager Filling Station, Kumbotso L.G, Kano State</p>
        <p>📞 +234 911 366 8055, +234 906 705 7443 | 🌐 www.landcitypropertiesnigltd.com</p>
      </div>
      
      <div class="section-title">PAYMENT RECEIPT</div>
      
      <div class="two-col">
        <div class="col">
          <div class="info-row"><span class="info-label">Receipt No:</span><span>RCP-${payment.id?.substring(0, 8)}</span></div>
          <div class="info-row"><span class="info-label">Date:</span><span>${new Date(payment.payment_date).toLocaleDateString('en-NG')}</span></div>
          <div class="info-row"><span class="info-label">Client:</span><span>${client.name}</span></div>
          <div class="info-row"><span class="info-label">Phone:</span><span>${client.phone}</span></div>
        </div>
        <div class="col">
          <div class="info-row"><span class="info-label">Plot No:</span><span>${client.plot_number}</span></div>
          <div class="info-row"><span class="info-label">Plot Size:</span><span>${client.plot_size || 'N/A'}</span></div>
          <div class="info-row"><span class="info-label">Method:</span><span>${payment.payment_method?.replace('_', ' ')}</span></div>
          <div class="info-row"><span class="info-label">Type:</span><span>${payment.payment_type === 'initial_deposit' ? 'Initial Deposit' : `Installment #${payment.installment_number}`}</span></div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="info-row total-row">
        <span class="info-label">Amount Paid:</span>
        <span style="font-size: 14px;">${formatCurrency(payment.amount)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Plot Price:</span>
        <span>${formatCurrency(client.plot_price)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Paid:</span>
        <span>${formatCurrency(client.totalPaid)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Remaining Balance:</span>
        <span style="color: ${client.remainingBalance > 0 ? '#e65100' : '#2e7d32'}; font-weight: bold;">
          ${formatCurrency(client.remainingBalance)}
        </span>
      </div>
      ${payment.notes ? `<div class="info-row"><span class="info-label">Notes:</span><span>${payment.notes}</span></div>` : ''}
      
      <div class="signatures">
        <div class="sig-block">
          <div class="sig-line">Customer Signature</div>
        </div>
        <div class="sig-block">
          <div class="sig-line">Landcity Properties Stamp & Sign</div>
        </div>
      </div>
      
      <div class="footer-text">
        <strong>Thank you for your patronage!</strong> | This receipt is computer generated and valid without signature.<br>
        "Building Trust, One Property at a Time."
      </div>
    </div>
  `;

  const receiptPreviewHTML = `
    <div style="font-family: Arial, sans-serif; font-size: 11px;">
      ${generateReceiptHTML(client, payment, formatCurrency, 'CLIENT COPY', '#b8860b')}
      <div style="border-top: 1px dashed #000; margin: 8px 0;"></div>
      ${generateReceiptHTML(client, payment, formatCurrency, 'COMPANY COPY', '#0f3b3b')}
    </div>
  `;

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content modal-compact" style={{ maxWidth: '750px' }}>
        <button onClick={onClose} className="btn-close-top">
          <FaTimes />
        </button>
        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button onClick={handlePrint} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <FaPrint /> Print Receipt
            </button>
          </div>
          <div 
            ref={receiptRef}
            style={{ 
              background: 'white', 
              border: '1px solid #ddd',
              padding: '15px',
              maxHeight: '65vh',
              overflowY: 'auto'
            }}
            dangerouslySetInnerHTML={{ __html: receiptPreviewHTML }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;