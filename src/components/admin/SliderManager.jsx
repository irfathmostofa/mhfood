import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const emptyForm = { title: '', subtitle: '', link_url: '', is_active: true };

export default function SliderManager() {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadSlides() {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error) setSlides(data);
  }

  useEffect(() => {
    loadSlides();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(slide) {
    setEditingId(slide.id);
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      link_url: slide.link_url || '',
      is_active: slide.is_active,
    });
    setFile(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!editingId && !file) {
      setError('Please choose an image for the slide.');
      return;
    }
    setLoading(true);
    setError('');

    let imageUrl = null;

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('hero-slides')
        .upload(path, file);

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('hero-slides').getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    if (editingId) {
      const payload = { ...form };
      if (imageUrl) payload.image_url = imageUrl;
      const { error } = await supabase.from('hero_slides').update(payload).eq('id', editingId);
      if (error) setError(error.message);
    } else {
      const nextOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.sort_order)) + 1 : 0;
      const { error } = await supabase.from('hero_slides').insert({
        ...form,
        image_url: imageUrl,
        sort_order: nextOrder,
      });
      if (error) setError(error.message);
    }

    setLoading(false);
    resetForm();
    loadSlides();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this slide?')) return;
    await supabase.from('hero_slides').delete().eq('id', id);
    loadSlides();
  }

  async function toggleActive(slide) {
    await supabase
      .from('hero_slides')
      .update({ is_active: !slide.is_active })
      .eq('id', slide.id);
    loadSlides();
  }

  async function move(slide, direction) {
    const index = slides.findIndex((s) => s.id === slide.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= slides.length) return;

    const other = slides[swapIndex];

    await Promise.all([
      supabase.from('hero_slides').update({ sort_order: other.sort_order }).eq('id', slide.id),
      supabase.from('hero_slides').update({ sort_order: slide.sort_order }).eq('id', other.id),
    ]);

    loadSlides();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {editingId ? 'Edit Slide' : 'Add Slide'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slide Image {editingId && '(leave empty to keep current)'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="w-full text-sm text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subtitle (optional)
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Link URL (optional — e.g. a product or category page)
            </label>
            <input
              type="text"
              value={form.link_url}
              onChange={(e) => updateField('link_url', e.target.value)}
              placeholder="/product/some-product"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => updateField('is_active', e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Active (visible on landing page)
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors"
            >
              {loading ? 'Saving...' : editingId ? 'Update Slide' : 'Add Slide'}
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Slides ({slides.length})
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Order shown here matches the order on the landing page.
        </p>
        <ul className="divide-y divide-slate-100">
          {slides.map((slide, i) => (
            <li key={slide.id} className="flex items-center gap-3 py-3">
              <img
                src={slide.image_url || 'https://placehold.co/80x50?text=No+Image'}
                alt=""
                className="w-20 h-12 object-cover rounded-md border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {slide.title || '(no title)'}
                </p>
                <p className="text-xs text-slate-400">
                  {slide.is_active ? 'Active' : 'Hidden'}
                </p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => move(slide, 'up')}
                  disabled={i === 0}
                  className="text-xs text-slate-500 disabled:opacity-30 hover:text-slate-800"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(slide, 'down')}
                  disabled={i === slides.length - 1}
                  className="text-xs text-slate-500 disabled:opacity-30 hover:text-slate-800"
                >
                  ↓
                </button>
              </div>
              <div className="flex flex-col gap-1 items-end shrink-0">
                <button
                  onClick={() => startEdit(slide)}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(slide)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  {slide.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {slides.length === 0 && (
            <li className="py-4 text-sm text-slate-400">No slides yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
