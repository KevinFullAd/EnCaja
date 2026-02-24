import { Link } from "react-router-dom";
import { PATHS } from "../app/routes/routes";

export default function NotFoundPage() {
    return (
        <div className="p-6">
            <div className="text-lg font-semibold">404</div>
            <Link className="underline" to={PATHS.ITEMS}>Go to Items</Link>
        </div>
    );
}