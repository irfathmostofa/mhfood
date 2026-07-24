import AdminLayout from '../../components/admin/AdminLayout';
import ContactSettingsManager from '../../components/admin/ContactSettingsManager';

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Settings</h1>
        <p className="text-sm text-slate-500 mb-6">
          Site-wide configuration for the storefront.
        </p>
        <ContactSettingsManager />
      </div>
    </AdminLayout>
  );
}
