import AdminLayout from '../../components/admin/AdminLayout';
import SliderManager from '../../components/admin/SliderManager';

export default function AdminSlider() {
  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Hero Slider</h1>
        <p className="text-sm text-slate-500 mb-6">
          Manage the slides shown at the top of the landing page.
        </p>
        <SliderManager />
      </div>
    </AdminLayout>
  );
}
