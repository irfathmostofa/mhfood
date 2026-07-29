import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setSearchOpen(false);
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <img
              src="/mhfood.png"
              alt="MHFood"
              className="h-12 w-auto transition-transform duration-200 group-hover:scale-105"
            />
            <span className="text-xl font-semibold text-gray-900 hidden sm:block">
              MH<span className="text-amber-600">Food</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link
              to="/shop"
              className="hover:text-gray-900 transition-colors relative group"
            >
              Shop
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/track"
              className="hover:text-gray-900 transition-colors relative group"
            >
              Track Order
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
            </Link>
            {/* <Link
              to="/about"
              className="hover:text-gray-900 transition-colors relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
            </Link> */}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400 group-focus-within:text-amber-600 transition-colors"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute inset-y-0 right-12 flex items-center pr-2"
                  >
                    <span className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-2"
                >
                  <span className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors">
                    Search
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mobile Search Toggle */}
            <button
              id="search-toggle"
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
              aria-label="Toggle search"
            >
              {searchOpen ? (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              ) : (
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
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-all group"
            >
              <span className="relative">
                <svg
                  className="h-5 w-5 group-hover:scale-110 transition-transform"
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
                  <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-amber-600 text-white shadow-lg ring-2 ring-white animate-pulse">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Expands inline */}
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
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1.5">
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
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
      </div>
    </header>
  );
}
