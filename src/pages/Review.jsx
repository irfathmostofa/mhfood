import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import FloatingContactButtons from '../components/FloatingContactButtons';
import BackToTop from '../components/BackToTop';

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl leading-none transition-colors"
        >
          <span className={(hover || value) >= n ? 'text-[#C77B4C]' : 'text-[#E7E0D3]'}>★</span>
        </button>
      ))}
    </div>
  );
}

function ReviewItemForm({ item, order, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase.from('reviews').insert({
      order_item_id: item.id,
      product_id: item.product_id,
      customer_name: order.customer_name,
      rating,
      comment,
    });

    setLoading(false);

    if (insertError) {
      if (insertError.code === '23505') {
        // unique violation — already reviewed
        onSubmitted(item.id);
        return;
      }
      setError('Could not submit your review. Please try again.');
      return;
    }

    onSubmitted(item.id);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E7E0D3] rounded-2xl p-6 space-y-4"
    >
      <p className="text-sm font-medium text-[#1F2A24]">
        {item.product_name} × {item.quantity}
      </p>

      <div>
        <p className="text-xs text-[#8A8578] mb-2">Your rating</p>
        <StarInput value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-xs text-[#8A8578] mb-1">
          Your review (optional)
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think of this product?"
          className="w-full px-3 py-2.5 border border-[#E7E0D3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2A24]/20 focus:border-[#1F2A24]"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 rounded-full bg-[#1F2A24] text-[#FBF8F3] text-sm font-medium hover:bg-[#2D3A32] disabled:opacity-60 transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

export default function Review() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError || !orderData) {
        setError('We could not find this order.');
        setLoading(false);
        return;
      }

      if (orderData.status !== 'delivered') {
        setError('Reviews can only be submitted once an order has been delivered.');
        setLoading(false);
        return;
      }

      const { data: itemRows } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      const ids = (itemRows || []).filter((i) => i.reviewed).map((i) => i.id);

      // Also check the reviews table directly in case `reviewed` wasn't set
      const { data: existingReviews } = await supabase
        .from('reviews')
        .select('order_item_id')
        .in('order_item_id', (itemRows || []).map((i) => i.id));

      const reviewedSet = new Set([
        ...ids,
        ...((existingReviews || []).map((r) => r.order_item_id)),
      ]);

      setOrder(orderData);
      setItems(itemRows || []);
      setReviewedIds(reviewedSet);
      setLoading(false);
    }

    load();
  }, [orderId]);

  function handleSubmitted(itemId) {
    setReviewedIds((prev) => new Set(prev).add(itemId));
    // Best-effort mark on order_items — ignore failure, reviews table is source of truth
    supabase.from('order_items').update({ reviewed: true }).eq('id', itemId);
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBF8F3]">
        <Navbar />
      <FloatingContactButtons />
      <BackToTop />
        <div className="text-center py-24 px-5">
          <p className="text-lg text-[#1F2A24] mb-2">Unable to load this review page</p>
          <p className="text-sm text-[#8A8578]">{error}</p>
        </div>
      </div>
    );
  }

  const allReviewed = items.length > 0 && items.every((i) => reviewedIds.has(i.id));

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Navbar />
      <FloatingContactButtons />
      <BackToTop />

      <main className="max-w-2xl mx-auto px-5 py-12">
        <h1
          className="text-2xl sm:text-3xl text-[#1F2A24] mb-2"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Rate Your Order
        </h1>
        <p className="text-sm text-[#8A8578] mb-8">
          Thanks for your order, {order.customer_name}. Let us know what you thought of each
          item below.
        </p>

        {allReviewed && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-5 py-4 mb-6">
            Thanks — you've reviewed everything from this order!
          </div>
        )}

        <div className="space-y-6">
          {items.map((item) =>
            reviewedIds.has(item.id) ? (
              <div
                key={item.id}
                className="bg-white border border-[#E7E0D3] rounded-2xl p-6 flex items-center justify-between"
              >
                <p className="text-sm font-medium text-[#1F2A24]">
                  {item.product_name} × {item.quantity}
                </p>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Reviewed ✓
                </span>
              </div>
            ) : (
              <ReviewItemForm
                key={item.id}
                item={item}
                order={order}
                onSubmitted={handleSubmitted}
              />
            )
          )}
        </div>
      </main>
    </div>
  );
}
