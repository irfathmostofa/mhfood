import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export default function Navbar() {
  const { itemCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[#FBF8F3]/90 backdrop-blur border-b border-[#E7E0D3]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <nav className="hidden sm:flex items-center gap-8 text-sm text-[#4A5049]">
          {/* <Link to="/" className="hover:text-[#1F2A24] transition-colors">
            Shop
          </Link> */}
          <Link to="/track" className="hover:text-[#1F2A24] transition-colors">
            Track Order
          </Link>
        </nav>
        <Link
          to="/"
          className="font-display text-xl tracking-tight text-[#1F2A24]"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {/* logo */}
          <img
            src="/mhfood.png"
            alt="MHFood Logo"
            className="h-14 w-auto inline-block mr-2"
          />
          {/* MHFood */}
        </Link>
        <button
          onClick={openCart}
          className="relative flex items-center gap-2 px-4 py-2 rounded-full text-[#1F2A24] text-sm font-medium  transition-colors"
        >
          <span className="relative">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle
                cx="9"
                cy="21"
                r="1.5"
                fill="currentColor"
                stroke="none"
              />
              <circle
                cx="19"
                cy="21"
                r="1.5"
                fill="currentColor"
                stroke="none"
              />
              <path
                d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L20 8H6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-[#C77B4C] text-white">
                {itemCount}
              </span>
            )}
          </span>
          <span className="hidden sm:inline">Cart</span>
        </button>
      </div>
    </header>
  );
}
