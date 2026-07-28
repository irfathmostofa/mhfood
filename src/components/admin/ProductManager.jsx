import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

const emptyForm = {
  name: '',
  category_id: '',
  description: '',
  price: '',
  stock: '',
  is_featured: false,
  is_active: true,
};

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase
        .from('products')
        .select('*, categories(name), product_images(id, image_url, sort_order)')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    if (prods) setProducts(prods);
    if (cats) setCategories(cats);
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category_id: product.category_id || '',
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setExistingImages(product.product_images || []);
    setFiles([]);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFiles([]);
    setExistingImages([]);
  }

  async function uploadImages(productId) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop();
      const path = `${productId}/${Date.now()}-${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file);

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);

      await supabase.from('product_images').insert({
        product_id: productId,
        image_url: urlData.publicUrl,
        sort_order: i,
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;
    setLoading(true);
    setError('');

    const payload = {
      name: form.name,
      slug: slugify(form.name),
      category_id: form.category_id || null,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10) || 0,
      is_featured: form.is_featured,
      is_active: form.is_active,
    };

    let productId = editingId;

    if (editingId) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId);
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();
      if (error) setError(error.message);
      else productId = data.id;
    }

    if (productId && files.length > 0) {
      await uploadImages(productId);
    }

    setLoading(false);
    resetForm();
    loadData();
  }

  async function handleDeleteProduct(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await supabase.from('products').delete().eq('id', id);
    loadData();
  }

  async function handleDeleteImage(imageId) {
    await supabase.from('product_images').delete().eq('id', imageId);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {editingId ? 'Edit Product' : 'Add Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => updateField('category_id', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price (৳)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => updateField('stock', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => updateField('is_featured', e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Active (visible on storefront)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="w-full text-sm text-slate-600"
            />
            {files.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">{files.length} file(s) selected</p>
            )}
          </div>

          {existingImages.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Current images</p>
              <div className="flex gap-2 flex-wrap">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.image_url}
                      alt=""
                      className="w-16 h-16 object-cover rounded-md border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs leading-5"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors"
            >
              {loading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Products ({products.length})
        </h2>
        <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <img
                src={p.product_images?.[0]?.image_url || 'https://placehold.co/60x60?text=No+Image'}
                alt=""
                className="w-12 h-12 object-cover rounded-md border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                <p className="text-xs text-slate-400">
                  ৳{p.price} · Stock: {p.stock} · {p.categories?.name || 'Uncategorized'}
                  {!p.is_active && ' · Hidden'}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => startEdit(p)}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(p.id)}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {products.length === 0 && (
            <li className="py-4 text-sm text-slate-400">No products yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
