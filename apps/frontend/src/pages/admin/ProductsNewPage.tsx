import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "@/shared/api/http";

type Categoria = {
    id: string;
    name: string;
};

export default function ProductNewPage() {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoryId, setCategoryId] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    useEffect(() => {
        loadCategorias();
    }, []);

    async function loadCategorias() {
        const data = await http<Categoria[]>("/api/catalogo/categorias");
        setCategorias(data);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        await http("/api/catalogo/productos", {
            method: "POST",
            body: {
                categoryId,
                name,
                basePrice: Math.round(Number(price) * 100),
            },
        });

        navigate("/admin/products");
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold">Nuevo producto</h1>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 max-w-md">
                <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <input
                    required
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded px-3 py-2"
                />

                <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="border rounded px-3 py-2"
                />

                <button
                    type="submit"
                    className="rounded px-4 py-2 bg-violet-600 text-white"
                >
                    Guardar
                </button>
            </form>
        </div>
    );
}
