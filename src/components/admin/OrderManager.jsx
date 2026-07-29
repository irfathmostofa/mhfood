import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { sendOrderDeliveredEmail } from "../../lib/emailjs";
import { sendOrderDeliveredSMS } from "../../lib/sms";

const STATUS_FLOW = ["pending", "confirmed", "out_for_delivery", "delivered"];

const STATUS_LABELS = {
  pending: "Received",
  confirmed: "Confirmed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS = {
  pending: "bg-slate-100 text-slate-700",
  confirmed: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-amber-100 text-amber-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAGE_SIZE = 10;

// Builds a readable "Zone Name (৳charge)" string, or "N/A" if there's no
// zone/charge to show (e.g. free delivery or no zone selected).
function formatDelivery(order) {
  const zoneName = order.delivery_zones?.name;
  const charge = order.delivery_charge;

  if (!zoneName && !charge) return "N/A";
  if (zoneName && charge === 0) return `${zoneName} (FREE)`;
  if (zoneName) return `${zoneName} (৳${charge})`;
  return `৳${charge}`;
}

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);

    let query = supabase
      .from("orders")
      // Join delivery_zones so we get the real zone name, not a
      // non-existent delivery_zone_name column.
      .select("*, delivery_zones(name)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error) {
      setOrders(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  // Reset to page 0 whenever the filter changes
  function handleFilterChange(newFilter) {
    setFilter(newFilter);
    setPage(0);
  }

  async function toggleExpand(order) {
    if (expandedId === order.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(order.id);

    if (!orderItems[order.id]) {
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);
      setOrderItems((prev) => ({ ...prev, [order.id]: data || [] }));
    }
  }

  async function updateStatus(order, newStatus) {
    setUpdatingId(order.id);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order.id);

    if (!error && newStatus === "delivered") {
      let items = orderItems[order.id];
      if (!items) {
        const { data } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);
        items = data || [];
      }

      try {
        await sendOrderDeliveredEmail({
          toEmail: order.email,
          customerName: order.customer_name,
          trackingCode: order.tracking_code,
          delivery: formatDelivery(order),
          orderId: order.id,
          items,
        });
      } catch (err) {
        alert(
          "Order marked as delivered, but the review-request email failed to send.",
        );
      }

      sendOrderDeliveredSMS({
        phone: order.phone,
        customerName: order.customer_name,
        trackingCode: order.tracking_code,
      }).catch(() => {
        // Delivery is already recorded even if the SMS fails
      });
    }

    setUpdatingId(null);
    loadOrders();
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rangeStart = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, totalCount);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Orders ({totalCount})
        </h2>
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="text-sm border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All statuses</option>
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {loading ? (
          <p className="text-sm text-slate-400 py-4">Loading orders...</p>
        ) : (
          <>
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-slate-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(order)}
                  className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {order.customer_name} — {order.tracking_code}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.phone} ·{" "}
                      <b className="font-bold text-amber-700">
                        ৳{order.total_amount}
                      </b>{" "}
                      · {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </button>

                {expandedId === order.id && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50">
                    <p className="text-xs text-slate-500 mb-3">
                      {order.address}
                    </p>

                    <ul className="text-sm text-slate-700 space-y-1 mb-2">
                      {(orderItems[order.id] || []).map((item) => (
                        <li key={item.id}>
                          {item.product_name} × {item.quantity} — ৳{item.price}
                        </li>
                      ))}
                    </ul>

                    {(order.delivery_charge > 0 ||
                      order.delivery_zones?.name) && (
                      <p className="text-sm text-slate-500 mb-1">
                        Delivery: {formatDelivery(order)}
                      </p>
                    )}

                    {order.discount_amount > 0 && (
                      <p className="text-sm text-emerald-600 mb-4">
                        {order.discount_label || "Discount"}: -৳
                        {order.discount_amount}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {STATUS_FLOW.map((status, i) => {
                        const currentIndex = STATUS_FLOW.indexOf(order.status);
                        const isCurrent = order.status === status;
                        const isPast =
                          currentIndex > i && order.status !== "cancelled";

                        return (
                          <button
                            key={status}
                            disabled={isCurrent || updatingId === order.id}
                            onClick={() => updateStatus(order, status)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                              isCurrent
                                ? "bg-emerald-600 text-white cursor-default"
                                : isPast
                                  ? "bg-slate-200 text-slate-500 hover:bg-slate-300"
                                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {STATUS_LABELS[status]}
                          </button>
                        );
                      })}
                      {order.status !== "cancelled" && (
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => {
                            if (confirm("Cancel this order?"))
                              updateStatus(order, "cancelled");
                          }}
                          className="text-xs font-medium px-3 py-1.5 rounded-md bg-white border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                      <Link
                        to={`/admin/invoice/${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Print Invoice
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {orders.length === 0 && (
              <p className="text-sm text-slate-400 py-4">No orders found.</p>
            )}
          </>
        )}
      </div>

      {totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing {rangeStart}–{rangeEnd} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
