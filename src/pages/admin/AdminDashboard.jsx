import AdminLayout from '../../components/admin/AdminLayout';
import DashboardStats from '../../components/admin/DashboardStats';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-sm text-slate-500 mb-6">
          Overview of orders, products, and revenue.
        </p>
        <DashboardStats />
      </div>
    </AdminLayout>
  );
}
