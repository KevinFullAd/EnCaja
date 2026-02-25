import { Plus } from "lucide-react";
import { useOrderStore } from "../../store/orderStore";

function formatMoneyFromCents(priceCents, currency = "ARS") {
  if (typeof priceCents !== "number") return "—";
  const amount = priceCents / 100;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatMoneyFromFloat(price) {
  if (typeof price !== "number") return "—";
  // fallback legacy, no recomendado a futuro
  return "£" + price.toFixed(2).replace(".", ",");
}

export default function ProductCard({ product }) {
  const add = useOrderStore((s) => s.add);

  const currency = product.currency ?? "ARS";

  const priceLabel =
    typeof product.priceCents === "number"
      ? formatMoneyFromCents(product.priceCents, currency)
      : formatMoneyFromFloat(product.price);

  const imageSrc = product.imageUrl ?? product.image;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={
          "rounded-2xl overflow-hidden aspect-square flex items-center justify-center " +
          (product.bg ?? "bg-gray-100")
        }
      >
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex items-end justify-between px-0.5">
        <div>
          <p className="text-sm font-medium text-(--app-text)">{product.name}</p>
          <p className="text-sm font-bold text-(--app-text)">{priceLabel}</p>
        </div>

        <button
          onClick={() =>
            add({
              id: product.id, // variantId real
              name: product.name,
              priceCents:
                typeof product.priceCents === "number"
                  ? product.priceCents
                  : typeof product.price === "number"
                    ? Math.round(product.price * 100)
                    : 0,
              imageUrl: imageSrc,
            })
          }
          className="w-7 h-7 rounded-full border-2 border-purple-600 flex items-center justify-center hover:bg-purple-50 transition-colors"
          type="button"
          aria-label="Add product"
        >
          <Plus size={16} strokeWidth={2.5} className="text-purple-600" />
        </button>
      </div>
    </div>
  );
}