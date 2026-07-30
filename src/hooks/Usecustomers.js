import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Derives unique customers from the orders table (there's no dedicated
// customers table — phone number is the most reliable unique key, since
// it's required on every order while email is optional).
export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("orders")
      .select("customer_name, phone, email, total_amount, status, created_at")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setCustomers([]);
      setLoading(false);
      return;
    }

    // Rows arrive newest-first, so the first time we see a phone number its
    // name/email are already the most recent — later (older) rows for the
    // same phone only add to the running totals.
    const byPhone = new Map();
    for (const order of data || []) {
      if (!order.phone) continue;
      const existing = byPhone.get(order.phone);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += Number(order.total_amount || 0);
        if (!existing.email && order.email) existing.email = order.email;
      } else {
        byPhone.set(order.phone, {
          phone: order.phone,
          name: order.customer_name,
          email: order.email || "",
          orderCount: 1,
          totalSpent: Number(order.total_amount || 0),
          lastOrderAt: order.created_at,
        });
      }
    }

    const list = Array.from(byPhone.values()).sort(
      (a, b) => new Date(b.lastOrderAt) - new Date(a.lastOrderAt),
    );

    setCustomers(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { customers, loading, error, refresh: load };
}
