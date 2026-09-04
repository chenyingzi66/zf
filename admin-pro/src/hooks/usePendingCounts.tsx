/**
 * 侧边栏角标:房源待审核数、订单待处理数。
 * 旧界面靠同一个 Vue 实例顺手拿到(admin.js:104-105),这里用一个轻量 Context 提供,
 * 增删改后由页面调用 refresh() 刷新。取数失败不报错,角标只是提示。
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { isAuthenticated, listAllHouses, listOrders } from '../api';

interface PendingCountsValue {
  pendingHouse: number;
  pendingOrder: number;
  refresh: () => Promise<void>;
}

const PendingCountsContext = createContext<PendingCountsValue>({
  pendingHouse: 0,
  pendingOrder: 0,
  refresh: async () => {},
});

export function PendingCountsProvider({ children }: { children: ReactNode }) {
  const [pendingHouse, setPendingHouse] = useState(0);
  const [pendingOrder, setPendingOrder] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated()) {
      setPendingHouse(0);
      setPendingOrder(0);
      return;
    }
    const [houses, orders] = await Promise.all([
      listAllHouses().catch(() => []),
      listOrders().catch(() => []),
    ]);
    setPendingHouse(houses.filter(house => house.auditStatus === 0).length);
    setPendingOrder(orders.filter(order => order.orderStatus === 0).length);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <PendingCountsContext.Provider value={{ pendingHouse, pendingOrder, refresh }}>
      {children}
    </PendingCountsContext.Provider>
  );
}

export const usePendingCounts = () => useContext(PendingCountsContext);
