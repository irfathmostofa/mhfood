import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setCategories(data);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    const slug = slugify(name);

    if (editingId) {
      const { error } = await supabase
        .from('categories')
        .update({ name, slug })
        .eq('id', editingId);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from('categories').insert({ name, slug });
      if (error) setError(error.message);
    }

    setLoading(false);
    setName('');
    setEditingId(null);
    loadCategories();
  }

  function startEdit(category) {
    setEditingId(category.id);
    setName(category.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Products in it will keep their data but lose the category link.')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadCategories();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Categories</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors"
        >
          {editingId ? 'Update' : 'Add'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={cancelEdit}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <ul className="divide-y divide-slate-100">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-900">{cat.name}</p>
              <p className="text-xs text-slate-400">{cat.slug}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => startEdit(cat)}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="py-4 text-sm text-slate-400">No categories yet.</li>
        )}
      </ul>
    </div>
  );
}
