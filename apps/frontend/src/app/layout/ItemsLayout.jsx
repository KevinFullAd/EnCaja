// src/app/layout/ItemsLayout.jsx
import { Outlet } from "react-router-dom";
import OrderPanel from "../../components/layout/OrderPanel";

export default function ItemsLayout() {
    return (
        <div className="flex h-full min-h-0">
            
            {/* CONTENIDO SCROLLEABLE */}
            <div className="flex-1 overflow-hidden">
                <Outlet />
            </div>

            {/* PANEL FIJO */}
            <div className="h-full min-w-1/4">
                <OrderPanel />
            </div>

        </div>
    );
}