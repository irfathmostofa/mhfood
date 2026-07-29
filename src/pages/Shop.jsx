import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingContactButtons from "../components/FloatingContactButtons";
import BackToTop from "../components/BackToTop";
import ProductCard from "../components/ProductCard";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get("instock") === "1",
  );

  // Keep the local search box in sync if the navbar sends a new ?q= here
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(data || []);
    }
    loadCategories();
  }, []);

  // Reflect current filters in the URL so results are shareable / back-button friendly
  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (activeCategory !== "all") params.category = activeCategory;
    if (sort !== "newest") params.sort = sort;
    if (minPrice) params.min = minPrice;
    if (maxPrice) params.max = maxPrice;
    if (inStockOnly) params.instock = "1";
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory, sort, minPrice, maxPrice, inStockOnly]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);

      let q = supabase
        .from("products")
        .select("*, product_images(image_url, sort_order)")
        .eq("is_active", true);

      if (activeCategory !== "all") q = q.eq("category_id", activeCategory);
      if (query.trim()) q = q.ilike("name", `%${query.trim()}%`);
      if (minPrice) q = q.gte("price", Number(minPrice));
      if (maxPrice) q = q.lte("price", Number(maxPrice));
      if (inStockOnly) q = q.gt("stock", 0);

      if (sort === "price_asc") q = q.order("price", { ascending: true });
      else if (sort === "price_desc")
        q = q.order("price", { ascending: false });
      else q = q.order("created_at", { ascending: false });

      const { data: prods } = await q;
      if (cancelled) return;

      if (!prods || prods.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const ids = prods.map((p) => p.id);
      const { data: ratings } = await supabase
        .from("product_ratings")
        .select("*")
        .in("product_id", ids);

      const ratingMap = Object.fromEntries(
        (ratings || []).map((r) => [r.product_id, r]),
      );

      let merged = prods.map((p) => ({
        ...p,
        product_images: [...(p.product_images || [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
        avg_rating: ratingMap[p.id]?.avg_rating || 0,
        review_count: ratingMap[p.id]?.review_count || 0,
      }));

      if (sort === "rating") {
        merged = merged.sort((a, b) => b.avg_rating - a.avg_rating);
      }

      if (!cancelled) {
        setProducts(merged);
        setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, query, sort, minPrice, maxPrice, inStockOnly]);

  function resetFilters() {
    setQuery("");
    setActiveCategory("all");
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
  }

  const activeFilterCount = [
    activeCategory !== "all",
    !!minPrice,
    !!maxPrice,
    inStockOnly,
  ].filter(Boolean).length;

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[#1F2A24] mb-3">
          Price Range (৳)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#E7E0D3] text-sm text-[#1F2A24] outline-none focus:border-[#1F2A24] transition-colors"
          />
          <span className="text-[#8A8578]">–</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#E7E0D3] text-sm text-[#1F2A24] outline-none focus:border-[#1F2A24] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-[#4A5049] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-[#E7E0D3] text-[#1F2A24] focus:ring-0 accent-[#1F2A24]"
          />
          In stock only
        </label>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#1F2A24] mb-3">Category</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              activeCategory === "all"
                ? "bg-[#1F2A24] text-[#FBF8F3]"
                : "text-[#4A5049] hover:bg-[#F3EEE2]"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCategory === cat.id
                  ? "bg-[#1F2A24] text-[#FBF8F3]"
                  : "text-[#4A5049] hover:bg-[#F3EEE2]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="text-sm text-[#C77B4C] hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Navbar />
      <FloatingContactButtons />
      <BackToTop />

      <main className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
          <h1
            className="text-2xl sm:text-3xl text-[#1F2A24]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Shop
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-[#E7E0D3] text-sm text-[#1F2A24] hover:border-[#1F2A24] transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center text-[10px] rounded-full bg-[#C77B4C] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-full border border-[#E7E0D3] text-sm text-[#1F2A24] outline-none focus:border-[#1F2A24] bg-white transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {query && (
          <p className="text-sm text-[#8A8578] mb-6">
            Search results for &ldquo;
            <span className="text-[#1F2A24] font-medium">{query}</span>
            &rdquo;
            <button
              onClick={() => setQuery("")}
              className="ml-2 text-[#C77B4C] hover:underline"
            >
              Clear
            </button>
          </p>
        )}

        <div className="flex gap-8 mt-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 bg-white border border-[#E7E0D3] rounded-2xl p-5">
              {filterPanel}
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <p className="text-sm text-[#8A8578] py-16 text-center">
                Loading products...
              </p>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-[#8A8578] mb-2">
                  No products match your filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="text-sm text-[#C77B4C] hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#8A8578] mb-4">
                  {products.length} product{products.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      <div
        onClick={() => setFiltersOpen(false)}
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 lg:hidden ${
          filtersOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed top-0 left-0 h-full w-full sm:w-96 bg-[#FBF8F3] z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 lg:hidden ${
          filtersOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#E7E0D3] shrink-0">
          <h2
            className="text-lg text-[#1F2A24]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Filters
          </h2>
          <button
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
            className="p-1.5 rounded-full hover:bg-[#F3EEE2] transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1F2A24"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{filterPanel}</div>
        <div className="border-t border-[#E7E0D3] px-5 py-4 shrink-0">
          <button
            onClick={() => setFiltersOpen(false)}
            className="w-full py-3 rounded-full bg-[#1F2A24] text-[#FBF8F3] text-sm font-medium hover:bg-[#2D3A32] transition-colors"
          >
            Show {products.length} result{products.length !== 1 ? "s" : ""}
          </button>
        </div>
      </aside>

      <Footer />
    </div>
  );
}
