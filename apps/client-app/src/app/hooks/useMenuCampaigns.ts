import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, getToken } from '@gateway-workspace/shared/utils/client';
import { io, Socket } from 'socket.io-client';

export interface ActiveCampaign {
  id: number;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxDiscountAmount: number | null;
  totalBudget: number | null;
  spentBudget: number;
  startDate: string;
  endDate: string;
  menuScopes: { scopeType: string; targetId: number | null }[];
  customerScopes: { scopeType: string; targetId: number | null }[];
  timeSlots: { dayOfWeek: number | null; startTime: string; endTime: string }[];
}

export function useMenuCampaigns() {
  const [campaigns, setCampaigns] = useState<ActiveCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChanged, setLastChanged] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await apiClient.get('/menu-campaign/active');
      setCampaigns(res.data ?? []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // WebSocket: listen for campaign changes from admin
  useEffect(() => {
    const tenantId = apiClient.defaults.headers.common['x-tenant-id'] as string;
    if (!tenantId) return;

    const token = getToken();
    const socket = io(`${apiClient.defaults.baseURL ?? ''}/menu-campaigns`, {
      auth: { tenantId, token },
      transports: ['websocket'],
    });

    socket.on('campaign:changed', () => {
      setLastChanged(Date.now());
      fetchCampaigns();
    });

    socket.on('campaign:budget_updated', () => {
      fetchCampaigns();
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [fetchCampaigns]);

  // Initial fetch + polling fallback
  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 60000);
    return () => clearInterval(interval);
  }, [fetchCampaigns]);

  const getItemDiscount = useCallback((recipeId: number, categoryId: number, salePrice: number): { discount: number; campaign: ActiveCampaign } | null => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const c of campaigns) {
      if (c.timeSlots?.length) {
        const inSlot = c.timeSlots.some(s => {
          const dayOk = s.dayOfWeek == null || s.dayOfWeek === currentDay;
          const timeOk = currentTime >= s.startTime && currentTime <= s.endTime;
          return dayOk && timeOk;
        });
        if (!inSlot) continue;
      }

      if (c.menuScopes?.length) {
        const hasAll = c.menuScopes.some(s => s.scopeType === 'ALL');
        if (!hasAll) {
          const catMatch = c.menuScopes.some(s => s.scopeType === 'CATEGORY' && s.targetId === categoryId);
          const recipeMatch = c.menuScopes.some(s => s.scopeType === 'RECIPE' && s.targetId === recipeId);
          if (!catMatch && !recipeMatch) continue;
        }
      }

      if (c.totalBudget && c.spentBudget >= c.totalBudget) continue;

      let discount = 0;
      switch (c.discountType) {
        case 'PERCENTAGE': discount = salePrice * c.discountValue / 100; break;
        case 'FIXED_AMOUNT': discount = Math.min(c.discountValue, salePrice); break;
        case 'FLAT_PRICE': discount = Math.max(0, salePrice - c.discountValue); break;
      }
      if (c.maxDiscountAmount) discount = Math.min(discount, c.maxDiscountAmount);
      discount = Math.round(discount);

      if (discount > 0) return { discount, campaign: c };
    }

    return null;
  }, [campaigns]);

  // Calculate total discount for a cart (used for checkout expectedDiscount)
  const getCartTotalDiscount = useCallback((items: { recipeId: number; categoryId: number; salePrice: number; quantity: number }[]): number => {
    let total = 0;
    for (const item of items) {
      const promo = getItemDiscount(item.recipeId, item.categoryId, item.salePrice);
      if (promo) total += promo.discount * item.quantity;
    }
    return total;
  }, [getItemDiscount]);

  return { campaigns, loading, getItemDiscount, getCartTotalDiscount, lastChanged, refetch: fetchCampaigns };
}
