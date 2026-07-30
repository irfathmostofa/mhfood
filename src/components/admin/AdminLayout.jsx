import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const navItems = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/slider", label: "Hero Slider" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/settings", label: "Settings" },
  { to: "/", label: "Visit Website" },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  function handleNavClick() {
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-slate-900 text-white flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="p-2 -ml-2 rounded-md hover:bg-slate-800"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
        <span className="font-semibold text-sm tracking-tight">
          Admin Panel
        </span>
        <div className="w-8" />
      </div>

      {/* Overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static column on desktop */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 shrink-0 bg-slate-900 text-slate-300 flex flex-col transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 text-white font-semibold text-lg tracking-tight border-b border-slate-800 flex items-center justify-between">
          Admin Panel
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1 -mr-1 rounded-md hover:bg-slate-800"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
