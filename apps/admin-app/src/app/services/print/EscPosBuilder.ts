/**
 * ESC/POS command builder for 80mm thermal printers (XP-80C compatible).
 * Builds a byte array of ESC/POS commands that can be sent to the printer.
 *
 * 80mm paper ≈ 48 characters per line (Font A, normal size)
 */

import type { ReceiptTemplate, ReceiptElement } from './receiptTemplate';

const CHARS_PER_LINE = 48;

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const CMD = {
  INIT: [ESC, 0x40], // Initialize printer
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  FONT_NORMAL: [GS, 0x21, 0x00],
  FONT_DOUBLE_HEIGHT: [GS, 0x21, 0x01],
  FONT_DOUBLE_WIDTH: [GS, 0x21, 0x10],
  FONT_DOUBLE: [GS, 0x21, 0x11], // double width + height
  UNDERLINE_ON: [ESC, 0x2d, 0x01],
  UNDERLINE_OFF: [ESC, 0x2d, 0x00],
  CUT_PAPER: [GS, 0x56, 0x01], // Partial cut
  FEED_LINES: (n: number) => [ESC, 0x64, n],
} as const;

export class EscPosBuilder {
  private buffer: number[] = [];

  init(): this {
    this.buffer.push(...CMD.INIT);
    return this;
  }

  alignLeft(): this {
    this.buffer.push(...CMD.ALIGN_LEFT);
    return this;
  }

  alignCenter(): this {
    this.buffer.push(...CMD.ALIGN_CENTER);
    return this;
  }

  alignRight(): this {
    this.buffer.push(...CMD.ALIGN_RIGHT);
    return this;
  }

  bold(on = true): this {
    this.buffer.push(...(on ? CMD.BOLD_ON : CMD.BOLD_OFF));
    return this;
  }

  fontNormal(): this {
    this.buffer.push(...CMD.FONT_NORMAL);
    return this;
  }

  fontDouble(): this {
    this.buffer.push(...CMD.FONT_DOUBLE);
    return this;
  }

  fontDoubleHeight(): this {
    this.buffer.push(...CMD.FONT_DOUBLE_HEIGHT);
    return this;
  }

  underline(on = true): this {
    this.buffer.push(...(on ? CMD.UNDERLINE_ON : CMD.UNDERLINE_OFF));
    return this;
  }

  text(str: string): this {
    const encoder = new TextEncoder();
    // ESC/POS printers typically use CP437 or similar, but UTF-8 works for Vietnamese on XP-80C
    this.buffer.push(...encoder.encode(str));
    return this;
  }

  line(str = ''): this {
    if (str) this.text(str);
    this.buffer.push(LF);
    return this;
  }

  emptyLine(): this {
    this.buffer.push(LF);
    return this;
  }

  /** Print a dashed separator line */
  separator(char = '-'): this {
    this.text(char.repeat(CHARS_PER_LINE));
    this.buffer.push(LF);
    return this;
  }

  /** Print a dotted separator */
  dottedSeparator(): this {
    this.text('- '.repeat(CHARS_PER_LINE / 2));
    this.buffer.push(LF);
    return this;
  }

  /**
   * Print two columns: left-aligned text and right-aligned text on the same line.
   * E.g. "TG  : 10:35"  or  "Tổng:          31.000 đ"
   */
  columns(left: string, right: string, totalWidth = CHARS_PER_LINE): this {
    const space = totalWidth - left.length - right.length;
    const line = left + (space > 0 ? ' '.repeat(space) : ' ') + right;
    return this.line(line);
  }

  /**
   * Print a three-column row for item details.
   * E.g. "qty x price đ        = subtotal đ"
   */
  threeColumns(left: string, center: string, right: string, totalWidth = CHARS_PER_LINE): this {
    const centerStart = Math.floor(totalWidth * 0.5);
    const rightStart = totalWidth - right.length;

    let line = left;
    while (line.length < centerStart) line += ' ';
    line += center;
    while (line.length < rightStart) line += ' ';
    line += right;

    return this.line(line.substring(0, totalWidth));
  }

  feedLines(n: number): this {
    this.buffer.push(...CMD.FEED_LINES(n));
    return this;
  }

  cut(): this {
    this.feedLines(3);
    this.buffer.push(...CMD.CUT_PAPER);
    return this;
  }

  build(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/* ─── Receipt data types ─── */

export interface ReceiptItem {
  name: string;
  note?: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ReceiptData {
  storeName: string;
  storeAddress?: string;
  dateTime: string;
  staffName: string;
  machineName: string;
  customerName?: string;
  orderId?: number | string;
  items: ReceiptItem[];
  totalAmount: number;
  footerLine1?: string;
  footerLine2?: string;
}

/**
 * Resolve a variable key to its value from ReceiptData.
 */
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

/**
 * Build ESC/POS byte array from a visual template + live data.
 */
export function buildReceiptFromTemplate(template: ReceiptTemplate, data: ReceiptData): Uint8Array {
  const b = new EscPosBuilder();
  b.init();

  for (const el of template.elements) {
    applyAlign(b, el);

    switch (el.type) {
      case 'variable': {
        const value = el.override || resolveVariable(el.variable ?? '', data);
        if (!value) break; // skip empty variables
        const text = (el.prefix ?? '') + value;
        applyStyle(b, el);
        b.line(text);
        resetStyle(b, el);
        break;
      }
      case 'text': {
        const content = el.content ?? '';
        if (!content) break;
        applyStyle(b, el);
        b.line(content);
        resetStyle(b, el);
        break;
      }
      case 'separator':
        b.dottedSeparator();
        break;
      case 'items':
        for (const item of data.items) {
          b.bold().line(item.name.toUpperCase()).bold(false);
          if (item.note) b.line(`(${item.note})`);
          b.line(`${item.quantity} x ${fmtMoney(item.price)} = ${fmtMoney(item.subtotal)}`);
          b.dottedSeparator();
        }
        break;
      case 'total':
        applyStyle(b, el);
        b.columns('Tổng:', fmtMoney(data.totalAmount));
        resetStyle(b, el);
        break;
    }
  }

  if (template.autoCut) {
    b.cut();
  } else {
    b.feedLines(4);
  }

  return b.build();
}

function applyAlign(b: EscPosBuilder, el: ReceiptElement) {
  if (el.align === 'center') b.alignCenter();
  else if (el.align === 'right') b.alignRight();
  else b.alignLeft();
}

function applyStyle(b: EscPosBuilder, el: ReceiptElement) {
  if (el.bold) b.bold();
  if (el.fontSize === 'large') b.fontDoubleHeight();
}

function resetStyle(b: EscPosBuilder, el: ReceiptElement) {
  if (el.bold) b.bold(false);
  if (el.fontSize === 'large') b.fontNormal();
}

/**
 * Legacy: Build ESC/POS with hardcoded layout (kept for backward compatibility).
 */
export function buildReceipt(data: ReceiptData): Uint8Array {
  // Import default template dynamically to avoid circular deps at module level
  const { DEFAULT_TEMPLATE } = require('./receiptTemplate');
  return buildReceiptFromTemplate(DEFAULT_TEMPLATE, data);
}

function fmtMoney(v: number): string {
  return `${Number(v).toLocaleString('vi-VN')  } d`;
}
