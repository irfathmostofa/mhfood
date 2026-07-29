import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../hooks/useCart";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingContactButtons from "../components/FloatingContactButtons";
import BackToTop from "../components/BackToTop";
import StarRating from "../components/StarRating";
import ReviewsList from "../components/ReviewsList";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [ratingInfo, setRatingInfo] = useState({
    avg_rating: 0,
    review_count: 0,
  });
  const [orderCount, setOrderCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [addedMsg, setAddedMsg] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: prod, error } = await supabase
        .from("products")
        .select(
          "*, categories(name), product_images(id, image_url, sort_order)",
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error || !prod) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProduct(prod);
      setImages(
        [...(prod.product_images || [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      );

      const [{ data: rating }, { data: reviewRows }, { data: countRow }] =
        await Promise.all([
          supabase
            .from("product_ratings")
            .select("*")
            .eq("product_id", prod.id)
            .maybeSingle(),
          supabase
            .from("reviews")
            .select("*")
            .eq("product_id", prod.id)
            .eq("approved", true)
            .order("created_at", { ascending: false }),
          supabase
            .from("product_order_counts")
            .select("*")
            .eq("product_id", prod.id)
            .maybeSingle(),
        ]);

      if (rating) setRatingInfo(rating);
      setReviews(reviewRows || []);
      setOrderCount(countRow?.total_sold || 0);

      setLoading(false);
    }

    load();
  }, [slug]);

  function handleAddToCart() {
    addItem(product, quantity);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
  }

  function handleBuyNow() {
    addItem(product, quantity);
    navigate("/checkout");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF8F3]">
        <Navbar />
        <FloatingContactButtons />
        <BackToTop />
        <p className="text-center text-sm text-[#8A8578] py-24">Loading...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FBF8F3]">
        <Navbar />
        <FloatingContactButtons />
        <BackToTop />
        <div className="text-center py-24">
          <p className="text-lg text-[#1F2A24] mb-2">Product not found</p>
          <p className="text-sm text-[#8A8578]">
            It may be unavailable or no longer exists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Navbar />
      <FloatingContactButtons />
      <BackToTop />

      <main className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image gallery */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#F3EEE2] mb-3">
              <img
                src={
                  images[activeImage]?.image_url ||
                  "https://placehold.co/600x600?text=No+Image"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImage
                        ? "border-[#1F2A24]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.categories?.name && (
              <p className="text-xs uppercase tracking-wide text-[#8A8578] mb-2">
                {product.categories.name}
              </p>
            )}
            <h1
              className="text-2xl sm:text-3xl text-[#1F2A24] mb-3"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={ratingInfo.avg_rating} />
              <span className="text-sm text-[#8A8578]">
                {ratingInfo.review_count} review
                {ratingInfo.review_count === 1 ? "" : "s"}
              </span>
              {orderCount > 0 && (
                <span className="text-sm text-[#8A8578]">
                  · {orderCount} sold
                </span>
              )}
            </div>

            <p className="text-2xl font-semibold text-[#C77B4C] mb-4">
              ৳{product.price}
            </p>

            {product.description && (
              <p className="text-sm text-[#4A5049] leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {product.stock === 0 ? (
              <p className="text-sm font-medium text-red-500 mb-4">
                Out of stock
              </p>
            ) : (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center border border-[#E7E0D3] rounded-full">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-[#1F2A24] hover:bg-[#F3EEE2] rounded-full transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="w-9 h-9 flex items-center justify-center text-[#1F2A24] hover:bg-[#F3EEE2] rounded-full transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#8A8578]">
                  {product.stock} in stock
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 px-6 py-3 rounded-full border border-[#1F2A24] text-[#1F2A24] text-sm font-medium hover:bg-[#F3EEE2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {addedMsg ? "Added ✓" : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 px-6 py-3 rounded-full bg-[#1F2A24] text-[#FBF8F3] text-sm font-medium hover:bg-[#2D3A32] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16 max-w-2xl">
          <h2
            className="text-xl text-[#1F2A24] mb-6"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Reviews
          </h2>
          <ReviewsList
            reviews={reviews}
            avgRating={ratingInfo.avg_rating}
            reviewCount={ratingInfo.review_count}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
