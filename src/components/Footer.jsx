import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  const shopLinks = [
    { to: "/shop", label: "Shop" },
    { to: "/track", label: "Track Order" },
  ];

  return (
    <footer className="mt-16 bg-[#F7F3EA] border-t border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-xl font-semibold tracking-tight text-[#1F2A24]">
              MH<span className="text-amber-600">Food</span>
            </span>
            <p className="mt-3 text-sm text-[#8A8578] max-w-[220px] leading-relaxed">
              Fresh, honest food — ordered in a click, tracked the whole way.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#1F2A24] mb-4">
              Navigate
            </span>
            <div className="flex flex-col items-center sm:items-start gap-3">
              {shopLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative group text-sm text-[#8A8578] hover:text-[#1F2A24] transition-colors"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>
          </div>

          {/* Credit / contact */}
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#1F2A24] mb-4">
              Built by
            </span>
            <a
              href="https://irfathchowdhuryjoy.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group text-sm text-[#8A8578] hover:text-[#1F2A24] transition-colors"
            >
              Irfath Chowdhury
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#E7E0D3] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span className="text-xs text-[#8A8578]">
            © {year} MHFood. All rights reserved.
          </span>
          <span className="text-xs text-[#8A8578]">
            Made with care, delivered with speed.
          </span>
        </div>
      </div>
    </footer>
  );
}
