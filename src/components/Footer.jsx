export default function Footer() {
  return (
    <footer className="border-t border-[#E7E0D3] mt-16 py-8">
      <div className="max-w-6xl mx-auto px-5 text-sm text-[#8A8578] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <span>© {new Date().getFullYear()} MHFood</span>
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
