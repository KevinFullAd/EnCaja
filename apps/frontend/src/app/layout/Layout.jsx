import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import StatusBar from "../../components/layout/StatusBar";
import OrderPanel from "../../components/layout/OrderPanel";

export default function Layout() {
    return (
        <div className="flex h-screen bg-(--app-bg) ">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0">
                <StatusBar />
                <div className="overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}