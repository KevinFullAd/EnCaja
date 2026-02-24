import { useOrderStore } from "../../store/orderStore";
import OrderItemRow from "../order/OrderItemRow";

const SERVICE_CHARGE_RATE = 0.2;
const TAX = 0.5;

export default function OrderPanel() {
    const items = useOrderStore((s) => s.items);
    const inc = useOrderStore((s) => s.inc);
    const dec = useOrderStore((s) => s.dec);

    const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const discount = 0;
    const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
    const total = subtotal - discount + serviceCharge + TAX;

    return (
        <aside className="w-80 flex-shrink-0 bg-white border-l border-gray-100 flex flex-col h-full">
            <div className="px-5 pt-5 pb-3">
                <h2 className="text-lg font-bold text-gray-900">Current Order</h2>
                <div className="flex items-center gap-2 mt-3">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">EW</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Emma Wang</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
                {items.length === 0 ? (
                    <p className="text-sm text-gray-400 py-8 text-center">No items yet</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {items.map((it) => (
                            <OrderItemRow key={it.id} item={it} onInc={inc} onDec={dec} />
                        ))}
                    </div>
                )}
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-gray-100">
                <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span className="text-gray-900">{"£" + subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Discount</span>
                        <span className="text-gray-900">{"£" + discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Service Charge</span>
                        <span className="text-gray-900">20%</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Tax</span>
                        <span className="text-gray-900">{"£" + TAX.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">{"£" + total.toFixed(2)}</span>
                </div>

                <button className="w-full mt-4 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                    Continue
                </button>
            </div>
        </aside>
    );
}