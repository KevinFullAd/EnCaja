import { Plus } from "lucide-react";
import { useOrderStore } from "../../store/orderStore";

export default function ProductCard({ product }) {
  const add = useOrderStore((s) => s.add);

  return (
    <div className="flex flex-col gap-2">
      <div className={"rounded-2xl overflow-hidden aspect-square flex items-center justify-center " + product.bg}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex items-end justify-between px-0.5">
        <div>
          <p className="text-sm font-medium text-gray-900">{product.name}</p>
          <p className="text-sm font-bold text-gray-900">
            {"£" + product.price.toFixed(2).replace(".", ",")}
          </p>
        </div>

        <button
          onClick={() =>
            add({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
            })
          }
          className="w-7 h-7 rounded-full border-2 border-purple-600 flex items-center justify-center hover:bg-purple-50 transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} className="text-purple-600" />
        </button>
      </div>
    </div>
  );
}