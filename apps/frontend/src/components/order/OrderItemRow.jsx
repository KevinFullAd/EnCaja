import { Minus, Plus } from "lucide-react";

export default function OrderItemRow({ item, onInc, onDec }) {
    return (
        <div className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-sm font-bold text-gray-900">
                    {"£" + item.price.toFixed(2).replace(".", ",")}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onDec(item.id)}
                    className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors"
                >
                    <Minus size={14} strokeWidth={2.5} className="text-purple-600" />
                </button>

                <span className="text-sm font-medium w-4 text-center text-gray-900">
                    {item.qty}
                </span>

                <button
                    onClick={() => onInc(item.id)}
                    className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors"
                >
                    <Plus size={14} strokeWidth={2.5} className="text-purple-600" />
                </button>
            </div>
        </div>
    );
}