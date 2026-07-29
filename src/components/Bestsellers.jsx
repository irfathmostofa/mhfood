import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "./ProductCard";

const LIMIT = 12;

function getItemsPerView() {
  if (typeof window === "undefined") return 4;
  const w = window.innerWidth;
  if (w >= 1024) return 4; // lg
  if (w >= 640) return 3; // sm
  return 2; // mobile
}

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(getItemsPerView);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      // Rank products by total units actually sold
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity");

      const soldMap = {};
      (items || []).forEach((it) => {
        soldMap[it.product_id] = (soldMap[it.product_id] || 0) + it.quantity;
      });

      const soldIds = Object.entries(soldMap)
        .filter(([, qty]) => qty > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, LIMIT)
        .map(([id]) => id);

      if (soldIds.length === 0) {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("products")
        .select("*, product_images(image_url, sort_order)")
        .in("id", soldIds)
        .eq("is_active", true);

      const prods = (data || []).sort(
        (a, b) => (soldMap[b.id] || 0) - (soldMap[a.id] || 0),
      );

      if (prods.length === 0) {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
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

      const merged = prods.map((p) => ({
        ...p,
        product_images: [...(p.product_images || [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
        avg_rating: ratingMap[p.id]?.avg_rating || 0,
        review_count: ratingMap[p.id]?.review_count || 0,
        units_sold: soldMap[p.id] || 0,
      }));

      if (!cancelled) {
        setProducts(merged);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep items-per-view in sync with viewport width
  useEffect(() => {
    function handleResize() {
      setItemsPerView(getItemsPerView());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerView);

  // Clamp index whenever the viewport or product count changes
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  // Auto-advance, looping back to the start; pauses on hover/touch/manual nav
  useEffect(() => {
    if (maxIndex <= 0 || isPaused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [maxIndex, isPaused, resetKey]);

  function goPrev() {
    setIndex((i) => Math.max(0, i - 1));
    setResetKey((k) => k + 1);
  }

  function goNext() {
    setIndex((i) => Math.min(maxIndex, i + 1));
    setResetKey((k) => k + 1);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) {
      setIsPaused(false);
      return;
    }
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 40) goPrev();
    else if (delta < -40) goNext();
    touchStartX.current = null;
    setIsPaused(false);
  }

  if (!loading && products.length === 0) return null;

  const canPrev = index > 0;
  const canNext = index < maxIndex;
  const slideWidth = 100 / itemsPerView;

  return (
    <section className="max-w-7xl mx-auto px-5 py-8">
      <div className="flex items-end justify-between mb-5">
        <div className="px-1.5 sm:px-2.5">
          <h2
            className="text-2xl sm:text-3xl text-[#1F2A24]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Best Selling Products
          </h2>
          <p className="text-sm text-[#8A8578] mt-1">
            Our customers' favorites
          </p>
        </div>

        {!loading && products.length > itemsPerView && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Previous"
              className="p-2 rounded-full border border-[#E7E0D3] text-[#1F2A24] hover:border-[#1F2A24] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#E7E0D3] transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={goNext}
              disabled={!canNext}
              aria-label="Next"
              className="p-2 rounded-full border border-[#E7E0D3] text-[#1F2A24] hover:border-[#1F2A24] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#E7E0D3] transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M9 18l6-6-6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-[#8A8578] text-center py-10">Loading...</p>
      ) : (
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${index * slideWidth}%)` }}
            >
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="relative shrink-0 px-1.5 sm:px-2.5"
                  style={{ width: `${slideWidth}%` }}
                >
                  {i < 3 && (
                    <span className="absolute top-2 left-3.5 sm:left-4.5 z-10 px-2 py-0.5 rounded-full bg-[#C77B4C] text-white text-[10px] font-semibold shadow">
                      #{i + 1} Best Seller
                    </span>
                  )}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile prev/next — overlaid on the edges since arrows above are desktop-only */}
          {products.length > itemsPerView && (
            <div className="sm:hidden flex items-center justify-center gap-3 mt-4">
              <button
                onClick={goPrev}
                disabled={!canPrev}
                aria-label="Previous"
                className="p-2 rounded-full border border-[#E7E0D3] text-[#1F2A24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={goNext}
                disabled={!canNext}
                aria-label="Next"
                className="p-2 rounded-full border border-[#E7E0D3] text-[#1F2A24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
