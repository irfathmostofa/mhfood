import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import CustomersTable from "../../components/admin/Customerstable";
import BulkSmsPanel from "../../components/admin/Bulksmspanel";
import { useCustomers } from "../../hooks/Usecustomers";

export default function AdminCustomers() {
  const { customers, loading, error } = useCustomers();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email?.toLowerCase().includes(q),
    );
  }, [customers, search]);

  function toggleOne(phone) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  }

  function toggleAllFiltered(checked) {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((c) => {
        if (checked) next.add(c.phone);
        else next.delete(c.phone);
      });
      return next;
    });
  }

  const selectedCustomers = customers.filter((c) => selected.has(c.phone));

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Customers</h1>
          <p className="text-sm text-slate-500">
            Unique customers derived from your orders, identified by phone
            number.
          </p>
        </div>

        <CustomersTable
          customers={filtered}
          loading={loading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          selected={selected}
          onToggleOne={toggleOne}
          onToggleAll={toggleAllFiltered}
        />
        <BulkSmsPanel
          allCustomers={customers}
          selectedCustomers={selectedCustomers}
        />
      </div>
    </AdminLayout>
  );
}
