import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import CategoryManager from '../../components/admin/CategoryManager';
import ProductManager from '../../components/admin/ProductManager';

export default function AdminProducts() {
  const [tab, setTab] = useState('products');

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Products</h1>
        <p className="text-sm text-slate-500 mb-6">
          Manage categories and products shown on the storefront.
        </p>

        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setTab('products')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'products'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setTab('categories')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'categories'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Categories
          </button>
        </div>

        {tab === 'products' ? <ProductManager /> : <CategoryManager />}
      </div>
    </AdminLayout>
  );
}
