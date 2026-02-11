import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
    const navigate = useNavigate();

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold">Admin</h1>

            <div className="mt-6 flex gap-3">
                <button
                    onClick={() => navigate("/admin/products")}
                    className="rounded-xl px-4 py-2 bg-violet-600 text-white"
                >
                    Catálogo (Productos)
                </button>

                <button
                    onClick={() => navigate("/operario/pos")}
                    className="rounded-xl px-4 py-2 bg-gray-900 text-white"
                >
                    Ir a POS
                </button>
            </div>
        </div>
    );
}
