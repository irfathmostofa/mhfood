import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "./ProductCard";

const LIMIT = 12;
const AUTOPLAY_MS = 4000;

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false },
    [
      Autoplay({
        delay: AUTOPLAY_MS,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        // Pauses/resumes automatically when the document (tab) visibility
        // changes — this is the built-in, tested replacement for the
        // manual rAF/transitionend bookkeeping we used to do by hand.
        stopOnFocusIn: false,
      }),
    ],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

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

  // Embla needs to re-measure once product count changes (images loading
  // in, list going from empty -> populated, etc). This replaces the old
  // manual useLayoutEffect re-align dance.
  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi, products]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [
    emblaApi,
  ]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [
    emblaApi,
  ]);

  const loopEnabled = products.length > 4;

  if (!loading && products.length === 0) return null;

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
            <NavButton direction="prev" onClick={scrollPrev} />
            <NavButton direction="next" onClick={scrollNext} />
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-[#8A8578] text-center py-10">Loading...</p>
      ) : (
        <div className="relative">
          {/* This is the ONLY element Embla manages. No manual transform,
              no track index, no cloned slides, no transitionend snapping. */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {products.map((product, rank) => (
                <div
                  key={product.id}
                  className="relative shrink-0 px-1.5 sm:px-2.5 basis-1/2 sm:basis-1/3 lg:basis-1/4"
                >
                  {rank < 3 && (
                    <span className="absolute top-2 left-3.5 sm:left-4.5 z-10 px-2 py-0.5 rounded-full bg-[#C77B4C] text-white text-[10px] font-semibold shadow">
                      #{rank + 1} Best Seller
                    </span>
                  )}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {loopEnabled && (
            <div className="sm:hidden flex items-center justify-center gap-3 mt-4">
              <NavButton direction="prev" onClick={scrollPrev} />
              <NavButton direction="next" onClick={scrollNext} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function NavButton({ direction, onClick }) {
  const isPrev = direction === "prev";
  return (
    <button
      onClick={onClick}
      aria-label={isPrev ? "Previous" : "Next"}
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
          d={isPrev ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}