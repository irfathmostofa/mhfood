import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

export default function Navbar() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#FBF8F3]/90 backdrop-blur border-b border-[#E7E0D3]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-display text-xl tracking-tight text-[#1F2A24]"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Store
        </Link>

        <nav className="hidden sm:flex items-center gap-8 text-sm text-[#4A5049]">
          <Link to="/" className="hover:text-[#1F2A24] transition-colors">
            Shop
          </Link>
          <Link to="/track" className="hover:text-[#1F2A24] transition-colors">
            Track Order
          </Link>
        </nav>

        <Link
          to="/checkout"
          className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F2A24] text-[#FBF8F3] text-sm font-medium hover:bg-[#2D3A32] transition-colors"
        >
          Cart
          {itemCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-[#C77B4C] text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
