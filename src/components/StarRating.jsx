export default function StarRating({ rating, size = 'text-sm' }) {
  const full = Math.round(rating);
  return (
    <span className={`${size} text-[#C77B4C]`}>
      {'★'.repeat(full)}
      <span className="text-[#E7E0D3]">{'★'.repeat(5 - full)}</span>
    </span>
  );
}
