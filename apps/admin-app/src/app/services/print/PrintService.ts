/**
 * Print Service — orchestrates receipt printing.
 *
 * Primary: Web USB + ESC/POS for XP-80C thermal printers.
 * Fallback: CSS @media print via hidden iframe.
 *
 * Uses the visual template from receiptTemplate (designed in TemplateEditor).
 */

import { buildReceiptFromTemplate, type ReceiptData } from './EscPosBuilder';
import * as UsbPrinter from './UsbPrinterDriver';
import { loadTemplate, type ReceiptTemplate, type ReceiptElement } from './receiptTemplate';

/**
 * Print a receipt for the given order data.
 * Reads the user's saved template, renders it, and sends to printer.
 */
export async function printReceipt(data: ReceiptData): Promise<void> {
  const template = loadTemplate();
  const copies = template.copies || 1;

  for (let i = 0; i < copies; i++) {
    if (UsbPrinter.isConnected()) {
      const bytes = buildReceiptFromTemplate(template, data);
      await UsbPrinter.print(bytes);
    } else {
      await cssPrintFallback(template, data);
      break; // CSS print shows dialog, only once
    }
  }
}

/* ─── CSS print fallback ─── */

/**
 * Renders receipt HTML in a hidden iframe based on the template, then triggers window.print().
 */
function cssPrintFallback(template: ReceiptTemplate, data: ReceiptData): Promise<void> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '80mm';
    iframe.style.height = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(buildReceiptHtml(template, data));
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow!.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          resolve();
        }, 1000);
      }, 200);
    };

    setTimeout(() => {
      try { iframe.contentWindow!.print(); } catch { /* ignore */ }
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch { /* ignore */ }
        resolve();
      }, 1000);
    }, 1500);
  });
}

/* ─── HTML builder from template ─── */

function resolveVariable(key: string, data: ReceiptData): string {
  switch (key) {
    case 'storeName':    return data.storeName;
    case 'storeAddress': return data.storeAddress ?? '';
    case 'dateTime':     return data.dateTime;
    case 'staffName':    return data.staffName;
    case 'machineName':  return data.machineName;
    case 'customerName': return data.customerName ?? '---';
    case 'orderId':      return data.orderId != null ? `#${data.orderId}` : '';
    default:             return '';
  }
}

function renderElementHtml(el: ReceiptElement, data: ReceiptData): string {
  const style: string[] = [];
  if (el.align === 'center') style.push('text-align:center');
  else if (el.align === 'right') style.push('text-align:right');
  if (el.bold) style.push('font-weight:bold');
  if (el.fontSize === 'large') style.push('font-size:16px');
  const styleAttr = style.length ? ` style="${style.join(';')}"` : '';

  switch (el.type) {
    case 'variable': {
      const value = el.override || resolveVariable(el.variable ?? '', data);
      if (!value) return '';
      const text = esc(el.prefix ?? '') + esc(value);
      return `<div${styleAttr}>${text}</div>`;
    }
    case 'text':
      return el.content ? `<div${styleAttr}>${esc(el.content)}</div>` : '';
    case 'separator':
      return '<div style="border-top:1px dashed #999;margin:4px 0"></div>';
    case 'items':
      return data.items.map((item) =>
        `<div style="margin:4px 0">` +
          `<div style="font-weight:bold;text-transform:uppercase">${esc(item.name)}</div>` +
          (item.note ? `<div style="font-size:11px;color:#444">(${esc(item.note)})</div>` : '') +
          `<div style="font-size:11px">${item.quantity} x ${fmtMoney(item.price)} = ${fmtMoney(item.subtotal)}</div>` +
        `</div>` +
        `<div style="border-top:1px dashed #ccc;margin:3px 0"></div>`
      ).join('');
    case 'total': {
      const totalStyle = [...style, 'display:flex', 'justify-content:space-between'].join(';');
      return `<div style="${totalStyle}"><span>Tổng:</span><span>${fmtMoney(data.totalAmount)}</span></div>`;
    }
    default:
      return '';
  }
}

function buildReceiptHtml(template: ReceiptTemplate, data: ReceiptData): string {
  const bodyHtml = template.elements.map((el) => renderElementHtml(el, data)).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @media print {
      @page { size: 80mm auto; margin: 0; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      width: 80mm;
      padding: 4mm;
      color: #000;
      line-height: 1.15;
    }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function fmtMoney(v: number): string {
  return Number(v).toLocaleString('vi-VN') + ' đ';
}

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
