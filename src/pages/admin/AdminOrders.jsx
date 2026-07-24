import AdminLayout from '../../components/admin/AdminLayout';
import OrderManager from '../../components/admin/OrderManager';
import { useNewOrderAlerts } from '../../hooks/useNewOrderAlerts';

export default function AdminOrders() {
  const { count, clear } = useNewOrderAlerts();

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Orders</h1>
        <p className="text-sm text-slate-500 mb-6">
          Track and update order status. Marking an order delivered sends the review-request email automatically.
        </p>

        {count > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
            <span>
              {count} new order{count > 1 ? 's' : ''} just came in — refresh the list below to see them.
            </span>
            <button
              onClick={clear}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
            >
              Dismiss
            </button>
          </div>
        )}

        <OrderManager />
      </div>
    </AdminLayout>
  );
}
