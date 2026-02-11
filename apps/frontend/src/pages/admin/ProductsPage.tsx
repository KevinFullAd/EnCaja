import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "@/shared/api/http";

type Categoria = {
    id: string;
    name: string;
    sortOrder: number;
};

type Producto = {
    id: string;
    categoryId: string;
    name: string;
    basePrice: number;
};

export default function ProductsPage() {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categoriaId, setCategoriaId] = useState<string>("");

    useEffect(() => {
        loadCategorias();
    }, []);

    useEffect(() => {
        loadProductos();
    }, [categoriaId]);

    async function loadCategorias() {
        const data = await http<Categoria[]>("/api/catalogo/categorias");
        setCategorias(data);
    }

    async function loadProductos() {
        const query = categoriaId ? `?categoriaId=${categoriaId}` : "";
        const data = await http<Producto[]>(`/api/catalogo/productos${query}`);
        setProductos(data);
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold">Productos</h1>

            <div className="mt-4 flex gap-3">
                <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => navigate("/admin/products/new")}
                    className="rounded px-4 py-2 bg-violet-600 text-white"
                >
                    Nuevo producto
                </button>
            </div>

            <table className="mt-6 w-full border-collapse">
                <thead>
                    <tr className="text-left border-b">
                        <th className="py-2">Nombre</th>
                        <th>Precio</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((p) => (
                        <tr key={p.id} className="border-b">
                            <td className="py-2">{p.name}</td>
                            <td>${(p.basePrice / 100).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
