import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const emptyForm = { name: "", charge: "", is_active: true };

export default function DeliveryZoneManager() {
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadZones() {
    const { data, error } = await supabase
      .from("delivery_zones")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error) setZones(data);
  }

  useEffect(() => {
    loadZones();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(zone) {
    setEditingId(zone.id);
    setForm({
      name: zone.name,
      charge: zone.charge,
      is_active: zone.is_active,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || form.charge === "") return;
    setLoading(true);
    setError("");

    const payload = {
      name: form.name,
      charge: parseFloat(form.charge),
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase
        .from("delivery_zones")
        .update(payload)
        .eq("id", editingId);
      if (error) setError(error.message);
    } else {
      const nextOrder =
        zones.length > 0 ? Math.max(...zones.map((z) => z.sort_order)) + 1 : 0;
      const { error } = await supabase
        .from("delivery_zones")
        .insert({ ...payload, sort_order: nextOrder });
      if (error) setError(error.message);
    }

    setLoading(false);
    resetForm();
    loadZones();
  }

  async function handleDelete(id) {
    if (
      !confirm(
        "Delete this delivery zone? Existing orders will keep their recorded charge.",
      )
    )
      return;
    await supabase.from("delivery_zones").delete().eq("id", id);
    loadZones();
  }

  async function toggleActive(zone) {
    await supabase
      .from("delivery_zones")
      .update({ is_active: !zone.is_active })
      .eq("id", zone.id);
    loadZones();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-xl">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">
        Delivery Zones
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Customers pick one of these at checkout. Only active zones appear on the
        storefront.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 mb-6"
      >
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Zone name, e.g. Chittagong City"
          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="number"
          step="0.01"
          value={form.charge}
          onChange={(e) => updateField("charge", e.target.value)}
          placeholder="Charge (৳)"
          className="w-full sm:w-32 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors"
        >
          {editingId ? "Update" : "Add"}
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
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <ul className="divide-y divide-slate-100">
        {zones.map((zone) => (
          <li
            key={zone.id}
            className="flex items-center justify-between py-2.5"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{zone.name}</p>
              <p className="text-xs text-slate-400">
                ৳{zone.charge} · {zone.is_active ? "Active" : "Hidden"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => startEdit(zone)}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                Edit
              </button>
              <button
                onClick={() => toggleActive(zone)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                {zone.is_active ? "Hide" : "Show"}
              </button>
              <button
                onClick={() => handleDelete(zone.id)}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {zones.length === 0 && (
          <li className="py-4 text-sm text-slate-400">
            No delivery zones yet.
          </li>
        )}
      </ul>
    </div>
  );
}
