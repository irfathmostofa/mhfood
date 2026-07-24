import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function AdminInvoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError || !orderData) {
        setError('Order not found.');
        setLoading(false);
        return;
      }

      const { data: itemRows } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      setOrder(orderData);
      setItems(itemRows || []);
      setLoading(false);
    }
    load();
  }, [orderId]);

  if (loading) return <p className="p-8 text-sm text-slate-400">Loading invoice...</p>;
  if (error) return <p className="p-8 text-sm text-red-600">{error}</p>;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Screen-only toolbar — hidden when printing */}
      <div className="no-print sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link to="/admin/orders" className="text-sm text-slate-600 hover:text-slate-900">
          ← Back to Orders
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          Print Invoice
        </button>
      </div>

      {/* Printable receipt */}
      <div className="invoice-wrapper py-8 flex justify-center">
        <div className="invoice-receipt bg-white text-black">
          <div className="text-center mb-3">
            <p className="text-base font-bold">YOUR STORE</p>
            <p className="text-[11px]">Order Receipt</p>
          </div>

          <div className="border-t border-dashed border-black my-2" />

          <div className="text-[11px] leading-5">
            <p>Tracking: {order.tracking_code}</p>
            <p>Date: {new Date(order.created_at).toLocaleString()}</p>
            <p>Status: {order.status.replace(/_/g, ' ')}</p>
          </div>

          <div className="border-t border-dashed border-black my-2" />

          <div className="text-[11px] leading-5">
            <p className="font-semibold">Customer</p>
            <p>{order.customer_name}</p>
            <p>{order.phone}</p>
            <p className="whitespace-pre-wrap">{order.address}</p>
          </div>

          <div className="border-t border-dashed border-black my-2" />

          <table className="w-full text-[11px]">
            <thead>
              <tr>
                <th className="text-left font-semibold pb-1">Item</th>
                <th className="text-center font-semibold pb-1">Qty</th>
                <th className="text-right font-semibold pb-1">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-0.5 pr-1 align-top">{item.product_name}</td>
                  <td className="py-0.5 text-center align-top">{item.quantity}</td>
                  <td className="py-0.5 text-right align-top">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-black my-2" />

          <div className="text-[11px] flex justify-between font-bold">
            <span>TOTAL</span>
            <span>৳{(order.total_amount || subtotal).toFixed(2)}</span>
          </div>

          <div className="border-t border-dashed border-black my-3" />

          <p className="text-center text-[10px]">Thank you for your order!</p>
          <p className="text-center text-[10px]">{order.tracking_code}</p>
        </div>
      </div>

      <style>{`
        .invoice-receipt {
          width: 80mm;
          padding: 4mm;
          font-family: 'Courier New', monospace;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          .invoice-wrapper {
            padding: 0 !important;
            display: block !important;
          }
          .invoice-receipt {
            width: 80mm;
            margin: 0 auto;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
