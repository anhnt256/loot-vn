import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, App, InputNumber, Switch, Tooltip, Input, Select } from 'antd';
import {
  SaveOutlined, UndoOutlined, DeleteOutlined,
  AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined,
  BoldOutlined, HolderOutlined, MinusOutlined,
  ArrowUpOutlined, ArrowDownOutlined, PrinterOutlined,
} from '@ant-design/icons';

import { printReceipt } from '../../services/print';
import type { ReceiptData } from '../../services/print';
import {
  loadTemplate, saveTemplate, uid,
  DEFAULT_TEMPLATE, VARIABLE_TAGS, SAMPLE_ITEMS, SAMPLE_TOTAL,
  type ReceiptTemplate, type ReceiptElement, type Align, type FontSize,
} from '../../services/print/receiptTemplate';

/* ─── helpers ─── */

function getTagLabel(key: string): string {
  return VARIABLE_TAGS.find((t) => t.key === key)?.label ?? key;
}

function getTagSample(key: string): string {
  return VARIABLE_TAGS.find((t) => t.key === key)?.sample ?? `{${key}}`;
}

function fmtMoney(v: number): string {
  return `${Number(v).toLocaleString('vi-VN')  } đ`;
}

/* ─── main component ─── */

const TemplateEditor: React.FC = () => {
  const { notification } = App.useApp();
  const [template, setTemplate] = useState<ReceiptTemplate>(loadTemplate);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const editInputRef = useRef<any>(null);

  const selected = template.elements.find((e) => e.id === selectedId) ?? null;

  const updateElements = useCallback((fn: (els: ReceiptElement[]) => ReceiptElement[]) => {
    setTemplate((prev) => ({ ...prev, elements: fn(prev.elements) }));
    setDirty(true);
  }, []);

  const updateElement = useCallback((id: string, patch: Partial<ReceiptElement>) => {
    updateElements((els) => els.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, [updateElements]);

  const deleteElement = useCallback((id: string) => {
    updateElements((els) => els.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [updateElements, selectedId]);

  const insertElement = useCallback((el: ReceiptElement, atIndex: number) => {
    updateElements((els) => {
      const next = [...els];
      next.splice(atIndex, 0, el);
      return next;
    });
    setSelectedId(el.id);
  }, [updateElements]);

  const moveElement = useCallback((id: string, direction: 'up' | 'down') => {
    updateElements((els) => {
      const idx = els.findIndex((e) => e.id === id);
      if (idx === -1) return els;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= els.length) return els;
      const next = [...els];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  }, [updateElements]);

  const selectedIndex = selected ? template.elements.findIndex((e) => e.id === selected.id) : -1;
  const canMoveUp = selectedIndex > 0;
  const canMoveDown = selectedIndex >= 0 && selectedIndex < template.elements.length - 1;

  /* ─── drag & drop ─── */

  const handleDragStartPalette = (e: React.DragEvent, type: string, data?: string) => {
    e.dataTransfer.setData('source', 'palette');
    e.dataTransfer.setData('type', type);
    if (data) e.dataTransfer.setData('data', data);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragStartElement = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('source', 'canvas');
    e.dataTransfer.setData('elementId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = e.dataTransfer.getData('source') === 'canvas' ? 'move' : 'copy';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const source = e.dataTransfer.getData('source');

    if (source === 'palette') {
      const type = e.dataTransfer.getData('type');
      const data = e.dataTransfer.getData('data');
      let newEl: ReceiptElement;
      if (type === 'variable') {
        newEl = { id: uid(), type: 'variable', variable: data, align: 'left', bold: false, fontSize: 'normal' };
      } else if (type === 'separator') {
        newEl = { id: uid(), type: 'separator', align: 'left', bold: false, fontSize: 'normal' };
      } else if (type === 'text') {
        newEl = { id: uid(), type: 'text', content: 'Nội dung mới', align: 'left', bold: false, fontSize: 'normal' };
      } else if (type === 'items') {
        newEl = { id: uid(), type: 'items', align: 'left', bold: false, fontSize: 'normal' };
      } else if (type === 'total') {
        newEl = { id: uid(), type: 'total', align: 'left', bold: true, fontSize: 'large' };
      } else return;
      insertElement(newEl, index);
    } else if (source === 'canvas') {
      const elementId = e.dataTransfer.getData('elementId');
      updateElements((els) => {
        const fromIndex = els.findIndex((e) => e.id === elementId);
        if (fromIndex === -1) return els;
        const item = els[fromIndex];
        const without = els.filter((_, i) => i !== fromIndex);
        const adjustedIndex = index > fromIndex ? index - 1 : index;
        without.splice(adjustedIndex, 0, item);
        return without;
      });
    }
  };

  const handleSave = () => {
    saveTemplate(template);
    setDirty(false);
    notification.success({ message: 'Đã lưu mẫu in thành công!', placement: 'topRight' });
  };

  const handleReset = () => {
    setTemplate(structuredClone(DEFAULT_TEMPLATE));
    setSelectedId(null);
    setDirty(true);
  };

  const [testPrinting, setTestPrinting] = useState(false);
  const handleTestPrint = async () => {
    // Lưu template trước khi in thử để PrintService đọc được bản mới nhất
    saveTemplate(template);
    setDirty(false);
    setTestPrinting(true);
    try {
      const testData: ReceiptData = {
        storeName: 'Hi Friends Gaming 104 Tô Hiệu',
        storeAddress: '104 Tô Hiệu',
        dateTime: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
        staffName: 'Ca Sáng',
        machineName: 'STREAM-47',
        customerName: undefined,
        orderId: 9999,
        items: SAMPLE_ITEMS.map((i) => ({ ...i, note: i.note ?? undefined })),
        totalAmount: SAMPLE_TOTAL,
      };
      await printReceipt(testData);
      notification.success({ message: 'In thử thành công!', placement: 'topRight' });
    } catch (err: any) {
      notification.error({
        message: 'In thử thất bại',
        description: err.message,
        placement: 'topRight',
      });
    } finally {
      setTestPrinting(false);
    }
  };

  // Click outside deselects
  const canvasRef = useRef<HTMLDivElement>(null);
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('receipt-paper')) {
      setSelectedId(null);
    }
  };

  // Double-click to edit text
  const handleDoubleClick = (el: ReceiptElement) => {
    if (el.type === 'text' || el.type === 'variable') {
      setEditingId(el.id);
    }
  };

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId && !editingId) {
        const el = template.elements.find((x) => x.id === selectedId);
        if (el && el.type !== 'items' && el.type !== 'total') {
          deleteElement(selectedId);
        }
      }
      if (e.key === 'Escape') {
        setEditingId(null);
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, editingId, template.elements, deleteElement]);

  /* ─── render element on canvas ─── */

  const renderElement = (el: ReceiptElement, index: number) => {
    const isSelected = selectedId === el.id;
    const isEditing = editingId === el.id;
    const isDropTarget = dragOverIndex === index;

    const alignStyle: React.CSSProperties = {
      textAlign: el.align,
      fontWeight: el.bold ? 'bold' : 'normal',
      fontSize: el.fontSize === 'large' ? 15 : 12,
    };

    let content: React.ReactNode;

    switch (el.type) {
      case 'variable': {
        const display = el.override || getTagSample(el.variable ?? '');
        content = <span>{el.prefix ?? ''}{display}</span>;
        break;
      }
      case 'text': {
        if (isEditing) {
          content = (
            <Input
              ref={editInputRef}
              size="small"
              value={el.content ?? ''}
              onChange={(e) => updateElement(el.id, { content: e.target.value })}
              onPressEnter={() => setEditingId(null)}
              onBlur={() => setEditingId(null)}
              style={{ width: '100%', fontSize: el.fontSize === 'large' ? 14 : 12 }}
            />
          );
        } else {
          content = <span>{el.content || '(nhấp đôi để nhập nội dung)'}</span>;
        }
        break;
      }
      case 'separator':
        content = (
          <div style={{ borderTop: '1px dashed #999', margin: '2px 0', width: '100%' }} />
        );
        break;
      case 'items':
        content = (
          <div style={{ width: '100%' }}>
            {SAMPLE_ITEMS.map((item, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: 11 }}>{item.name}</div>
                {item.note && <div style={{ fontSize: 10, color: '#666' }}>({item.note})</div>}
                <div style={{ fontSize: 11 }}>{item.quantity} x {fmtMoney(item.price)} = {fmtMoney(item.subtotal)}</div>
                {i < SAMPLE_ITEMS.length - 1 && (
                  <div style={{ borderTop: '1px dashed #ccc', margin: '3px 0' }} />
                )}
              </div>
            ))}
          </div>
        );
        break;
      case 'total':
        content = (
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span>Tổng:</span>
            <span>{fmtMoney(SAMPLE_TOTAL)}</span>
          </div>
        );
        break;
    }

    return (
      <React.Fragment key={el.id}>
        {/* Drop indicator */}
        {isDropTarget && (
          <div style={{ height: 3, background: '#3b82f6', borderRadius: 2, margin: '2px 0' }} />
        )}
        <div
          draggable={!isEditing}
          onDragStart={(e) => handleDragStartElement(e, el.id)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
          onDoubleClick={() => handleDoubleClick(el)}
          style={{
            ...alignStyle,
            position: 'relative',
            padding: '1px 6px',
            cursor: isEditing ? 'text' : 'grab',
            border: isSelected ? '1.5px solid #3b82f6' : '1.5px solid transparent',
            borderRadius: 3,
            background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
            transition: 'border-color 0.15s, background 0.15s',
            minHeight: el.type === 'separator' ? 8 : 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: el.align === 'center' ? 'center' : el.align === 'right' ? 'flex-end' : 'flex-start',
          }}
          className="receipt-element"
        >
          {/* Nút di chuyển lên/xuống (hiện khi chọn) */}
          {isSelected && !isEditing && (
            <div style={{
              position: 'absolute', left: -32, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', flexDirection: 'column', gap: 1,
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); moveElement(el.id, 'up'); }}
                disabled={index === 0}
                style={{
                  background: index === 0 ? '#374151' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 3,
                  width: 20, height: 16, fontSize: 9, cursor: index === 0 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: index === 0 ? 0.3 : 1,
                }}
              >
                <ArrowUpOutlined />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); moveElement(el.id, 'down'); }}
                disabled={index === template.elements.length - 1}
                style={{
                  background: index === template.elements.length - 1 ? '#374151' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 3,
                  width: 20, height: 16, fontSize: 9, cursor: index === template.elements.length - 1 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: index === template.elements.length - 1 ? 0.3 : 1,
                }}
              >
                <ArrowDownOutlined />
              </button>
            </div>
          )}

          {content}

          {/* Nút xoá */}
          {isSelected && !isEditing && el.type !== 'items' && el.type !== 'total' && (
            <button
              onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
              style={{
                position: 'absolute', right: -24, top: '50%', transform: 'translateY(-50%)',
                background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%',
                width: 18, height: 18, fontSize: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <DeleteOutlined />
            </button>
          )}
        </div>
      </React.Fragment>
    );
  };

  /* ─── last drop zone (append to end) ─── */

  const lastIndex = template.elements.length;

  return (
    <div className="flex gap-4" style={{ minHeight: 600 }}>
      {/* ═══ CỘT TRÁI: Dữ liệu có sẵn ═══ */}
      <div className="w-52 shrink-0 space-y-3">
        <div
          className="rounded-lg border p-3"
          style={{ background: '#1f2937', borderColor: '#374151' }}
        >
          <div className="text-xs font-bold text-gray-400 tracking-wider mb-3">DỮ LIỆU CÓ SẴN</div>

          {/* Biến hệ thống */}
          <div className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Biến hệ thống</div>
          <div className="flex flex-col gap-1.5 mb-4">
            {VARIABLE_TAGS.map((tag) => (
              <Tooltip key={tag.key} title={`Dữ liệu mẫu: "${tag.sample}"`} placement="right">
                <div
                  draggable
                  onDragStart={(e) => handleDragStartPalette(e, 'variable', tag.key)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded cursor-grab border text-xs"
                  style={{ background: '#111827', borderColor: '#374151' }}
                >
                  <HolderOutlined style={{ color: '#4b5563', fontSize: 10 }} />
                  <div className="flex flex-col leading-tight">
                    <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: 11 }}>{`{${tag.key}}`}</span>
                    <span style={{ color: '#9ca3af', fontSize: 10 }}>{tag.label}</span>
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>

          {/* Thành phần bố cục */}
          <div className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Thành phần</div>
          <div className="flex flex-col gap-1.5 mb-4">
            <div
              draggable
              onDragStart={(e) => handleDragStartPalette(e, 'text')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded cursor-grab border text-xs"
              style={{ background: '#111827', borderColor: '#374151', color: '#a78bfa' }}
            >
              <HolderOutlined style={{ color: '#4b5563', fontSize: 10 }} />
              <span>Aa Văn bản / Nhãn</span>
            </div>
            <div
              draggable
              onDragStart={(e) => handleDragStartPalette(e, 'separator')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded cursor-grab border text-xs"
              style={{ background: '#111827', borderColor: '#374151', color: '#fbbf24' }}
            >
              <HolderOutlined style={{ color: '#4b5563', fontSize: 10 }} />
              <MinusOutlined /> <span>Đường kẻ ngang</span>
            </div>
            <div
              draggable
              onDragStart={(e) => handleDragStartPalette(e, 'items')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded cursor-grab border text-xs"
              style={{ background: '#111827', borderColor: '#374151', color: '#34d399' }}
            >
              <HolderOutlined style={{ color: '#4b5563', fontSize: 10 }} />
              <span>Bảng chi tiết đơn</span>
            </div>
            <div
              draggable
              onDragStart={(e) => handleDragStartPalette(e, 'total')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded cursor-grab border text-xs"
              style={{ background: '#111827', borderColor: '#374151', color: '#f87171' }}
            >
              <HolderOutlined style={{ color: '#4b5563', fontSize: 10 }} />
              <span>Dòng tổng tiền</span>
            </div>
          </div>
        </div>

        {/* Cài đặt in */}
        <div
          className="rounded-lg border p-3"
          style={{ background: '#1f2937', borderColor: '#374151' }}
        >
          <div className="text-xs font-bold text-gray-400 tracking-wider mb-3">CÀI ĐẶT IN</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-xs">Tự động cắt giấy</span>
              <Switch
                size="small"
                checked={template.autoCut}
                onChange={(v) => { setTemplate((t) => ({ ...t, autoCut: v })); setDirty(true); }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-xs">Số bản in</span>
              <InputNumber
                size="small"
                min={1} max={5}
                value={template.copies}
                onChange={(v) => { setTemplate((t) => ({ ...t, copies: v ?? 1 })); setDirty(true); }}
                style={{ width: 60 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ GIỮA: Hoá đơn mẫu ═══ */}
      <div className="flex-1 flex flex-col items-center overflow-auto">
        {/* Thanh công cụ */}
        <div className="flex items-center gap-2 mb-4 w-full">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!dirty}
            style={dirty ? { background: '#22c55e', borderColor: '#22c55e' } : {}}
          >
            Lưu mẫu in
          </Button>
          <Button icon={<UndoOutlined />} onClick={handleReset}>
            Khôi phục mặc định
          </Button>
          <div className="flex-1" />
          <Button
            icon={<PrinterOutlined />}
            onClick={handleTestPrint}
            loading={testPrinting}
          >
            In thử
          </Button>
        </div>

        {/* Giấy hoá đơn */}
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            background: '#374151',
            borderRadius: 8,
            padding: '24px 40px',
            width: '100%',
            maxWidth: 480,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            className="receipt-paper"
            style={{
              background: '#ffffff',
              color: '#000000',
              width: 300,
              padding: '12px 12px 16px',
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 12,
              lineHeight: 1.15,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              borderRadius: '2px 2px 0 0',
              position: 'relative',
            }}
            onDragOver={(e) => handleDragOver(e, lastIndex)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, lastIndex)}
          >
            {template.elements.map((el, i) => renderElement(el, i))}

            {/* Vùng thả cuối cùng */}
            {dragOverIndex === lastIndex && (
              <div style={{ height: 3, background: '#3b82f6', borderRadius: 2, margin: '4px 0' }} />
            )}

            {template.elements.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: 11 }}>
                Kéo thả các thành phần từ cột bên trái vào đây
              </div>
            )}

            {/* Mép giấy xé */}
            <div style={{
              position: 'absolute', bottom: -8, left: 0, right: 0, height: 8,
              background: 'linear-gradient(135deg, #fff 33.33%, transparent 33.33%) 0 0, linear-gradient(225deg, #fff 33.33%, transparent 33.33%) 0 0',
              backgroundSize: '8px 8px',
              backgroundRepeat: 'repeat-x',
            }} />
          </div>
        </div>
      </div>

      {/* ═══ CỘT PHẢI: Thuộc tính ═══ */}
      <div className="w-56 shrink-0">
        <div
          className="rounded-lg border p-3 sticky top-4"
          style={{ background: '#1f2937', borderColor: '#374151' }}
        >
          <div className="text-xs font-bold text-gray-400 tracking-wider mb-3">THUỘC TÍNH</div>

          {selected ? (
            <div className="space-y-4">
              {/* Loại */}
              <div>
                <span className="text-[10px] text-gray-500 uppercase">Loại</span>
                <div className="text-sm text-white font-medium mt-0.5">
                  {selected.type === 'variable' && `Biến: {${selected.variable}}`}
                  {selected.type === 'text' && 'Văn bản / Nhãn'}
                  {selected.type === 'separator' && 'Đường kẻ ngang'}
                  {selected.type === 'items' && 'Bảng chi tiết đơn'}
                  {selected.type === 'total' && 'Dòng tổng tiền'}
                </div>
              </div>

              {/* Căn lề */}
              {selected.type !== 'separator' && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block mb-1">Căn lề</span>
                  <div className="flex gap-1">
                    {([['left', <AlignLeftOutlined />], ['center', <AlignCenterOutlined />], ['right', <AlignRightOutlined />]] as [Align, React.ReactNode][]).map(([a, icon]) => (
                      <Button
                        key={a}
                        size="small"
                        type={selected.align === a ? 'primary' : 'default'}
                        icon={icon}
                        onClick={() => updateElement(selected.id, { align: a })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* In đậm */}
              {selected.type !== 'separator' && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block mb-1">In đậm</span>
                  <Button
                    size="small"
                    type={selected.bold ? 'primary' : 'default'}
                    icon={<BoldOutlined />}
                    onClick={() => updateElement(selected.id, { bold: !selected.bold })}
                  />
                </div>
              )}

              {/* Cỡ chữ */}
              {selected.type !== 'separator' && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block mb-1">Cỡ chữ</span>
                  <div className="flex gap-1">
                    {([['normal', 'Thường'], ['large', 'Lớn']] as [FontSize, string][]).map(([s, label]) => (
                      <Button
                        key={s}
                        size="small"
                        type={selected.fontSize === s ? 'primary' : 'default'}
                        onClick={() => updateElement(selected.id, { fontSize: s })}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nguồn dữ liệu */}
              {selected.type === 'variable' && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block mb-1">Nguồn dữ liệu</span>
                  <Select
                    size="small"
                    value={selected.variable}
                    onChange={(v) => updateElement(selected.id, { variable: v, override: '' })}
                    style={{ width: '100%' }}
                    options={VARIABLE_TAGS.map((t) => ({
                      value: t.key,
                      label: <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{`{${t.key}}`} <span style={{ color: '#9ca3af', fontFamily: 'inherit' }}>— {t.label}</span></span>,
                    }))}
                  />
                </div>
              )}

              {/* Giá trị tuỳ chỉnh (hardcode) */}
              {selected.type === 'variable' && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block mb-1">Giá trị tuỳ chỉnh</span>
                  <Input
                    size="small"
                    value={selected.override ?? ''}
                    onChange={(e) => updateElement(selected.id, { override: e.target.value })}
                    placeholder="Để trống = lấy từ hệ thống"
                    allowClear
                  />
                  <span className="text-[10px] text-gray-600 mt-0.5 block">
                    {selected.override
                      ? 'Luôn in giá trị này'
                      : `Tự động lấy từ server (${getTagLabel(selected.variable ?? '')})`}
                  </span>
                </div>
              )}

              {/* Tiền tố */}
              {selected.type === 'variable' && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block mb-1">Tiền tố (prefix)</span>
                  <Input
                    size="small"
                    value={selected.prefix ?? ''}
                    onChange={(e) => updateElement(selected.id, { prefix: e.target.value })}
                    placeholder='VD: "NV  : "'
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              )}

              {/* Nội dung (cho text) */}
              {selected.type === 'text' && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block mb-1">Nội dung</span>
                  <Input
                    size="small"
                    value={selected.content ?? ''}
                    onChange={(e) => updateElement(selected.id, { content: e.target.value })}
                    placeholder="Nhập nội dung..."
                  />
                </div>
              )}

              {/* Di chuyển */}
              <div>
                <span className="text-[10px] text-gray-500 uppercase block mb-1">Di chuyển</span>
                <div className="flex gap-1">
                  <Button
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={!canMoveUp}
                    onClick={() => moveElement(selected.id, 'up')}
                  >
                    Lên
                  </Button>
                  <Button
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={!canMoveDown}
                    onClick={() => moveElement(selected.id, 'down')}
                  >
                    Xuống
                  </Button>
                </div>
              </div>

              {/* Xoá */}
              {selected.type !== 'items' && selected.type !== 'total' && (
                <div className="pt-2 border-t border-gray-700">
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteElement(selected.id)}
                    block
                  >
                    Xoá
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-xs text-center py-8">
              Nhấp chọn 1 thành phần trên hoá đơn để chỉnh sửa thuộc tính
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
