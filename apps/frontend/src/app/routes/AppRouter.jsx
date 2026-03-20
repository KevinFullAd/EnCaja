// src/app/routes/AppRouter.jsx
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../layout/Layout";
import ItemsLayout from "../layout/ItemsLayout"; // 👈 nuevo
import { PATHS } from "./routes";
import { ProtectedRoute, AdminRoute } from "./ProtectedRoute";

import LoginPage from "../../pages/LoginPage";
import ItemsPage from "../../pages/ItemsPage"; 
import SettingsPage from "../../pages/SettingsPage";
import NotFoundPage from "../../pages/NotFoundPage";
import AdminCatalog from "../../pages/admin/AdminCatalog";
import AdminUsuarios from "../../pages/admin/AdminUsuarios";
import AdminReportes from "../../pages/admin/AdminReportes";

export default function AppRouter() {
    return (
        <Routes>
            {/* Pública */}
            <Route path={PATHS.LOGIN} element={<LoginPage />} />

            {/* Requiere sesión */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>

                    <Route path="/" element={<Navigate to={PATHS.ITEMS} replace />} />

                    {/* 👇 SOLO ITEMS tiene OrderPanel */}
                    <Route element={<ItemsLayout />}>
                        <Route path={PATHS.ITEMS} element={<ItemsPage />} />
                    </Route>

                    {/* 👇 resto SIN panel */}
                    <Route path={PATHS.SETTINGS} element={<SettingsPage />} />

                    {/* ADMIN */}
                    <Route element={<AdminRoute />}>
                        <Route path={PATHS.ADMIN_CATALOG} element={<AdminCatalog />} />
                        <Route path={PATHS.ADMIN_USERS} element={<AdminUsuarios />} />
                        <Route path={PATHS.ADMIN_REPORTES} element={<AdminReportes />} />
                    </Route>

                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}