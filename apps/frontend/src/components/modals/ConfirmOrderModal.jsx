// src/components/order/ConfirmOrderModal.jsx
import { useState } from "react";
import { X, Printer, Loader } from "lucide-react";
import { formatMoney } from "../../lib/money";

export default function ConfirmOrderModal({
    open,
    totalCents,
    onClose,
    onConfirm,
    submitting,
}) {
    const [clientName, setClientName] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [notes, setNotes] = useState("");

    function handleClose() {
        if (submitting) return;
        setClientName("");
        setTableNumber("");
        setNotes("");
        onClose();
    }

    function handleConfirm() {
        onConfirm({ clientName, tableNumber, notes });
    }

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <div
                className="relative z-10 bg-(--app-surface) border border-(--app-border) rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-4 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-(--app-text)">
                        Confirmar pedido
                    </h2>

                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="text-(--app-muted) hover:text-(--app-text)"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-3">
                    <input
                        className="w-full px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-bg)"
                        placeholder="Cliente"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        disabled={submitting}
                    />

                    <input
                        className="w-full px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-bg)"
                        placeholder="Mesa / N°"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        disabled={submitting}
                    />

                    <textarea
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-(--app-border) bg-(--app-bg)"
                        placeholder="Notas"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={submitting}
                    />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-(--app-border)">
                    <span className="text-sm text-(--app-muted)">Total</span>
                    <span className="text-lg font-bold text-(--app-text)">
                        {formatMoney(totalCents)}
                    </span>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <Loader size={16} className="animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Printer size={16} />
                            Confirmar e imprimir
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}