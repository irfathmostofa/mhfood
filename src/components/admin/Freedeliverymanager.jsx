import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function FreeDeliveryManager() {
  const [form, setForm] = useState({
    free_delivery_enabled: false,
    free_delivery_threshold: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (data) {
        setForm({
          free_delivery_enabled: data.free_delivery_enabled,
          free_delivery_threshold: data.free_delivery_threshold || "",
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
    setError("");

    const { error } = await supabase
      .from("site_settings")
      .update({
        free_delivery_enabled: form.free_delivery_enabled,
        free_delivery_threshold: parseFloat(form.free_delivery_threshold) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

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
      <h2 className="text-lg font-semibold text-slate-900 mb-1">
        Free Delivery
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Waive the delivery charge automatically once the order subtotal reaches
        this amount.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.free_delivery_enabled}
            onChange={(e) =>
              updateField("free_delivery_enabled", e.target.checked)
            }
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Enable free delivery threshold
        </label>

        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Minimum subtotal for free delivery (৳)
          </label>
          <input
            type="number"
            step="0.01"
            value={form.free_delivery_threshold}
            onChange={(e) =>
              updateField("free_delivery_threshold", e.target.value)
            }
            disabled={!form.free_delivery_enabled}
            placeholder="e.g. 1500"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-emerald-600">Settings saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
