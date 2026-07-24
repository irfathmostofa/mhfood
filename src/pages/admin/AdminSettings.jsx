import AdminLayout from "../../components/admin/AdminLayout";
import ContactSettingsManager from "../../components/admin/ContactSettingsManager";
import DeliveryZoneManager from "../../components/admin/Deliveryzonemanager";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="p-4 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Settings</h1>
          <p className="text-sm text-slate-500">
            Site-wide configuration for the storefront.
          </p>
        </div>
        <DeliveryZoneManager />
        <ContactSettingsManager />
      </div>
    </AdminLayout>
  );
}
