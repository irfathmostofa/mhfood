import Navbar from '../components/Navbar';
import FloatingContactButtons from '../components/FloatingContactButtons';
import BackToTop from '../components/BackToTop';
import HeroSlider from '../components/HeroSlider';
import ProductGrid from '../components/ProductGrid';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Navbar />
      <FloatingContactButtons />
      <BackToTop />

      <main className="max-w-6xl mx-auto px-5 py-8">
        <HeroSlider />

        <section className="mt-12">
          <h1
            className="text-2xl sm:text-3xl text-[#1F2A24] mb-6"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Shop our products
          </h1>
          <ProductGrid />
        </section>
      </main>

      <footer className="border-t border-[#E7E0D3] mt-16 py-8">
        <div className="max-w-6xl mx-auto px-5 text-sm text-[#8A8578] flex items-center justify-between">
          <span>© {new Date().getFullYear()} Store</span>
        </div>
      </footer>
    </div>
  );
}
