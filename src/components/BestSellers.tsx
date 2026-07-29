import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function BestSellers({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-bold">🔥 الأكثر مبيعاً</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-6">
        {products.map((product) => (
          <div key={product.id} className="w-[46vw] shrink-0 md:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
