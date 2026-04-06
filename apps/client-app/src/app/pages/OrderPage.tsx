import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { apiClient } from '@gateway-workspace/shared/utils/client';
import { useCart, MenuItem } from '../contexts/CartContext';
import type { DashboardOutletContext } from '../components/DashboardLayout';

interface Category {
  id: number;
  name: string;
  requiredCategoryIds: string | null;
}

const OrderPage: React.FC = () => {
  const { menuVersion } = useOutletContext<DashboardOutletContext>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  // Cart state (shared via context)
  const { cart, setCart } = useCart();

  // Required category modal
  const [requiredCatError, setRequiredCatError] = useState<{ itemName: string; missingCats: string[] } | null>(null);

  // Restock request modal
  const [restockItem, setRestockItem] = useState<MenuItem | null>(null);
  const [restockNote, setRestockNote] = useState('');
  const [restockAnonymous, setRestockAnonymous] = useState(false);
  const [restockSending, setRestockSending] = useState(false);
  const [restockSent, setRestockSent] = useState(false);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    const showLoading = isFirstLoad.current;
    isFirstLoad.current = false;

    if (showLoading) setLoading(true);

    const fetchMenu = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          apiClient.get('/admin/menu/categories/client'),
          apiClient.get('/admin/menu/items'),
        ]);
        const visibleCategories: Category[] = catRes.data || [];
        setCategories(visibleCategories);

        const visibleCategoryIds = new Set(visibleCategories.map((c) => c.id));
        const allItems: MenuItem[] = (itemRes.data || []).filter((i: MenuItem) => i.isActive !== false);
        setItems(allItems.filter((i) => {
          if (!i.categoryId) return true;
          if (visibleCategoryIds.has(i.categoryId)) return true;
          // Cũng hiện nếu secondaryCategoryIds chứa bất kỳ visible category nào
          const secondaryIds: number[] = i.secondaryCategoryIds ? JSON.parse(i.secondaryCategoryIds) : [];
          return secondaryIds.some((id) => visibleCategoryIds.has(id));
        }));
      } catch {
        // silent
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    fetchMenu();
  }, [menuVersion]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const secondaryIds: number[] = item.secondaryCategoryIds ? JSON.parse(item.secondaryCategoryIds) : [];
      const matchCat = selectedCat === null || item.categoryId === selectedCat || secondaryIds.includes(selectedCat);
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCat, search]);

  const handleCardClick = (item: MenuItem) => {
    if (item.availablePortions !== null && item.availablePortions <= 0) {
      if (!item.isFeedback) {
        setRestockItem(item);
        setRestockNote('');
        setRestockSent(false);
      }
      return;
    }

    // Kiểm tra ràng buộc danh mục
    if (item.categoryId) {
      const cat = categories.find((c) => c.id === item.categoryId);
      if (cat?.requiredCategoryIds) {
        const required: number[] = JSON.parse(cat.requiredCategoryIds);
        if (required.length > 0) {
          const cartCatIds = new Set(cart.map((ci) => ci.item.categoryId));
          const hasAny = required.some((rid) => cartCatIds.has(rid));
          if (!hasAny) {
            const allNames = required.map((rid) => categories.find((c) => c.id === rid)?.name ?? `#${rid}`);
            setRequiredCatError({ itemName: item.name, missingCats: allNames });
            return;
          }
        }
      }
    }

    setNote('');
    setQuantity(1);
    setSelectedItem(item);
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    setCart((prev) => [...prev, { item: selectedItem, quantity, note }]);
    setSelectedItem(null);
    setQuantity(1);
    setNote('');
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setQuantity(1);
    setNote('');
  };

  const activeIngredients = selectedItem?.versions?.[0]?.items ?? [];

  const handleRestockSend = async () => {
    if (!restockItem) return;
    setRestockSending(true);
    try {
      await apiClient.post('/feedback', {
        type: 'RESTOCK_REQUEST',
        title: `Yêu cầu nhập hàng: ${restockItem.name}`,
        description: `Món "${restockItem.name}" đã hết hàng. Yêu cầu nhập thêm.`,
        priority: 'HIGH',
        category: 'FOOD',
        itemId: restockItem.id,
        note: restockNote || null,
        isAnonymous: restockAnonymous,
      });
      setRestockSent(true);
      // Refresh item list to get updated isFeedback from server
      const itemRes = await apiClient.get('/admin/menu/items');
      setItems((itemRes.data || []).filter((i: MenuItem) => i.isActive !== false));
    } catch {
      // silent
    } finally {
      setRestockSending(false);
    }
  };

  const handleRestockClose = () => {
    setRestockItem(null);
    setRestockNote('');
    setRestockAnonymous(false);
    setRestockSent(false);
  };

  return (
    <div className="flex flex-col p-3 gap-3 h-full">
      <div className="flex-1 bg-gray-900/95 rounded-xl border border-gray-800 shadow-lg overflow-hidden flex flex-col">
        {/* Search */}
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <Input
            placeholder="Tìm món..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="rounded-lg"
            style={{ background: '#1e293b', borderColor: '#334155', color: '#e2e8f0' }}
          />
        </div>

        {/* Category tabs */}
        <div className="px-4 pb-2 flex-shrink-0 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCat(null)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer hover:opacity-80"
            style={selectedCat === null
              ? { background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
              : { background: '#374151', color: '#d1d5db' }}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer hover:opacity-80"
              style={selectedCat === cat.id
                ? { background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
                : { background: '#374151', color: '#d1d5db' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-gray-800 animate-pulse h-56" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              Không tìm thấy món nào
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="rounded-xl overflow-hidden bg-gray-800 border border-gray-700 hover:border-pink-500 transition-all cursor-pointer"
                >
                  <div className="aspect-[4/3] bg-gray-900 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={`${apiClient.defaults.baseURL ?? ''}${item.imageUrl}`}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">
                        NO IMAGE
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-white font-bold text-sm uppercase leading-tight line-clamp-2">
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-pink-400 font-semibold text-sm">
                        {Number(item.salePrice) > 0 ? `${Number(item.salePrice).toLocaleString('vi-VN')}đ` : '0đ'}
                      </p>
                      {item.availablePortions !== null && (
                        item.availablePortions > 0
                          ? <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: '#14532d', color: '#86efac' }}>còn {item.availablePortions}</span>
                          : item.isFeedback
                            ? <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: '#7c2d12', color: '#fdba74' }}>Đang xử lý</span>
                            : <button
                                onClick={(e) => { e.stopPropagation(); setRestockItem(item); setRestockNote(''); setRestockSent(false); }}
                                className="text-xs font-medium px-1.5 py-0.5 rounded cursor-pointer transition-all hover:opacity-80"
                                style={{ background: '#450a0a', color: '#fca5a5' }}
                              >Yêu cầu nhập hàng</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={handleCloseModal}
        >
          <div
            className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="aspect-video bg-gray-800 overflow-hidden">
              {selectedItem.imageUrl ? (
                <img
                  src={`${apiClient.defaults.baseURL ?? ''}${selectedItem.imageUrl}`}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  NO IMAGE
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Name & price */}
              <div>
                <h2 className="text-white font-bold text-xl uppercase leading-tight">
                  {selectedItem.name}
                </h2>
                {selectedItem.category && (
                  <p className="text-gray-400 text-sm mt-0.5">{selectedItem.category.name}</p>
                )}
                <p className="text-pink-400 font-bold text-lg mt-1">
                  {selectedItem.salePrice > 0
                    ? `${Number(selectedItem.salePrice).toLocaleString('vi-VN')}đ`
                    : '0đ'}
                </p>
              </div>

              {/* Ingredients */}
              {activeIngredients.length > 0 ? (
                <div>
                  <p className="text-gray-300 font-semibold text-sm mb-2">Công thức nguyên liệu</p>
                  <div className="flex flex-wrap gap-2">
                    {activeIngredients.map((ri) => (
                      <span
                        key={ri.id}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
                      >
                        {ri.material.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <p className="text-gray-300 font-semibold text-sm">Số lượng</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all cursor-pointer"
                    style={{ background: '#374151', color: '#d1d5db' }}
                  >
                    −
                  </button>
                  <span className="text-white font-bold text-lg w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all cursor-pointer"
                    style={{ background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', color: '#fff' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Note */}
              <div>
                <p className="text-gray-300 font-semibold text-sm mb-1">Ghi chú</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: ít đá, không đường, thêm topping..."
                  rows={3}
                  className="w-full rounded-lg text-sm resize-none outline-none"
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#e2e8f0',
                    padding: '10px 12px',
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer"
                  style={{ background: '#374151', color: '#d1d5db' }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all cursor-pointer"
                  style={{ background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', flexGrow: 2 }}
                >
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restock Request Modal */}
      {restockItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={handleRestockClose}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {restockSent ? (
              <>
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: '#14532d' }}>
                    ✓
                  </div>
                  <p className="text-white font-semibold text-center">Đã gửi yêu cầu nhập hàng!</p>
                  <p className="text-gray-400 text-sm text-center">Nhân viên sẽ xử lý sớm nhất có thể.</p>
                </div>
                <button
                  onClick={handleRestockClose}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
                  style={{ background: '#374151', color: '#d1d5db' }}
                >
                  Đóng
                </button>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-white font-bold text-base">Yêu cầu nhập hàng</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Món <span className="text-white font-medium">{restockItem.name}</span> hiện đã hết.
                  </p>
                </div>

                <div>
                  <p className="text-gray-300 text-sm font-medium mb-1">Ghi chú <span className="text-gray-500">(tuỳ chọn)</span></p>
                  <textarea
                    value={restockNote}
                    onChange={(e) => setRestockNote(e.target.value)}
                    placeholder="Ví dụ: cần gấp, số lượng cụ thể..."
                    rows={3}
                    className="w-full rounded-lg text-sm resize-none outline-none"
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: '#e2e8f0',
                      padding: '10px 12px',
                    }}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                  <input
                    type="checkbox"
                    checked={restockAnonymous}
                    onChange={(e) => setRestockAnonymous(e.target.checked)}
                    className="w-4 h-4 accent-pink-500 cursor-pointer"
                  />
                  <span className="text-gray-400 text-sm">Gửi ẩn danh</span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={handleRestockClose}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
                    style={{ background: '#374151', color: '#d1d5db' }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleRestockSend}
                    disabled={restockSending}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all"
                    style={{ background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', opacity: restockSending ? 0.7 : 1 }}
                  >
                    {restockSending ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Required category error modal */}
      {requiredCatError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setRequiredCatError(null)}
        >
          <div
            className="bg-gray-900 border border-orange-500/50 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: '#7c2d12' }}
              >
                ⚠️
              </div>
              <div>
                <p className="text-white font-bold text-base">Cần thêm món chính trước</p>
                <p className="text-gray-400 text-sm mt-1">
                  Để đặt <span className="text-white font-medium">"{requiredCatError.itemName}"</span>, giỏ hàng phải có ít nhất 1 món từ:
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {requiredCatError.missingCats.map((name) => (
                    <span
                      key={name}
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ background: '#7c2d12', color: '#fdba74' }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setRequiredCatError(null)}
              className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
              style={{ background: '#374151', color: '#d1d5db' }}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
