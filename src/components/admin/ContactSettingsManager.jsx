import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ContactSettingsManager() {
  const [form, setForm] = useState({
    whatsapp_number: '',
    whatsapp_enabled: false,
    messenger_link: '',
    messenger_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      if (data) {
        setForm({
          whatsapp_number: data.whatsapp_number || '',
          whatsapp_enabled: data.whatsapp_enabled,
          messenger_link: data.messenger_link || '',
          messenger_enabled: data.messenger_enabled,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { error } = await supabase
      .from('site_settings')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', 1);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading settings...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-xl">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Floating Contact Buttons</h2>
      <p className="text-sm text-slate-500 mb-6">
        Controls the WhatsApp and Messenger buttons shown on the storefront.
      </p>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="border border-slate-200 rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
            <input
              type="checkbox"
              checked={form.whatsapp_enabled}
              onChange={(e) => updateField('whatsapp_enabled', e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Show WhatsApp button (bottom right)
          </label>
          <label className="block text-xs text-slate-500 mb-1">
            WhatsApp number (with country code, no + or spaces)
          </label>
          <input
            type="text"
            value={form.whatsapp_number}
            onChange={(e) => updateField('whatsapp_number', e.target.value)}
            placeholder="8801XXXXXXXXX"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
            <input
              type="checkbox"
              checked={form.messenger_enabled}
              onChange={(e) => updateField('messenger_enabled', e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Show Messenger button (bottom left)
          </label>
          <label className="block text-xs text-slate-500 mb-1">
            Messenger link (e.g. https://m.me/yourpage)
          </label>
          <input
            type="text"
            value={form.messenger_link}
            onChange={(e) => updateField('messenger_link', e.target.value)}
            placeholder="https://m.me/yourpage"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-emerald-600">Settings saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
