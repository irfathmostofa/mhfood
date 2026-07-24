import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function loadSlides() {
      const { data } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setSlides(data || []);
    }
    loadSlides();
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <div className="relative w-full h-[280px] sm:h-[420px] lg:h-[520px] overflow-hidden bg-[#EFE8D8]">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={s.image_url}
            alt={s.title || ""}
            className="w-full h-full "
          />
          {(s.title || s.subtitle) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end">
              <div className="max-w-6xl mx-auto w-full px-5 sm:px-10 pb-8 sm:pb-12">
                <div className="text-white max-w-lg">
                  {s.title && (
                    <h2
                      className="text-2xl sm:text-4xl font-medium mb-2"
                      style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                    >
                      {s.title}
                    </h2>
                  )}
                  {s.subtitle && (
                    <p className="text-sm sm:text-base text-white/90">
                      {s.subtitle}
                    </p>
                  )}
                  {s.link_url && (
                    <a
                      href={s.link_url}
                      className="inline-block mt-4 px-5 py-2 bg-white text-[#1F2A24] text-sm font-medium rounded-full hover:bg-[#FBF8F3] transition-colors"
                    >
                      Shop now
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-white w-5" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
