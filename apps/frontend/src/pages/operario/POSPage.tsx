import { useNavigate } from "react-router-dom";

export default function POSPage() {
    const navigate = useNavigate();

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold">POS</h1>

            <div className="mt-6">
                <button
                    onClick={() => navigate("/operario/pos/new")}
                    className="rounded-xl px-4 py-2 bg-violet-600 text-white"
                >
                    Nuevo pedido
                </button>
            </div>
        </div>
    );
}
