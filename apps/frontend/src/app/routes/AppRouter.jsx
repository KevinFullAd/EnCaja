import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../layout/Layout";
import { PATHS } from "./routes";

import ItemsPage from "../../pages/ItemsPage";
import UsersPage from "../../pages/UsersPage";
import SettingsPage from "../../pages/SettingsPage";
import NotFoundPage from "../../pages/NotFoundPage";

export default function AppRouter() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Navigate to={PATHS.ITEMS} replace />} />
                <Route path={PATHS.ITEMS} element={<ItemsPage />} />
                <Route path={PATHS.USERS} element={<UsersPage />} />
                <Route path={PATHS.SETTINGS} element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}