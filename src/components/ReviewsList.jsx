import StarRating from './StarRating';

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Deterministic soft accent per reviewer, so avatars aren't all identical
// but stay within the site's warm palette.
const AVATAR_PALETTE = [
  { bg: '#F3E7DB', fg: '#B4603A' }, // clay
  { bg: '#E9EDE6', fg: '#5C6B52' }, // sage
  { bg: '#EFE6DC', fg: '#8A6A45' }, // sand
  { bg: '#E6E9EC', fg: '#4A5A6B' }, // slate
];

function avatarColors(name) {
  const code = (name || '').charCodeAt(0) || 0;
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
}

export default function ReviewsList({ reviews, avgRating, reviewCount }) {
  return (
    <div>
      {/* Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-6 mb-6 border-b border-[#E7E0D3]">
        <div className="flex items-baseline gap-1">
          <span
            className="text-4xl text-[#1F2A24] leading-none"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
          </span>
          <span className="text-sm text-[#8A8578]">/ 5</span>
        </div>
        <div>
          <StarRating rating={avgRating} size="text-lg" />
          <p className="text-sm text-[#8A8578] mt-1">
            Based on {reviewCount} review{reviewCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* List */}
      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E7E0D3] py-10 px-6 text-center">
          <p className="text-sm text-[#8A8578]">
            No reviews yet — be the first to share what you think.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => {
            const { bg, fg } = avatarColors(r.customer_name);
            return (
              <li
                key={r.id}
                className="rounded-xl border border-[#E7E0D3] p-5 transition-colors hover:border-[#D9CFBC]"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ backgroundColor: bg, color: fg }}
                    aria-hidden="true"
                  >
                    {initials(r.customer_name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <p className="text-sm font-medium text-[#1F2A24]">
                        {r.customer_name}
                      </p>
                      <p className="text-xs text-[#8A8578]">
                        {formatDate(r.created_at)}
                      </p>
                    </div>

                    <div className="mt-1">
                      <StarRating rating={r.rating} />
                    </div>

                    {r.comment && (
                      <p className="text-sm text-[#4A5049] mt-2 leading-relaxed">
                        {r.comment}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}