// src/app/routes/AppRouter.jsx
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../layout/Layout";
import { PATHS } from "./routes";
import { ProtectedRoute, AdminRoute } from "./ProtectedRoute";

import LoginPage from "../../pages/LoginPage";
import ItemsPage from "../../pages/ItemsPage"; 
import SettingsPage from "../../pages/SettingsPage";
import NotFoundPage from "../../pages/NotFoundPage";
import AdminCatalog from "../../pages/admin/AdminCatalog";
import AdminUsuarios from "../../pages/admin/AdminUsuarios";

export default function AppRouter() {
    return (
        <Routes>
            {/* Pública */}
            <Route path={PATHS.LOGIN} element={<LoginPage />} />

            {/* Requiere sesión */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to={PATHS.ITEMS} replace />} />
                    <Route path={PATHS.ITEMS} element={<ItemsPage />} /> 
                    <Route path={PATHS.SETTINGS} element={<SettingsPage />} />

                    {/* Requiere rol ADMIN */}
                    <Route element={<AdminRoute />}>
                        <Route path={PATHS.ADMIN_CATALOG} element={<AdminCatalog />} />
                        <Route path={PATHS.ADMIN_USERS} element={<AdminUsuarios />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}