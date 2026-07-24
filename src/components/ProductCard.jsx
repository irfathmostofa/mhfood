import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const image = product.product_images?.[0]?.image_url;
  const rating = product.avg_rating;
  const reviewCount = product.review_count;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-[#E7E0D3] hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-[#F3EEE2] overflow-hidden">
        <img
          src={image || 'https://placehold.co/400x400?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <p className="text-sm font-medium text-[#1F2A24] truncate">{product.name}</p>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-sm font-semibold text-[#C77B4C]">৳{product.price}</p>
          {reviewCount > 0 && (
            <p className="text-xs text-[#8A8578] flex items-center gap-1">
              ★ {rating} ({reviewCount})
            </p>
          )}
        </div>
        {product.stock === 0 && (
          <p className="text-xs text-red-500 mt-1">Out of stock</p>
        )}
      </div>
    </Link>
  );
}
