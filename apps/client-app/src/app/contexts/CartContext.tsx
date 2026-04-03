import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { apiClient } from '@gateway-workspace/shared/utils/client';

export interface MenuItem {
  id: number;
  name: string;
  salePrice: number;
  imageUrl: string | null;
  categoryId: number | null;
  category: { id: number; name: string } | null;
  isActive: boolean;
  availablePortions: number | null;
  isFeedback: boolean;
  versions?: {
    id: number;
    versionName: string | null;
    items: {
      id: number;
      quantity: number;
      unit: string | null;
      material: { id: number; name: string; baseUnit: string };
    }[];
  }[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  note: string;
}

interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  setCart: () => {},
  clearCart: async () => {},
});

const CART_LS_KEY = 'client_cart';

function loadFromLocalStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Khởi tạo cart từ localStorage ngay lập tức (đồng bộ, không cần đợi API)
  const [cart, setCart] = useState<CartItem[]>(() => loadFromLocalStorage());
  const isFirstLoad = useRef(true);

  // Đồng bộ với Redis sau khi mount: nếu Redis có data mới hơn thì dùng
  useEffect(() => {
    apiClient.get('/dashboard/cart')
      .then((res) => {
        const data = res.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          setCart(data);
          localStorage.setItem(CART_LS_KEY, JSON.stringify(data));
        }
      })
      .catch(() => {/* silent - localStorage already loaded */})
      .finally(() => {
        isFirstLoad.current = false;
      });
  }, []);

  // Lưu vào localStorage ngay lập tức + đồng bộ Redis khi cart thay đổi
  useEffect(() => {
    if (isFirstLoad.current) return;
    localStorage.setItem(CART_LS_KEY, JSON.stringify(cart));
    apiClient.post('/dashboard/cart', { cart }).catch(() => {/* silent */});
  }, [cart]);

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem(CART_LS_KEY);
    try { await apiClient.delete('/dashboard/cart'); } catch {/* silent */}
  };

  return (
    <CartContext.Provider value={{ cart, setCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
