import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const desktopSearchRef = useRef(null);

  const navLinks = [
    { to: "/shop", label: "Shop" },
    { to: "/track", label: "Track Order" },
  ];

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        const searchButton = document.getElementById("search-toggle");
        if (searchButton && !searchButton.contains(e.target)) {
          setSearchOpen(false);
        }
      }
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target)
      ) {
        const desktopButton = document.getElementById("desktop-search-toggle");
        if (!desktopButton || !desktopButton.contains(e.target)) {
          // collapse only if empty, so a typed query doesn't vanish on stray clicks
          if (!query) setSearchOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  function toggleMenu() {
    setSearchOpen(false);
    setMenuOpen((v) => !v);
  }

  function toggleSearch() {
    setMenuOpen(false);
    setSearchOpen((v) => !v);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= DESKTOP ================= */}
        <div className="hidden md:grid grid-cols-3 items-center h-20">
          {/* Left: nav links + inline expanding search */}
          <div className="flex items-center gap-8">
            <nav className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative group text-[13px] font-medium uppercase tracking-[0.08em] text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap py-1"
                >
                  {link.label}
                  <span className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 bg-amber-600 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <div ref={desktopSearchRef} className="flex items-center">
              <button
                id="desktop-search-toggle"
                onClick={toggleSearch}
                aria-label="Toggle search"
                aria-expanded={searchOpen}
                className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
                  searchOpen
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                </svg>
              </button>

              <form
                onSubmit={handleSearchSubmit}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  searchOpen ? "w-44 ml-2 opacity-100" : "w-0 ml-0 opacity-0"
                }`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  aria-label="Search for products"
                  className="w-44 bg-transparent border-b border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-600 transition-colors py-1"
                />
              </form>
            </div>
          </div>

          {/* Center: logo, standalone */}
          <Link to="/" className="flex items-center justify-center gap-2">
            <img src="/mhfood.png" alt="MHFood" className="h-11 w-auto" />
            <span className="text-lg font-semibold tracking-tight text-gray-900">
              MH<span className="text-amber-600">Food</span>
            </span>
          </Link>

          {/* Right: cart, cleanly isolated */}
          <div className="flex items-center justify-end">
            <button
              onClick={openCart}
              className="group relative flex items-center gap-2 pl-3 pr-4 py-2 rounded-full border border-gray-200 hover:border-gray-900 transition-colors"
              aria-label="Open cart"
            >
              <span className="relative">
                <svg
                  className="h-4 w-4 text-gray-700 group-hover:text-gray-900 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="9"
                    cy="21"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                  <circle
                    cx="19"
                    cy="21"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                  <path
                    d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L20 8H6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-semibold rounded-full bg-amber-600 text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </span>
              <span className="text-[13px] font-medium uppercase tracking-[0.06em] text-gray-700 group-hover:text-gray-900">
                Cart
              </span>
            </button>
          </div>
        </div>

        {/* ================= MOBILE (unchanged) ================= */}
        <div className="md:hidden flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/mhfood.png"
              alt="MHFood"
              className="h-10 sm:h-12 w-auto"
            />
            <span className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 hidden sm:block">
              MH<span className="text-amber-600">Food</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              id="search-toggle"
              onClick={toggleSearch}
              className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
              aria-label="Toggle search"
              aria-expanded={searchOpen}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
            </button>

            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
              aria-label="Open cart"
            >
              <span className="relative">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="9"
                    cy="21"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                  <circle
                    cx="19"
                    cy="21"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                  <path
                    d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L20 8H6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-amber-600 text-white ring-2 ring-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={toggleMenu}
              className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {menuOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div
          ref={searchContainerRef}
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            searchOpen ? "max-h-24 opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products..."
                aria-label="Search for products"
                className="w-full pl-10 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1.5">
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg
                      className="h-4 w-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Mobile Nav Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100 ${
            menuOpen
              ? "max-h-40 opacity-100 py-2"
              : "max-h-0 opacity-0 border-t-0"
          }`}
        >
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="px-2 py-3 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
