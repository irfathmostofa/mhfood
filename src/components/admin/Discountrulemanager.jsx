import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const emptyForm = {
  label: "",
  min_amount: "",
  max_amount: "",
  discount_type: "percentage",
  discount_value: "",
  is_active: true,
};

export default function DiscountRuleManager() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadRules() {
    const { data, error } = await supabase
      .from("discount_rules")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error) setRules(data);
  }

  useEffect(() => {
    loadRules();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(rule) {
    setEditingId(rule.id);
    setForm({
      label: rule.label,
      min_amount: rule.min_amount,
      max_amount: rule.max_amount ?? "",
      discount_type: rule.discount_type,
      discount_value: rule.discount_value,
      is_active: rule.is_active,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.label.trim() ||
      form.min_amount === "" ||
      form.discount_value === ""
    )
      return;
    setLoading(true);
    setError("");

    const payload = {
      label: form.label,
      min_amount: parseFloat(form.min_amount),
      max_amount: form.max_amount === "" ? null : parseFloat(form.max_amount),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase
        .from("discount_rules")
        .update(payload)
        .eq("id", editingId);
      if (error) setError(error.message);
    } else {
      const nextOrder =
        rules.length > 0 ? Math.max(...rules.map((r) => r.sort_order)) + 1 : 0;
      const { error } = await supabase
        .from("discount_rules")
        .insert({ ...payload, sort_order: nextOrder });
      if (error) setError(error.message);
    }

    setLoading(false);
    resetForm();
    loadRules();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this discount rule?")) return;
    await supabase.from("discount_rules").delete().eq("id", id);
    loadRules();
  }

  async function toggleActive(rule) {
    await supabase
      .from("discount_rules")
      .update({ is_active: !rule.is_active })
      .eq("id", rule.id);
    loadRules();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">
        Discount Rules
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Automatic discounts based on order subtotal. If multiple rules match,
        the highest-value one wins.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 mb-6 border border-slate-200 rounded-lg p-4"
      >
        <input
          type="text"
          value={form.label}
          onChange={(e) => updateField("label", e.target.value)}
          placeholder="Label, e.g. Spend ৳1000+, get 10% off"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Min order amount (৳)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.min_amount}
              onChange={(e) => updateField("min_amount", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Max order amount (৳, optional)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.max_amount}
              onChange={(e) => updateField("max_amount", e.target.value)}
              placeholder="No limit"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Discount type
            </label>
            <select
              value={form.discount_type}
              onChange={(e) => updateField("discount_type", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed amount (৳)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              {form.discount_type === "percentage"
                ? "Percentage off"
                : "Amount off (৳)"}
            </label>
            <input
              type="number"
              step="0.01"
              value={form.discount_value}
              onChange={(e) => updateField("discount_value", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors"
          >
            {editingId ? "Update Rule" : "Add Rule"}
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

      <ul className="divide-y divide-slate-100">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className="flex items-center justify-between py-2.5"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{rule.label}</p>
              <p className="text-xs text-slate-400">
                ৳{rule.min_amount} –{" "}
                {rule.max_amount ? `৳${rule.max_amount}` : "no limit"} ·{" "}
                {rule.discount_type === "percentage"
                  ? `${rule.discount_value}% off`
                  : `৳${rule.discount_value} off`}{" "}
                · {rule.is_active ? "Active" : "Hidden"}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => startEdit(rule)}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                Edit
              </button>
              <button
                onClick={() => toggleActive(rule)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                {rule.is_active ? "Hide" : "Show"}
              </button>
              <button
                onClick={() => handleDelete(rule.id)}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {rules.length === 0 && (
          <li className="py-4 text-sm text-slate-400">
            No discount rules yet.
          </li>
        )}
      </ul>
    </div>
  );
}
