import StarRating from './StarRating';

export default function ReviewsList({ reviews, avgRating, reviewCount }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <StarRating rating={avgRating} size="text-lg" />
        <span className="text-sm text-[#4A5049]">
          {avgRating > 0 ? avgRating.toFixed(1) : '—'} · {reviewCount} review
          {reviewCount === 1 ? '' : 's'}
        </span>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-[#8A8578]">No reviews yet for this product.</p>
      ) : (
        <ul className="space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-[#E7E0D3] pb-5 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-[#1F2A24]">{r.customer_name}</p>
                <StarRating rating={r.rating} />
              </div>
              {r.comment && <p className="text-sm text-[#4A5049] mt-1">{r.comment}</p>}
              <p className="text-xs text-[#8A8578] mt-1">
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
