import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AdminInvoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (orderError || !orderData) {
        setError("Order not found.");
        setLoading(false);
        return;
      }

      const { data: itemRows } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      setOrder(orderData);
      setItems(itemRows || []);
      setLoading(false);
    }
    load();
  }, [orderId]);

  if (loading)
    return <p className="p-8 text-sm text-slate-400">Loading invoice...</p>;
  if (error) return <p className="p-8 text-sm text-red-600">{error}</p>;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Screen-only toolbar — hidden when printing */}
      <div className="no-print sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link
          to="/admin/orders"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Orders
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          Print Invoice
        </button>
      </div>

      {/* Receipt */}
      <div className="invoice-receipt mx-auto bg-white shadow-sm my-6 px-4 py-5">
        <div className="text-center mb-4">
          <p className="font-bold text-base leading-tight">MHFood</p>
          <p className="text-xs text-slate-500 mt-0.5">Order Invoice</p>
        </div>

        <div className="border-t border-dashed border-slate-400 my-2" />

        <div className="text-xs space-y-0.5 mb-2">
          <p>
            <span className="font-medium">Tracking:</span> {order.tracking_code}
          </p>
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(order.created_at).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            {order.status.replace(/_/g, " ")}
          </p>
        </div>

        <div className="border-t border-dashed border-slate-400 my-2" />

        <div className="text-xs space-y-0.5 mb-2">
          <p className="font-medium">{order.customer_name}</p>
          <p>{order.phone}</p>
          <p className="break-words">{order.address}</p>
        </div>

        <div className="border-t border-dashed border-slate-400 my-2" />

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-400">
              <th className="text-left font-medium py-1">Item</th>
              <th className="text-center font-medium py-1">Qty</th>
              <th className="text-right font-medium py-1">Price</th>
              <th className="text-right font-medium py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-1 pr-1 break-words">{item.product_name}</td>
                <td className="py-1 text-center">{item.quantity}</td>
                <td className="py-1 text-right">{item.price}</td>
                <td className="py-1 text-right">
                  {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-slate-400 my-2" />

        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>৳{subtotal.toFixed(2)}</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between">
              <span>{order.discount_label || "Discount"}</span>
              <span>-৳{Number(order.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>
              Delivery
              {order.delivery_zone_name ? ` (${order.delivery_zone_name})` : ""}
            </span>
            <span>
              {Number(order.delivery_charge) === 0
                ? "FREE"
                : `৳${Number(order.delivery_charge).toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-slate-400 pt-1 mt-1">
            <span>Total</span>
            <span>৳{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-400 my-3" />

        <p className="text-center text-xs text-slate-500">
          Thank you for your order!
        </p>
      </div>
    </div>
  );
}
