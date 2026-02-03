// src/pages/system/NotFoundPage.tsx 
import { Link } from "react-router-dom"

export default function NotFoundPage() {
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="text-center space-y-3">
                <div className="text-2xl font-semibold">404</div>
                <Link className="text-indigo-600 underline" to="/">
                    Ir al inicio
                </Link>
            </div>
        </div>
    )
}
