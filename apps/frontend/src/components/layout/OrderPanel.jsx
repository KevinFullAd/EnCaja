// src/components/layout/OrderPanel.jsx
import { useMemo } from "react";
import { useOrderStore } from "../../store/orderStore";
import { useAuthStore } from "../../store/authStore";
import OrderItemRow from "../order/OrderItemRow";
import ConfirmOrderModal from "../modals/ConfirmOrderModal"; 
import { Loader } from "lucide-react";
import { itemUnitPriceCents, formatMoney } from "../../lib/money";

export default function OrderPanel() {
    const items = useOrderStore((s) => s.items);
    const inc = useOrderStore((s) => s.inc);
    const dec = useOrderStore((s) => s.dec);
    const submit = useOrderStore((s) => s.submit);
    const clear = useOrderStore((s) => s.clear);
    const submitting = useOrderStore((s) => s.submitting);

    const isConfirmOpen = useOrderStore((s) => s.isConfirmOpen);
    const openConfirm = useOrderStore((s) => s.openConfirm);
    const closeConfirm = useOrderStore((s) => s.closeConfirm);

    const lastResult = useOrderStore((s) => s.lastResult);
    const clearResult = useOrderStore((s) => s.clearResult);

    const user = useAuthStore((s) => s.user);

    const currency = items?.[0]?.currency ?? "ARS";

    const totalCents = useMemo(() => {
        return items.reduce(
            (sum, it) => sum + itemUnitPriceCents(it) * it.qty,
            0
        );
    }, [items]);

    const initials = user?.displayName
        ? user.displayName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
        : "?";

    return (
        <aside className="shrink-0 bg-(--app-surface) border-l border-(--app-border) flex flex-col h-full min-w-1/4">
            
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
                <h2 className="text-lg font-bold text-(--app-text)">
                    Pedido actual
                </h2>

                <div className="flex items-center gap-2 mt-3">
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-700">
                            {initials}
                        </span>
                    </div>

                    <span className="text-sm font-medium text-(--app-text)">
                        {user?.displayName ?? "Operario"}
                    </span>
                </div>
            </div>
 

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5">
                {items.length === 0 ? (
                    <p className="text-sm text-(--app-muted) py-8 text-center">
                        No hay productos agregados
                    </p>
                ) : (
                    <div className="divide-y divide-(--app-border)">
                        {items.map((it) => (
                            <OrderItemRow
                                key={it.id}
                                item={it}
                                onInc={inc}
                                onDec={dec}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-3 border-t border-(--app-border)">
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-(--app-border)">
                    <span className="text-base font-bold text-(--app-text)">
                        Total
                    </span>

                    <span className="text-xl font-bold text-(--app-text)">
                        {formatMoney(totalCents, currency)}
                    </span>
                </div>

                <div className="flex gap-2 mt-4">
                    {items.length > 0 && (
                        <button
                            onClick={clear}
                            disabled={submitting}
                            className="px-4 py-3 rounded-xl border border-(--app-border) text-sm"
                        >
                            Limpiar
                        </button>
                    )}

                    <button
                        onClick={openConfirm}
                        disabled={items.length === 0 || submitting}
                        className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <Loader size={16} className="animate-spin" />
                        ) : (
                            "Confirmar pedido"
                        )}
                    </button>
                </div>
            </div>

            <ConfirmOrderModal
                open={isConfirmOpen}
                totalCents={totalCents}
                onClose={closeConfirm}
                onConfirm={submit}
                submitting={submitting}
            />
        </aside>
    );
}