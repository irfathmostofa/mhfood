import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

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

const LOW_STOCK_THRESHOLD = 5;

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { count: totalOrders },
        { count: pendingCount },
        { count: confirmedCount },
        { count: outCount },
        { count: deliveredCount },
        { count: productCount },
        { count: categoryCount },
        { count: lowStockCount },
        { data: revenueRows },
        { data: recent },
        { data: lowStock },
      ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "confirmed"),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "out_for_delivery"),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "delivered"),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)
          .lte("stock", LOW_STOCK_THRESHOLD),
        supabase
          .from("orders")
          .select("total_amount")
          .eq("status", "delivered"),
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("products")
          .select("id, name, slug, stock")
          .eq("is_active", true)
          .lte("stock", LOW_STOCK_THRESHOLD)
          .order("stock", { ascending: true })
          .limit(6),
      ]);

      const revenue = (revenueRows || []).reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0,
      );

      setStats({
        totalOrders: totalOrders || 0,
        pendingCount: pendingCount || 0,
        confirmedCount: confirmedCount || 0,
        outCount: outCount || 0,
        deliveredCount: deliveredCount || 0,
        productCount: productCount || 0,
        categoryCount: categoryCount || 0,
        lowStockCount: lowStockCount || 0,
        revenue,
      });
      setRecentOrders(recent || []);
      setLowStockProducts(lowStock || []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading dashboard...</p>;
  }

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, link: "/admin/orders" },
    {
      label: "Awaiting Action",
      value: stats.pendingCount + stats.confirmedCount + stats.outCount,
      link: "/admin/orders",
    },
    { label: "Products", value: stats.productCount, link: "/admin/products" },
    {
      label: "Delivered Revenue",
      value: `৳${stats.revenue.toLocaleString()}`,
      link: "/admin/orders",
    },
    {
      label: "Low Stock",
      value: stats.lowStockCount,
      link: "/admin/products",
      warn: stats.lowStockCount > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className={`rounded-xl border p-5 hover:shadow-sm transition-all ${
              card.warn
                ? "bg-amber-50 border-amber-200 hover:border-amber-300"
                : "bg-white border-slate-200 hover:border-emerald-300"
            }`}
          >
            <p
              className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                card.warn ? "text-amber-600" : "text-slate-400"
              }`}
            >
              {card.label}
            </p>
            <p
              className={`text-2xl font-semibold ${card.warn ? "text-amber-700" : "text-slate-900"}`}
            >
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Order Pipeline
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            ["pending", stats.pendingCount],
            ["confirmed", stats.confirmedCount],
            ["out_for_delivery", stats.outCount],
            ["delivered", stats.deliveredCount],
          ].map(([status, count]) => (
            <div
              key={status}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${STATUS_COLORS[status]}`}
            >
              {STATUS_LABELS[status]}: {count}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
          >
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {recentOrders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {order.customer_name} — {order.tracking_code}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </li>
          ))}
          {recentOrders.length === 0 && (
            <li className="py-4 text-sm text-slate-400">No orders yet.</li>
          )}
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Low Stock</h2>
          <Link
            to="/admin/products"
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
          >
            Manage products →
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {lowStockProducts.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between py-2.5"
            >
              <p className="text-sm font-medium text-slate-900">
                {product.name}
              </p>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  product.stock === 0
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
              </span>
            </li>
          ))}
          {lowStockProducts.length === 0 && (
            <li className="py-4 text-sm text-slate-400">
              All products are well stocked.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
