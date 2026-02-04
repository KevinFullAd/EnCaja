import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../layout/DashboardLayout";
import LoginPage from "@/pages/auth/LoginPage";
import NotFoundPage from "@/pages/system/NotFoundPage";

import POSPage from "@/pages/operario/POSPage";
import DashboardPage from "@/pages/admin/DashboardPage";

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
