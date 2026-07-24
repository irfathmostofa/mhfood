import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories(data || []);
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      let query = supabase
        .from('products')
        .select('*, product_images(image_url, sort_order)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (activeCategory !== 'all') {
        query = query.eq('category_id', activeCategory);
      }

      const { data: prods } = await query;

      if (!prods || prods.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Pull ratings from the product_ratings view for all products in one go
      const ids = prods.map((p) => p.id);
      const { data: ratings } = await supabase
        .from('product_ratings')
        .select('*')
        .in('product_id', ids);

      const ratingMap = Object.fromEntries(
        (ratings || []).map((r) => [r.product_id, r])
      );

      const merged = prods.map((p) => ({
        ...p,
        product_images: [...(p.product_images || [])].sort(
          (a, b) => a.sort_order - b.sort_order
        ),
        avg_rating: ratingMap[p.id]?.avg_rating || 0,
        review_count: ratingMap[p.id]?.review_count || 0,
      }));

      setProducts(merged);
      setLoading(false);
    }

    loadProducts();
  }, [activeCategory]);

  return (
    <div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-[#1F2A24] text-[#FBF8F3]'
              : 'bg-white border border-[#E7E0D3] text-[#4A5049] hover:border-[#1F2A24]'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-[#1F2A24] text-[#FBF8F3]'
                : 'bg-white border border-[#E7E0D3] text-[#4A5049] hover:border-[#1F2A24]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#8A8578] py-12 text-center">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-[#8A8578] py-12 text-center">No products here yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
