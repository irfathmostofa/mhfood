import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "./ProductCard";

const LIMIT = 12;
const AUTOPLAY_MS = 4000;

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

  // `track` is the slide index in the padded/cloned strip's own coordinates.
  const [track, setTrack] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
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

  const loopEnabled = products.length > itemsPerView;

  // Re-align the strip to the start (real slide 0) whenever the product set
  // or items-per-view changes — instantly, with no visible transition.
  useEffect(() => {
    setTransitionEnabled(false);
    setTrack(loopEnabled ? itemsPerView : 0);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setTransitionEnabled(true));
    });
    return () => cancelAnimationFrame(raf1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, itemsPerView, loopEnabled]);

  // Auto-advance forever; pauses on hover/touch/manual nav
  useEffect(() => {
    if (!loopEnabled || isPaused) return;
    const timer = setInterval(() => {
      setTransitionEnabled(true);
      setTrack((t) => t + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [loopEnabled, isPaused, resetKey]);

  // Once a clone has fully scrolled into view, snap back to the matching
  // real slide with no transition — since the clone is visually identical,
  // the snap is invisible and the motion reads as continuous.
  function handleTransitionEnd() {
    if (!loopEnabled) return;
    if (track >= itemsPerView + products.length) {
      snapTo(track - products.length);
    } else if (track < itemsPerView) {
      snapTo(track + products.length);
    }
  }

  function snapTo(newTrack) {
    setTransitionEnabled(false);
    setTrack(newTrack);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTransitionEnabled(true));
    });
  }

  function goPrev() {
    if (!loopEnabled) return;
    setTransitionEnabled(true);
    setTrack((t) => t - 1);
    setResetKey((k) => k + 1);
  }

  function goNext() {
    if (!loopEnabled) return;
    setTransitionEnabled(true);
    setTrack((t) => t + 1);
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

  const slideWidth = 100 / itemsPerView;

  // Pad the strip with clones of the tail/head so sliding past either end
  // keeps revealing real-looking cards instead of jumping.
  const slides = loopEnabled
    ? [
        ...products
          .slice(-itemsPerView)
          .map((p, i) => ({ product: p, key: `head-clone-${i}` })),
        ...products.map((p) => ({ product: p, key: p.id })),
        ...products
          .slice(0, itemsPerView)
          .map((p, i) => ({ product: p, key: `tail-clone-${i}` })),
      ]
    : products.map((p) => ({ product: p, key: p.id }));

  const rankById = new Map(products.map((p, i) => [p.id, i]));

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

        {!loading && loopEnabled && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={goPrev}
              aria-label="Previous"
              className="p-2 rounded-full border border-[#E7E0D3] text-[#1F2A24] hover:border-[#1F2A24] transition-colors"
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
              aria-label="Next"
              className="p-2 rounded-full border border-[#E7E0D3] text-[#1F2A24] hover:border-[#1F2A24] transition-colors"
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
              className={`flex ${transitionEnabled ? "transition-transform duration-500 ease-out" : ""}`}
              style={{ transform: `translateX(-${track * slideWidth}%)` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {slides.map(({ product, key }) => {
                const rank = rankById.get(product.id);
                return (
                  <div
                    key={key}
                    className="relative shrink-0 px-1.5 sm:px-2.5"
                    style={{ width: `${slideWidth}%` }}
                  >
                    {rank < 3 && (
                      <span className="absolute top-2 left-3.5 sm:left-4.5 z-10 px-2 py-0.5 rounded-full bg-[#C77B4C] text-white text-[10px] font-semibold shadow">
                        #{rank + 1} Best Seller
                      </span>
                    )}
                    <ProductCard product={product} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile prev/next — overlaid below since arrows above are desktop-only */}
          {loopEnabled && (
            <div className="sm:hidden flex items-center justify-center gap-3 mt-4">
              <button
                onClick={goPrev}
                aria-label="Previous"
                className="p-2 rounded-full border border-[#E7E0D3] text-[#1F2A24] transition-colors"
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
                aria-label="Next"
                className="p-2 rounded-full border border-[#E7E0D3] text-[#1F2A24] transition-colors"
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
