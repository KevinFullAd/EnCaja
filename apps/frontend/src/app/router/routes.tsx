// EnCaja\apps\frontend\src\app\router\routes.tsx

import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../layout/DashboardLayout";
import LoginPage from "@/pages/auth/LoginPage";
import NotFoundPage from "@/pages/system/NotFoundPage";

import POSPage from "@/pages/operario/POSPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ProductsPage from "@/pages/admin/ProductsPage";
import ProductNewPage from "@/pages/admin/ProductsNewPage";


import { AuthGuard, RoleGuard } from "@/app/router/guards";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/auth/login" element={<LoginPage />} />

            {/* Private area + Layout */}
            <Route
                element={
                    <AuthGuard>
                        <DashboardLayout />
                    </AuthGuard>
                }
            >
                <Route path="/" element={<Navigate to="/operario/pos" replace />} />

                {/* Operario (y Admin también puede entrar) */}
                <Route
                    path="/operario/pos"
                    element={
                        <RoleGuard allow={["OPERARIO", "ADMIN"]}>
                            <POSPage />
                        </RoleGuard>
                    }
                />

                {/* Admin */}
                <Route
                    path="/admin"
                    element={
                        <RoleGuard allow={["ADMIN"]}>
                            <DashboardPage />
                        </RoleGuard>
                    }
                />

                <Route
                    path="/admin/products"
                    element={
                        <RoleGuard allow={["ADMIN"]}>
                            <ProductsPage />
                        </RoleGuard>
                    }
                />

                <Route
                    path="/admin/products/new"
                    element={
                        <RoleGuard allow={["ADMIN"]}>
                            <ProductNewPage />
                        </RoleGuard>
                    }
                />

                {/* placeholders admin futuros */}
                <Route
                    path="/admin/orders"
                    element={
                        <RoleGuard allow={["ADMIN"]}>
                            <div className="p-6">Orders</div>
                        </RoleGuard>
                    }
                />
                <Route
                    path="/admin/settings"
                    element={
                        <RoleGuard allow={["ADMIN"]}>
                            <div className="p-6">Settings</div>
                        </RoleGuard>
                    }
                />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
