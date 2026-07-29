import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[#E7E0D3] mt-16 py-8">
      <div className="max-w-7xl mx-auto px-5 text-sm text-[#8A8578] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <span>© {new Date().getFullYear()} MHFood</span>
        <div className="flex gap-4">
          <Link
            to="/shop"
            className="hover:text-gray-900 transition-colors relative group"
          >
            Shop
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
          </Link>
          <Link
            to="/track"
            className="hover:text-gray-900 transition-colors relative group"
          >
            Track Order
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full"></span>
          </Link>
        </div>

        <a
          href="https://irfathchowdhuryjoy.web.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#1F2A24] transition-colors"
        >
          Developed by Irfath Chowdhury
        </a>
      </div>
    </footer>
  );
}
