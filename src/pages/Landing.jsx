import Navbar from "../components/Navbar";
import FloatingContactButtons from "../components/FloatingContactButtons";
import BackToTop from "../components/BackToTop";
import HeroSlider from "../components/HeroSlider";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import BestSellers from "../components/Bestsellers";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Navbar />
      <FloatingContactButtons />
      <BackToTop />

      <HeroSlider />
      <BestSellers />
      <main className="max-w-7xl mx-auto px-5 py-8">
        <section className="px-1.5 sm:px-2.5">
          <h1
            className="text-2xl sm:text-left text-center sm:text-3xl text-[#1F2A24] mb-6"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Shop our products
          </h1>
          <ProductGrid />
        </section>
      </main>

      <Footer />
    </div>
  );
}
