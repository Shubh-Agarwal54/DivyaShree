import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

/**
 * Generates a shipping + tax invoice PDF matching the DivyaShree invoice format.
 * @param {object} orderData  – order document from API
 */
export const generateInvoicePDF = async (orderData) => {
  try {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth(); // 595.28
    const M  = 28;                               // left / right margin
    const cw = pw - 2 * M;                       // ~539

    /* ── helpers ─────────────────────────────────────────────── */
    const fmtRs = (v) =>
      `Rs.${Number(v || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    const fmtDate = (d) => {
      const dt = new Date(d);
      return `${String(dt.getDate()).padStart(2, '0')}.${String(
        dt.getMonth() + 1
      ).padStart(2, '0')}.${dt.getFullYear()}`;
    };

    const ship        = orderData.shippingAddress || {};
    const custName    = ship.name ||
      `${orderData.userId?.firstName || ''} ${orderData.userId?.lastName || ''}`.trim() ||
      'Customer';
    const payMethod   = (orderData.paymentMethod || 'cod').toUpperCase();
    const isCOD       = payMethod === 'COD';
    const orderNum    = orderData.orderNumber || 'DS000000';
    const orderDate   = fmtDate(orderData.createdAt || new Date());
    const invoiceDate = fmtDate(new Date());

    /* ── QR code ──────────────────────────────────────────────── */
    const qrDataUrl = await QRCode.toDataURL(orderNum, { margin: 1, width: 128 });

    /* ── Barcode ──────────────────────────────────────────────── */
    const barcodeCanvas = document.createElement('canvas');
    JsBarcode(barcodeCanvas, orderNum, {
      format: 'CODE128',
      displayValue: false,
      height: 68,
      width: 2,
      margin: 4,
    });
    const barcodeDataUrl = barcodeCanvas.toDataURL('image/png');

    /* ═══════════════════════════════════════════════════════════
     * SECTION 1 — SHIPPING LABEL
     * ═══════════════════════════════════════════════════════════*/
    const labelTop    = M;
    const addressH    = 196;   // two-column address area
    const barcodeStrH = 56;    // barcode strip at bottom
    const totalLabelH = addressH + barcodeStrH;
    const leftColW    = 248;
    const divX        = M + leftColW;   // vertical divider x
    const rightColW   = cw - leftColW;

    /* outer border */
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.rect(M, labelTop, cw, totalLabelH);

    /* vertical divider (address area only) */
    doc.setLineWidth(0.5);
    doc.line(divX, labelTop, divX, labelTop + addressH);

    /* horizontal line above barcode strip */
    doc.line(M, labelTop + addressH, M + cw, labelTop + addressH);

    /* ─── LEFT COLUMN ─────────────────────────────────────────── */
    const lx = M + 8;
    let ly   = labelTop + 14;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 110, 110);
    doc.text('Customer Address', lx, ly);
    ly += 13;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(custName, lx, ly);
    ly += 13;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const addrLines = [
      custName,
      ship.address || '',
      [ship.city, ship.state].filter(Boolean).join(', '),
      [ship.state, ship.pincode].filter(Boolean).join(', '),
    ].filter(Boolean);
    addrLines.forEach((ln) => {
      const wrapped = doc.splitTextToSize(ln, leftColW - 16);
      doc.text(wrapped, lx, ly);
      ly += wrapped.length * 11;
    });

    ly += 5;
    doc.setLineWidth(0.3);
    doc.setDrawColor(170, 170, 170);
    doc.line(lx, ly, divX - 6, ly);
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    ly += 10;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('If undelivered, return to:', lx, ly);
    ly += 10;

    doc.setFont('helvetica', 'normal');
    ['SHREE DIYA FASHION', 'DivyaShree Collection, India'].forEach((ln) => {
      doc.text(ln, lx, ly);
      ly += 10;
    });

    /* ─── RIGHT COLUMN ─────────────────────────────────────────── */
    const rx    = divX + 8;
    let   ry    = labelTop + 4;
    const qrSz  = 88;
    const qrX   = M + cw - qrSz - 6;
    const qrY   = labelTop + 18;

    /* COD / PREPAID header bar (full right-col width) */
    doc.setFillColor(0, 0, 0);
    doc.rect(divX, ry, rightColW, 16, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const codText = isCOD
      ? 'COD: Check the payable amount on the app'
      : `PREPAID — ${payMethod}`;
    doc.text(codText, rx, ry + 11);
    doc.setTextColor(0, 0, 0);
    ry += 20;

    /* Carrier name */
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DivyaShree Shipping', rx, ry);
    ry += 15;

    /* Pickup badge */
    doc.setFillColor(210, 210, 210);
    doc.rect(rx, ry - 9, 40, 13, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Pickup', rx + 5, ry);
    ry += 16;

    /* QR (right-side within right col) */
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSz, qrSz);

    /* Destination Code */
    doc.setFontSize(7);
    doc.setTextColor(110, 110, 110);
    doc.text('Destination Code', rx, ry);
    ry += 13;

    const cityCode  = (ship.city  || '').toUpperCase().replace(/\s+/g, '_').substring(0, 12);
    const stateCode = (ship.state || '').substring(0, 10);
    doc.setFontSize(17);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(cityCode, rx, ry);
    ry += 20;
    doc.setFontSize(14);
    doc.text(`_${stateCode}`, rx, ry);
    ry += 17;

    /* Return Code */
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 110, 110);
    doc.text('Return Code', rx, ry);
    ry += 11;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(ship.pincode || '-', rx, ry);

    /* Large order number just above barcode strip (right side) */
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(orderNum, divX + 8, labelTop + addressH - 14);

    /* Barcode — full width in barcode strip */
    doc.addImage(
      barcodeDataUrl, 'PNG',
      M + 16, labelTop + addressH + 7,
      cw - 32, 42
    );

    /* ═══════════════════════════════════════════════════════════
     * SECTION 2 — PRODUCT DETAILS TABLE
     * ═══════════════════════════════════════════════════════════*/
    let y = labelTop + totalLabelH + 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Product Details', M, y);
    y += 4;

    const prodBody = (orderData.items || []).map((it) => [
      it.name || it.sku || '-',
      it.size  || 'Free Size',
      String(it.quantity || 0),
      it.color || 'As Shown',
      orderNum,
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['SKU / Product', 'Size', 'Qty', 'Color', 'Order No.']],
      body: prodBody,
      styles: { fontSize: 8, cellPadding: 3.5 },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 145 },
        1: { cellWidth: 68 },
        2: { cellWidth: 28, halign: 'center' },
        3: { cellWidth: 68 },
        4: { cellWidth: 'auto' },
      },
      theme: 'grid',
    });

    /* ═══════════════════════════════════════════════════════════
     * SECTION 3 — TAX INVOICE
     * ═══════════════════════════════════════════════════════════*/
    y = doc.lastAutoTable.finalY + 6;

    /* "TAX INVOICE" header bar */
    doc.setFillColor(240, 240, 240);
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(M, y, cw, 17, 'FD');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TAX INVOICE', M + cw / 2, y + 12, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Original For Recipient', M + cw - 4, y + 12, { align: 'right' });
    y += 17;

    /* Bill To | Sold By two-column info row */
    const billW     = cw * 0.46;
    const soldStartX = M + billW;
    const infoH     = 92;
    doc.rect(M, y, cw, infoH);
    doc.line(soldStartX, y, soldStartX, y + infoH);

    /* BILL TO / SHIP TO */
    let bly = y + 11;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO / SHIP TO', M + 6, bly);
    bly += 10;
    doc.setFont('helvetica', 'normal');
    [
      custName,
      ship.address || '',
      [ship.city, ship.state].filter(Boolean).join(', '),
      ship.pincode
        ? `${ship.pincode}${ship.state ? ', Place of Supply: ' + ship.state : ''}`
        : '',
    ]
      .filter(Boolean)
      .forEach((ln) => {
        const w = doc.splitTextToSize(ln, billW - 12);
        doc.text(w, M + 6, bly);
        bly += w.length * 10;
      });

    /* SOLD BY */
    let sly = y + 11;
    const sX = soldStartX + 6;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Sold by: SHREE DIYA FASHION', sX, sly); sly += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('DivyaShree Collection, India', sX, sly); sly += 10;
    doc.text('GSTIN: —', sX, sly); sly += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Purchase Order No.', sX, sly); sly += 10;
    doc.setFont('helvetica', 'normal');
    doc.text(orderNum, sX, sly); sly += 12;

    /* Invoice No / Order Date / Invoice Date mini-grid */
    const soldColW  = cw - billW;
    const metaColW  = soldColW / 3;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    ['Invoice No.', 'Order Date', 'Invoice Date'].forEach((hdr, i) => {
      doc.text(hdr, sX + i * metaColW, sly);
    });
    sly += 9;
    doc.setFont('helvetica', 'normal');
    [orderNum, orderDate, invoiceDate].forEach((val, i) => {
      doc.text(String(val), sX + i * metaColW, sly);
    });

    y += infoH;

    /* ── Tax items table ─────────────────────────────────────── */
    const discount  = Number(orderData.discount || 0);
    const subtotal  = Number(orderData.subtotal || 0);
    const shipping  = Number(orderData.shipping || 0);
    const TAX_RATE  = 5; // 5% GST

    const taxRows = (orderData.items || []).map((it) => {
      const gross     = (it.price || 0) * (it.quantity || 0);
      const itemDisc  = subtotal > 0
        ? +((discount / subtotal) * gross).toFixed(2)
        : 0;
      const taxable   = +(gross - itemDisc).toFixed(2);
      const tax       = +((taxable * TAX_RATE) / 100).toFixed(2);
      return [
        `${it.name || '-'}${it.size ? ' - ' + it.size : ''}`,
        it.hsn || '610910',
        String(it.quantity || 0),
        fmtRs(gross),
        fmtRs(itemDisc),
        fmtRs(taxable),
        `IGST @${TAX_RATE}%\n${fmtRs(tax)}`,
        fmtRs(gross),
      ];
    });

    if (shipping > 0) {
      const shippingTax = +((shipping * TAX_RATE) / 100).toFixed(2);
      taxRows.push([
        'Other Charges',
        '996812',
        'NA',
        fmtRs(shipping),
        fmtRs(0),
        fmtRs(shipping),
        `IGST @${TAX_RATE}%\n${fmtRs(shippingTax)}`,
        fmtRs(shipping),
      ]);
    }

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['Description', 'HSN', 'Qty', 'Gross Amount', 'Discount', 'Taxable Value', 'Taxes', 'Total']],
      body: taxRows,
      foot: [['Total', '', '', '', '', '', '', fmtRs(orderData.total)]],
      styles: { fontSize: 7.5, cellPadding: 3 },
      headStyles: {
        fillColor:  [255, 255, 255],
        textColor:  [0, 0, 0],
        fontStyle:  'bold',
        lineWidth:  0.5,
        lineColor:  [0, 0, 0],
        halign:     'center',
        fontSize:   7.5,
      },
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        halign:    'right',
      },
      columnStyles: {
        0: { cellWidth: 128 },
        1: { cellWidth: 40,  halign: 'center' },
        2: { cellWidth: 26,  halign: 'center' },
        3: { cellWidth: 56,  halign: 'right'  },
        4: { cellWidth: 50,  halign: 'right'  },
        5: { cellWidth: 56,  halign: 'right'  },
        6: { cellWidth: 62,  halign: 'right'  },
        7: { cellWidth: 'auto', halign: 'right' },
      },
      theme: 'grid',
    });

    /* ── Footer note ─────────────────────────────────────────── */
    y = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const noteText =
      'Tax is not payable on reverse charge basis. This is a computer generated invoice and does not require signature. ' +
      'Other charges are charges that are applicable to your order and include charges for logistics fee (where applicable). ' +
      'Includes discounts for your city and/or for online payments (as applicable)';
    doc.text(doc.splitTextToSize(noteText, cw), M, y);

    doc.save(`invoice-${orderNum}.pdf`);
  } catch (err) {
    console.error('Failed to generate PDF', err);
    alert('Failed to generate invoice PDF');
  }
};
