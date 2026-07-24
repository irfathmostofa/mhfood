import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Subscribes to new rows in `orders` and keeps a running list + count
export function useNewOrderAlerts() {
  const [newOrders, setNewOrders] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel('orders-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setNewOrders((prev) => [payload.new, ...prev]);
          // Optional: play a notification sound
          // new Audio('/notify.mp3').play();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clear = () => setNewOrders([]);

  return { newOrders, count: newOrders.length, clear };
}
