import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import { message } from 'antd';

/* ─── Types ─── */
interface CategoryConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
  placeholder: string;
}

interface CategoryData {
  id: string;
  name: string;
  rating: number;
  selected: boolean;
  note: string;
}

interface FeedbackItem {
  id: number;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string | null;
  rating: number;
  image: string | null;
  computerId: number | null;
  createdAt: string;
  updatedAt: string;
}

/* ─── Constants ─── */
const feedbackCategories: CategoryConfig[] = [
  { id: 'space', name: 'Không gian', color: 'bg-blue-600', icon: '🏢', placeholder: 'Mô tả vấn đề về không gian (ví dụ: ánh sáng, nhiệt độ, tiếng ồn...)' },
  { id: 'food', name: 'Đồ ăn / Thức uống', color: 'bg-green-600', icon: '🍽️', placeholder: 'Ghi rõ tên món ăn/thức uống và vấn đề gặp phải...' },
  { id: 'machines', name: 'Máy móc', color: 'bg-purple-600', icon: '⚙️', placeholder: 'Mô tả máy móc nào và tình trạng cụ thể...' },
  { id: 'staff', name: 'Nhân viên', color: 'bg-orange-600', icon: '👥', placeholder: 'Ghi rõ tên nhân viên và vấn đề gặp phải...' },
  { id: 'cleanliness', name: 'Vệ sinh', color: 'bg-red-600', icon: '🧹', placeholder: 'Mô tả vấn đề vệ sinh cụ thể và vị trí...' },
];

const deviceItems = [
  { id: 'monitor', name: 'Màn hình', field: 'monitorStatus', icon: '🖥️' },
  { id: 'keyboard', name: 'Bàn phím', field: 'keyboardStatus', icon: '⌨️' },
  { id: 'mouse', name: 'Chuột', field: 'mouseStatus', icon: '🖱️' },
  { id: 'headphone', name: 'Tai nghe', field: 'headphoneStatus', icon: '🎧' },
  { id: 'chair', name: 'Ghế', field: 'chairStatus', icon: '💺' },
  { id: 'network', name: 'Mạng', field: 'networkStatus', icon: '📶' },
];

const deviceStatusOptions = [
  { value: 'GOOD', label: 'Hoạt động tốt', color: 'text-blue-400', bgColor: 'bg-blue-900/40', borderColor: 'border-blue-500' },
  { value: 'DAMAGED_BUT_USABLE', label: 'Hỏng nhưng có thể sử dụng', color: 'text-yellow-400', bgColor: 'bg-yellow-900/40', borderColor: 'border-yellow-500' },
  { value: 'COMPLETELY_DAMAGED', label: 'Hỏng hoàn toàn', color: 'text-red-400', bgColor: 'bg-red-900/40', borderColor: 'border-red-500' },
];

type DeviceStatus = Record<string, 'GOOD' | 'DAMAGED_BUT_USABLE' | 'COMPLETELY_DAMAGED'>;

const defaultDeviceStatus: DeviceStatus = {
  monitorStatus: 'GOOD', keyboardStatus: 'GOOD', mouseStatus: 'GOOD',
  headphoneStatus: 'GOOD', chairStatus: 'GOOD', networkStatus: 'GOOD',
};

/* ─── Helpers ─── */
const getRatingText = (r: number) => ['Chọn mức đánh giá', 'Rất không hài lòng', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'][r] ?? 'Chọn mức đánh giá';
const getRatingColor = (r: number) => ['text-gray-400', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-blue-400', 'text-green-400'][r] ?? 'text-gray-400';

const getStatusLabel = (s: string) => ({ SUBMITTED: 'Đã gửi', RECEIVED: 'Đã nhận', PROCESSING: 'Đang xử lý', COMPLETED: 'Hoàn thành' }[s] ?? s);
const getStatusColor = (s: string) => ({ SUBMITTED: 'bg-gray-600 text-gray-200', RECEIVED: 'bg-blue-900/60 text-blue-300', PROCESSING: 'bg-yellow-900/60 text-yellow-300', COMPLETED: 'bg-green-900/60 text-green-300' }[s] ?? 'bg-gray-700 text-gray-300');
const getPriorityLabel = (p: string) => ({ HIGH: 'Cao', MEDIUM: 'Trung bình', LOW: 'Thấp' }[p] ?? p);
const getPriorityColor = (p: string) => ({ HIGH: 'bg-red-900/60 text-red-300', MEDIUM: 'bg-yellow-900/60 text-yellow-300', LOW: 'bg-green-900/60 text-green-300' }[p] ?? 'bg-gray-700 text-gray-300');

const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ─── Stars Component ─── */
const Stars: React.FC<{ rating: number; onChange: (r: number) => void }> = ({ rating, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)} className="cursor-pointer transition-transform hover:scale-110">
        <svg className={`h-7 w-7 ${star <= rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-600 hover:text-yellow-500'}`} viewBox="0 0 24 24" fill={star <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      </button>
    ))}
  </div>
);

/* ─── Main Component ─── */
const FeedbackPage: React.FC = () => {
  // Tab: 'create' or 'history'
  const [tab, setTab] = useState<'create' | 'history'>('create');

  /* ── Create Feedback State ── */
  const [activeCategory, setActiveCategory] = useState('');
  const [categories, setCategories] = useState<CategoryData[]>(() =>
    feedbackCategories.map((c) => ({ id: c.id, name: c.name, rating: 0, selected: false, note: '' }))
  );
  const [feedbackImages, setFeedbackImages] = useState<Record<string, string>>({});
  const [deviceFeedback, setDeviceFeedback] = useState<DeviceStatus>({ ...defaultDeviceStatus });
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image lightbox
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string }>({ isOpen: false, imageUrl: '' });

  /* ── History State ── */
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /* ── Computed ── */
  const selectedCategories = useMemo(() => categories.filter((c) => c.selected), [categories]);
  const activeCategoryData = useMemo(() => categories.find((c) => c.id === activeCategory), [categories, activeCategory]);
  const activeCategoryConfig = useMemo(() => feedbackCategories.find((c) => c.id === activeCategory), [activeCategory]);

  const isCategoryCompleted = useCallback((catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat || !cat.selected) return false;
    const hasImage = feedbackImages[catId]?.trim();
    if (hasImage) return cat.rating > 0 && cat.note.trim() !== '';
    return cat.rating > 0 && (cat.rating > 2 || cat.note.trim() !== '');
  }, [categories, feedbackImages]);

  /* ── Draft: auto-save & restore ── */
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const draftLoadedRef = useRef(false);

  const getFormSnapshot = useCallback(() => JSON.stringify({ categories, feedbackImages, deviceFeedback, activeCategory }), [categories, feedbackImages, deviceFeedback, activeCategory]);

  const hasFormData = useCallback(() => categories.some((c) => c.selected && (c.rating > 0 || c.note.trim())) ||
      Object.values(feedbackImages).some((v) => v?.trim()), [categories, feedbackImages]);

  // Load draft on mount
  useEffect(() => {
    if (draftLoadedRef.current) return;
    draftLoadedRef.current = true;
    apiClient.get('/feedback/draft').then((res) => {
      const draft = res.data;
      if (!draft?.description) return;
      try {
        const saved = JSON.parse(draft.description);
        if (saved.categories) setCategories(saved.categories);
        if (saved.feedbackImages) setFeedbackImages(saved.feedbackImages);
        if (saved.deviceFeedback) setDeviceFeedback(saved.deviceFeedback);
        if (saved.activeCategory) setActiveCategory(saved.activeCategory);
      } catch { /* ignore parse errors */ }
    }).catch(() => { /* ignore load errors */ });
  }, []);

  // Auto-save draft on changes (debounced 2s)
  useEffect(() => {
    if (!draftLoadedRef.current) return;
    clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      if (hasFormData()) {
        apiClient.post('/feedback/draft', { formData: getFormSnapshot() }).catch(() => {});
      }
    }, 2000);
    return () => clearTimeout(draftTimerRef.current);
  }, [categories, feedbackImages, deviceFeedback, activeCategory, getFormSnapshot, hasFormData]);

  /* ── Fetch History ── */
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await apiClient.get('/feedback');
      setFeedbackList(res.data?.data || []);
    } catch {
      message.error('Không thể tải lịch sử feedback');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'history') fetchHistory();
  }, [tab, fetchHistory]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (imageModal.isOpen && e.key === 'Escape') {
        setImageModal({ isOpen: false, imageUrl: '' });
        return;
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (showSummary) handleSubmitFeedback();
        else handlePreview();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showSummary, imageModal.isOpen]);

  /* ── Category Actions ── */
  const toggleCategory = (id: string) => {
    setCategories((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;
      // If already selected and is the active one → deselect it
      if (target.selected && activeCategory === id) {
        const updated = prev.map((c) => (c.id === id ? { ...c, selected: false } : c));
        const firstSelected = updated.find((c) => c.selected);
        if (firstSelected) setActiveCategory(firstSelected.id);
        return updated;
      }
      // Otherwise → select it and make it active
      return prev.map((c) => (c.id === id ? { ...c, selected: true } : c));
    });
    setActiveCategory(id);
  };

  const updateRating = (id: string, rating: number) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, rating } : c)));
  };

  const updateNote = (id: string, note: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, note } : c)));
  };

  /* ── Image Handling ── */
  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> =>
    new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

  const handlePasteImage = async (e: React.ClipboardEvent<HTMLTextAreaElement>, categoryId: string) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) break;
        const hasAny = Object.values(feedbackImages).some((v) => v?.trim());
        if (hasAny) { message.error('Chỉ được gửi 1 ảnh duy nhất cho feedback'); return; }
        try {
          const compressed = await compressImage(file);
          setFeedbackImages((prev) => ({ ...prev, [categoryId]: compressed }));
          message.success('Đã thêm ảnh thành công');
        } catch { message.error('Có lỗi khi xử lý hình ảnh'); }
        e.preventDefault();
        break;
      }
    }
  };

  /* ── Validation & Submit ── */
  const handlePreview = () => {
    if (selectedCategories.length === 0) { message.error('Vui lòng chọn ít nhất một loại đánh giá'); return; }
    const rated = selectedCategories.filter((c) => c.rating > 0);
    if (rated.length === 0) { message.error('Vui lòng đánh giá ít nhất một mục'); return; }
    const needNote = rated.filter((c) => c.rating <= 2 && !c.note.trim());
    if (needNote.length > 0) { message.error(`Vui lòng nhập chi tiết cho: ${needNote.map((c) => c.name).join(', ')}`); return; }
    const withImgNoNote = selectedCategories.filter((c) => feedbackImages[c.id]?.trim() && (!c.note || !c.note.trim()));
    if (withImgNoNote.length > 0) { message.error(`Vui lòng nhập chi tiết cho các loại có hình ảnh: ${withImgNoNote.map((c) => c.name).join(', ')}`); return; }
    setShowSummary(true);
  };

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);
    try {
      const validCats = selectedCategories.filter((c) => c.rating > 0 || c.note.trim());
      const promises = validCats.map((cat) => {
        const isMachines = cat.id === 'machines';
        // note field: for machines, include device statuses + user note as JSON
        // for other categories, store as JSON with just the user note
        const notePayload = isMachines
          ? JSON.stringify({ deviceStatuses: deviceFeedback, userNote: cat.note })
          : cat.note.trim() ? JSON.stringify({ userNote: cat.note }) : null;

        // description: human-readable summary
        let description = `Đánh giá: ${cat.rating}/5 sao`;
        if (cat.note.trim()) description += `\n\nChi tiết: ${cat.note}`;
        if (isMachines) {
          description += `\n\nTình trạng thiết bị:\n${deviceItems.map((d) => `- ${d.name}: ${deviceStatusOptions.find((o) => o.value === deviceFeedback[d.field])?.label ?? deviceFeedback[d.field]}`).join('\n')}`;
        }

        return apiClient.post('/feedback', {
          type: 'IMPROVEMENT',
          title: `Feedback về ${cat.name}`,
          description,
          priority: cat.rating <= 2 ? 'HIGH' : cat.rating <= 3 ? 'MEDIUM' : 'LOW',
          category: cat.id.toUpperCase(),
          rating: cat.rating,
          image: feedbackImages[cat.id] || null,
          note: notePayload,
        });
      });
      await Promise.all(promises);
      apiClient.delete('/feedback/draft').catch(() => {});
      message.success('Gửi feedback thành công! Cảm ơn bạn đã đóng góp ý kiến.');
      resetForm();
    } catch {
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategories(feedbackCategories.map((c) => ({ id: c.id, name: c.name, rating: 0, selected: false, note: '' })));
    setFeedbackImages({});
    setDeviceFeedback({ ...defaultDeviceStatus });
    setShowSummary(false);
    setActiveCategory('');
  };

  /* ── Render: Create Tab ── */
  const renderCreateForm = () => {
    if (showSummary) return renderSummary();

    const showDevicePanel = activeCategory === 'machines' && activeCategoryData?.selected;

    return (
      <div className="flex flex-col h-full">
        {/* Info Banner */}
        <div className="flex-shrink-0 p-3 rounded-xl bg-blue-900/30 border border-blue-700/50 mb-4">
          <p className="text-sm text-blue-200 leading-relaxed mb-0.5">
            Mỗi đóng góp của bạn là động lực để chúng tôi phát triển. Cảm ơn bạn đã đồng hành cùng chúng tôi vì một mái nhà chung.
          </p>
          <p className="text-xs text-blue-400">
            📸 Chụp hình: Nhấn Shift + Windows + S để chụp màn hình, sau đó paste vào ô chi tiết (tối đa 1 ảnh)
          </p>
        </div>

        {/* Category Selection */}
        <div className="flex-shrink-0 mb-4">
          <p className="text-sm font-medium text-gray-300 mb-2">
            Chọn loại đánh giá <span className="text-gray-500 font-normal">(có thể chọn nhiều)</span>
          </p>
          <div className="grid grid-cols-5 gap-3">
            {feedbackCategories.map((config) => {
              const data = categories.find((c) => c.id === config.id);
              const isSelected = data?.selected || false;
              const isActive = activeCategory === config.id;
              const completed = isCategoryCompleted(config.id);

              return (
                <button
                  key={config.id}
                  type="button"
                  onClick={() => toggleCategory(config.id)}
                  className={`relative p-3 rounded-xl text-white text-sm font-medium transition-all cursor-pointer border-2 box-border min-w-0
                    ${config.color}
                    ${isSelected ? (isActive ? 'border-white shadow-lg' : 'border-transparent shadow-lg opacity-90') : 'border-transparent opacity-60 hover:opacity-80'}
                  `}
                >
                  {completed && (
                    <div className="absolute -top-2 -right-2 h-5 w-5 bg-green-500 text-white rounded-full flex items-center justify-center shadow text-xs">✓</div>
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-xs leading-tight">{config.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content: 2-column when device panel visible, 1-column otherwise */}
        {activeCategoryData?.selected && activeCategoryConfig && (
          <div className={`flex-1 min-h-0 flex gap-4 ${showDevicePanel ? '' : 'flex-col'}`}>
            {/* Left: Rating + Note */}
            <div className={`flex flex-col gap-4 ${showDevicePanel ? 'w-1/2' : 'flex-1'}`}>
              <div className="flex-1 bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex flex-col gap-4">
                {/* Rating */}
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Mức đánh giá</p>
                  <div className="flex flex-col items-center gap-1">
                    <Stars rating={activeCategoryData.rating} onChange={(r) => updateRating(activeCategory, r)} />
                    <span className={`text-sm font-medium ${getRatingColor(activeCategoryData.rating)}`}>
                      {getRatingText(activeCategoryData.rating)}
                    </span>
                  </div>
                </div>

                {/* Note */}
                <div className="flex-1 flex flex-col">
                  <p className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                    Chi tiết cụ thể
                    {((activeCategoryData.rating > 0 && activeCategoryData.rating <= 2) || feedbackImages[activeCategory]?.trim()) && (
                      <span className="text-red-400 text-xs">*</span>
                    )}
                  </p>
                  <textarea
                    value={activeCategoryData.note}
                    onChange={(e) => updateNote(activeCategory, e.target.value)}
                    onPaste={(e) => handlePasteImage(e, activeCategory)}
                    placeholder={activeCategoryConfig.placeholder}
                    maxLength={500}
                    className={`flex-1 w-full rounded-lg text-sm resize-none outline-none p-3
                      bg-gray-900 border text-gray-200 placeholder-gray-500
                      ${((activeCategoryData.rating > 0 && activeCategoryData.rating <= 2) || feedbackImages[activeCategory]?.trim()) && !activeCategoryData.note.trim()
                        ? 'border-red-500/60 focus:border-red-400'
                        : 'border-gray-600 focus:border-blue-500'}
                    `}
                  />

                  {/* Pasted Image Preview */}
                  {feedbackImages[activeCategory] && (
                    <div className="mt-2 flex items-center gap-2">
                      <button type="button" onClick={() => setImageModal({ isOpen: true, imageUrl: feedbackImages[activeCategory] })} className="cursor-pointer">
                        <img src={feedbackImages[activeCategory]} alt="Screenshot" className="h-16 w-16 object-cover rounded border border-gray-600 shadow hover:opacity-80 transition-opacity" />
                      </button>
                      <button type="button" onClick={() => setFeedbackImages((prev) => ({ ...prev, [activeCategory]: '' }))} className="text-red-400 hover:text-red-300 text-xs cursor-pointer">Xóa ảnh</button>
                    </div>
                  )}

                  <div className="flex justify-between mt-1">
                    {((activeCategoryData.rating > 0 && activeCategoryData.rating <= 2) || feedbackImages[activeCategory]?.trim()) ? (
                      <span className="text-xs text-red-400">
                        {activeCategoryData.rating > 0 && activeCategoryData.rating <= 2 && `* Bắt buộc khi đánh giá ${activeCategoryData.rating} sao`}
                        {feedbackImages[activeCategory]?.trim() && activeCategoryData.rating > 2 && '* Bắt buộc khi có hình ảnh'}
                      </span>
                    ) : <span />}
                    <span className="text-xs text-gray-500">{activeCategoryData.note.length}/500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Device Status (only for machines) */}
            {showDevicePanel && (
              <div className="w-1/2 bg-gray-800/50 rounded-xl p-4 border border-gray-700 overflow-y-auto">
                <p className="text-sm font-medium text-gray-400 mb-3">Trạng thái thiết bị</p>
                <div className="space-y-2">
                  {deviceItems.map((item) => {
                    const status = deviceFeedback[item.field];
                    return (
                      <div key={item.id} className="p-2.5 border border-gray-700 rounded-lg bg-gray-900/50">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm">{item.icon}</span>
                          <span className="font-medium text-gray-200 text-xs">{item.name}</span>
                        </div>
                        <div className="flex gap-1.5">
                          {deviceStatusOptions.map((opt) => (
                            <label
                              key={opt.value}
                              className={`flex-1 flex items-center justify-center p-1.5 rounded cursor-pointer transition-all text-[11px] font-medium border-2 leading-tight text-center
                                ${status === opt.value ? `${opt.bgColor} ${opt.borderColor} ${opt.color}` : 'border-transparent hover:bg-gray-800 text-gray-400'}
                              `}
                            >
                              <input type="radio" name={item.field} value={opt.value} checked={status === opt.value}
                                onChange={() => setDeviceFeedback((prev) => ({ ...prev, [item.field]: opt.value as any }))}
                                className="sr-only"
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handlePreview}
          disabled={!selectedCategories.some((c) => c.rating > 0 || c.note.trim())}
          className="flex-shrink-0 mt-4 w-full py-3 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))' }}
        >
          Xem trước & Gửi Phản Hồi
        </button>
      </div>
    );
  };

  /* ── Render: Summary ── */
  const renderSummary = () => {
    const validCats = selectedCategories.filter((c) => c.rating > 0 || c.note.trim());
    return (
      <div className="space-y-5">
        <div className="columns-2 gap-3 space-y-3">
          {validCats.map((cat) => {
            const config = feedbackCategories.find((c) => c.id === cat.id);
            return (
              <div key={cat.id} className="break-inside-avoid p-4 border border-gray-700 rounded-xl bg-gray-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{config?.icon}</span>
                  <span className="font-semibold text-gray-200">{cat.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${config?.color}`}>{cat.rating}/5</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Đánh giá: </span>
                    <span className={getRatingColor(cat.rating)}>{getRatingText(cat.rating)}</span>
                  </div>
                  {cat.id === 'machines' && (
                    <div>
                      <span className="text-gray-400">Trạng thái thiết bị:</span>
                      <div className="mt-1 space-y-0.5">
                        {deviceItems.map((item) => {
                          const status = deviceFeedback[item.field];
                          const opt = deviceStatusOptions.find((o) => o.value === status);
                          return (
                            <div key={item.id} className="flex items-center gap-2 text-xs">
                              <span>{item.icon}</span>
                              <span className="text-gray-400">{item.name}:</span>
                              <span className={`font-medium ${opt?.color}`}>{opt?.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {cat.note.trim() && (
                    <div>
                      <span className="text-gray-400">Chi tiết: </span>
                      <p className="mt-1 text-gray-300 bg-gray-900/50 p-2 rounded border border-gray-700">{cat.note}</p>
                    </div>
                  )}
                  {feedbackImages[cat.id]?.trim() && (
                    <div>
                      <span className="text-gray-400">Hình ảnh:</span>
                      <div className="mt-1">
                        <img src={feedbackImages[cat.id]} alt="Screenshot" className="h-16 w-16 object-cover rounded border border-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={() => setShowSummary(false)} className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors">
            Quay lại chỉnh sửa
          </button>
          <button
            onClick={handleSubmitFeedback}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))' }}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi Feedback'}
          </button>
        </div>
      </div>
    );
  };

  /* ── Render: History Tab ── */
  const renderHistory = () => {
    if (historyLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
        </div>
      );
    }

    if (feedbackList.length === 0) {
      return <div className="text-center py-12 text-gray-500">Bạn chưa có feedback nào</div>;
    }

    return (
      <div className="space-y-3">
        {feedbackList.map((fb) => (
          <div key={fb.id} className="border border-gray-700 rounded-xl p-4 bg-gray-800/50 hover:bg-gray-800/80 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <span className="font-medium text-gray-200 text-sm">
                {fb.title || `Feedback về ${fb.category || 'Khác'}`}
              </span>
              <div className="flex gap-2 flex-shrink-0 ml-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(fb.priority)}`}>{getPriorityLabel(fb.priority)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(fb.status)}`}>{getStatusLabel(fb.status)}</span>
              </div>
            </div>
            {fb.rating > 0 && (
              <div className="mb-1">
                <span className="text-xs text-gray-400">Đánh giá: </span>
                <span className="text-xs text-yellow-400">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
              </div>
            )}
            {fb.description && (
              <p className="text-xs text-gray-400 line-clamp-2 mb-2">{fb.description}</p>
            )}
            {fb.image && (
              <div className="mb-2">
                <img
                  src={fb.image}
                  alt="Screenshot"
                  className="max-w-full h-auto max-h-32 rounded border border-gray-700 cursor-pointer hover:opacity-80"
                  onClick={() => setImageModal({ isOpen: true, imageUrl: fb.image! })}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div className="text-xs text-gray-500">
              {formatDate(fb.createdAt)}
              {fb.updatedAt !== fb.createdAt && ` · Cập nhật: ${formatDate(fb.updatedAt)}`}
            </div>
          </div>
        ))}
        <button onClick={fetchHistory} className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
          Làm mới
        </button>
      </div>
    );
  };

  /* ── Main Render ── */
  return (
    <div className="flex flex-col p-3 gap-3 h-full">
      <div className="flex-1 bg-gray-900/95 rounded-xl border border-gray-800 shadow-lg overflow-hidden flex flex-col">
        {/* Tab Header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-0">
          <div className="flex gap-4 border-b border-gray-700">
            <button
              onClick={() => { setTab('create'); setShowSummary(false); }}
              className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors cursor-pointer
                ${tab === 'create' ? 'border-pink-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              Gửi Phản Hồi
            </button>
            <button
              onClick={() => setTab('history')}
              className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors cursor-pointer
                ${tab === 'history' ? 'border-pink-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              Lịch sử
            </button>
          </div>
        </div>

        {/* Content */}
        {tab === 'create' ? (
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
            {renderCreateForm()}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
            {renderHistory()}
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setImageModal({ isOpen: false, imageUrl: '' })}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl cursor-pointer" onClick={() => setImageModal({ isOpen: false, imageUrl: '' })}>✕</button>
          <img src={imageModal.imageUrl} alt="Screenshot" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
