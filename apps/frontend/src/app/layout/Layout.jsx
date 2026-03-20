// src/app/layout/Layout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import StatusBar from "../../components/layout/StatusBar";
import NotificationToast from "../../components/ui/NotificationToast" 

export default function Layout() { 
    return (
        <div className="flex flex-col h-dvh bg-(--app-bg)">
            <StatusBar />
            <div className="flex flex-1 min-h-0">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div> 
            <NotificationToast />
        </div>
    );
}