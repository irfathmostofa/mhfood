import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

export default function Header() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-700 text-xl tracking-tight text-ink">
          Store<span className="text-indigo">.</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-8 font-body text-sm font-medium text-ink/70">
          <Link to="/" className="hover:text-ink transition-colors">
            Shop
          </Link>
          <Link to="/track" className="hover:text-ink transition-colors">
            Track Order
          </Link>
        </nav>

        <Link
          to="/checkout"
          className="relative flex items-center gap-2 font-body text-sm font-medium text-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-2 -right-3 bg-indigo text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
