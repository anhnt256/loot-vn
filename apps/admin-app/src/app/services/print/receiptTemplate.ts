/**
 * Receipt template data model and storage.
 *
 * A template is an ordered list of ReceiptElements that define what
 * appears on the printed bill.  The visual editor manipulates this
 * list; the print pipeline renders it against live ReceiptData.
 */

/* ─── types ─── */

export type ElementType = 'text' | 'variable' | 'separator' | 'items' | 'total';
export type Align = 'left' | 'center' | 'right';
export type FontSize = 'normal' | 'large';

export interface ReceiptElement {
  id: string;
  type: ElementType;
  /** Static text (type === 'text') */
  content?: string;
  /** Variable key (type === 'variable') */
  variable?: string;
  /** Text printed before the variable value, e.g. "NV  : " */
  prefix?: string;
  /** Hardcoded override — if set, uses this value instead of server data */
  override?: string;
  align: Align;
  bold: boolean;
  fontSize: FontSize;
}

export interface ReceiptTemplate {
  elements: ReceiptElement[];
  autoCut: boolean;
  copies: number;
}

/* ─── available variable tags (palette) ─── */

export interface VariableTag {
  key: string;
  label: string;
  /** Sample value shown in the preview */
  sample: string;
}

export const VARIABLE_TAGS: VariableTag[] = [
  { key: 'storeName',    label: 'Tên cửa hàng',   sample: 'Hi Friends Gaming 104 Tô Hiệu' },
  { key: 'storeAddress', label: 'Địa chỉ',         sample: '104 Tô Hiệu' },
  { key: 'dateTime',     label: 'Thời gian',        sample: '10:35, 06/04/2026' },
  { key: 'staffName',    label: 'Nhân viên ca',     sample: 'Ca Sáng' },
  { key: 'machineName',  label: 'Tên máy',          sample: 'STREAM-47' },
  { key: 'customerName', label: 'Khách hàng',       sample: '---' },
  { key: 'orderId',      label: 'Mã đơn hàng',     sample: '#1234' },
];

/* ─── default template (matches sample bill photo) ─── */

let _nextId = 1;
export function uid(): string {
  return `el-${Date.now()}-${_nextId++}`;
}

export const DEFAULT_TEMPLATE: ReceiptTemplate = {
  elements: [
    { id: uid(), type: 'variable', variable: 'storeName',    align: 'center', bold: true,  fontSize: 'large' },
    { id: uid(), type: 'variable', variable: 'storeAddress', align: 'center', bold: false, fontSize: 'normal' },
    { id: uid(), type: 'separator',                           align: 'left',   bold: false, fontSize: 'normal' },
    { id: uid(), type: 'variable', variable: 'dateTime',     prefix: 'TG  : ',  align: 'left', bold: false, fontSize: 'normal' },
    { id: uid(), type: 'variable', variable: 'staffName',    prefix: 'NV  : ',  align: 'left', bold: false, fontSize: 'normal' },
    { id: uid(), type: 'variable', variable: 'machineName',  prefix: 'MÁY : ',  align: 'left', bold: false, fontSize: 'normal' },
    { id: uid(), type: 'variable', variable: 'customerName', prefix: 'KH  : ',  align: 'left', bold: false, fontSize: 'normal' },
    { id: uid(), type: 'separator',                           align: 'left',   bold: false, fontSize: 'normal' },
    { id: uid(), type: 'text',     content: 'CHI TIẾT',      align: 'left',   bold: true,  fontSize: 'normal' },
    { id: uid(), type: 'items',                               align: 'left',   bold: false, fontSize: 'normal' },
    { id: uid(), type: 'total',                               align: 'left',   bold: true,  fontSize: 'large' },
    { id: uid(), type: 'separator',                           align: 'left',   bold: false, fontSize: 'normal' },
    { id: uid(), type: 'text',     content: 'Cảm ơn quý khách!', align: 'center', bold: false, fontSize: 'normal' },
  ],
  autoCut: true,
  copies: 1,
};

/* ─── sample items for preview ─── */

export const SAMPLE_ITEMS = [
  { name: 'MỲ INDOMIE TRỘN RAU', note: 'ko rau ko cay', quantity: 1, price: 20000, subtotal: 20000 },
  { name: 'MỲ INDOMIE THÊM',     note: null,              quantity: 1, price: 11000, subtotal: 11000 },
];
export const SAMPLE_TOTAL = 31000;

/* ─── persistence (localStorage) ─── */

const STORAGE_KEY = 'loot_print_template_v2';

export function loadTemplate(): ReceiptTemplate {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.elements?.length) return parsed;
    }
  } catch { /* ignore */ }
  return structuredClone(DEFAULT_TEMPLATE);
}

export function saveTemplate(template: ReceiptTemplate): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
}
