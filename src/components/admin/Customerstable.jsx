export default function CustomersTable({
  customers,
  loading,
  error,
  search,
  onSearchChange,
  selected,
  onToggleOne,
  onToggleAll,
}) {
  const allFilteredSelected =
    customers.length > 0 && customers.every((c) => selected.has(c.phone));

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="w-full sm:max-w-xs px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
        />
        <p className="text-xs text-slate-400 sm:ml-auto">
          {selected.size > 0
            ? `${selected.size} selected`
            : `${customers.length} customer${customers.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border-b border-red-200 px-5 py-3">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide border-b border-slate-200">
              <th className="px-5 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-emerald-600"
                  aria-label="Select all"
                />
              </th>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3 hidden md:table-cell">Email</th>
              <th className="px-3 py-3 text-right">Orders</th>
              <th className="px-3 py-3 text-right">Total Spent</th>
              <th className="px-3 py-3 hidden sm:table-cell">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr
                key={c.phone}
                className={selected.has(c.phone) ? "bg-emerald-50/50" : ""}
              >
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(c.phone)}
                    onChange={() => onToggleOne(c.phone)}
                    className="w-4 h-4 rounded border-slate-300 accent-emerald-600"
                    aria-label={`Select ${c.name}`}
                  />
                </td>
                <td className="px-3 py-3 font-medium text-slate-900">
                  {c.name}
                </td>
                <td className="px-3 py-3 text-slate-600">{c.phone}</td>
                <td className="px-3 py-3 text-slate-600 hidden md:table-cell">
                  {c.email || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-3 py-3 text-right text-slate-600">
                  {c.orderCount}
                </td>
                <td className="px-3 py-3 text-right font-medium text-slate-900">
                  ৳{c.totalSpent.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-slate-500 hidden sm:table-cell">
                  {new Date(c.lastOrderAt).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {!loading && customers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-slate-400"
                >
                  No customers match your search.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-slate-400"
                >
                  Loading customers...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
