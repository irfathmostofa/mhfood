import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const image = product.product_images?.[0]?.image_url;
  const rating = product.avg_rating;
  const reviewCount = product.review_count;
  const outOfStock = product.stock === 0;

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    navigate('/checkout');
  }

  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-[#E7E0D3] hover:shadow-md transition-shadow flex flex-col">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-square bg-[#F3EEE2] overflow-hidden">
          <img
            src={image || 'https://placehold.co/400x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4 pb-2">
          <p className="text-sm font-medium text-[#1F2A24] truncate">{product.name}</p>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-sm font-semibold text-[#C77B4C]">৳{product.price}</p>
            {reviewCount > 0 && (
              <p className="text-xs text-[#8A8578] flex items-center gap-1">
                ★ {rating} ({reviewCount})
              </p>
            )}
          </div>
          {outOfStock && <p className="text-xs text-red-500 mt-1">Out of stock</p>}
        </div>
      </Link>

      <div className="px-4 pb-4 mt-auto flex gap-2">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex-1 px-2 py-2 rounded-full border border-[#1F2A24] text-[#1F2A24] text-xs font-medium hover:bg-[#F3EEE2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {added ? 'Added ✓' : 'Add to Cart'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 px-2 py-2 rounded-full bg-[#1F2A24] text-[#FBF8F3] text-xs font-medium hover:bg-[#2D3A32] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
