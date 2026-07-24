import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    totalAmount,
  } = useCart();
  const navigate = useNavigate();

  function handleCheckout() {
    closeCart();
    navigate('/checkout');
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-[#FBF8F3] z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#E7E0D3] shrink-0">
          <h2
            className="text-lg text-[#1F2A24]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Your Cart
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-1.5 rounded-full hover:bg-[#F3EEE2] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1F2A24" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
            <p className="text-sm text-[#8A8578] mb-1">Your cart is empty</p>
            <button
              onClick={closeCart}
              className="text-sm text-[#C77B4C] hover:underline mt-2"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <li key={item.product_id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-[#F3EEE2] overflow-hidden shrink-0">
                    <img
                      src={item.image_url || 'https://placehold.co/100x100?text=No+Image'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F2A24] truncate">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-[#C77B4C] font-semibold mt-0.5">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, Math.max(1, item.quantity - 1))
                        }
                        className="w-6 h-6 flex items-center justify-center text-xs border border-[#E7E0D3] rounded-full hover:bg-[#F3EEE2]"
                      >
                        −
                      </button>
                      <span className="text-xs text-[#4A5049] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs border border-[#E7E0D3] rounded-full hover:bg-[#F3EEE2]"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-xs text-red-500 hover:underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-[#E7E0D3] px-5 py-4 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-[#1F2A24]">Subtotal</span>
                <span className="text-lg font-semibold text-[#C77B4C]">
                  ৳{totalAmount.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-3 rounded-full bg-[#1F2A24] text-[#FBF8F3] text-sm font-medium hover:bg-[#2D3A32] transition-colors"
              >
                Go to Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
