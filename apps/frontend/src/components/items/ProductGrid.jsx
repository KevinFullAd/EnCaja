import ProductCard from "./ProductCard";

export default function ProductGrid({ products }) {
    return (
        <div className="grid grid-cols-3 gap-5">
            {products.map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    );
}