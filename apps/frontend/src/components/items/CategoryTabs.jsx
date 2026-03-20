// src/components/items/CategoryTabs.jsx
import { useEffect, useRef } from "react";

export default function CategoryTabs({ categories, active, onSelect }) {
    const scrollerRef = useRef(null);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        const onWheel = (e) => {
            const canScroll = el.scrollWidth > el.clientWidth;
            if (!canScroll) return;
            const isMostlyVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
            if (isMostlyVertical) {
                e.preventDefault();
                el.scrollTo({ left: el.scrollLeft + e.deltaY, behavior: "smooth" });
            }
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, []);

    return (
        <div ref={scrollerRef} className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
                onClick={() => onSelect("all")}
                className={
                    "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors " +
                    (active === "all"
                        ? "bg-(--app-text) text-(--app-surface)"
                        : "bg-(--app-surface) text-(--app-text) border border-(--app-border)")
                }
            >
                Todas
            </button>

            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className={
                        "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors " +
                        (active === cat.id
                            ? "bg-(--app-text) text-(--app-surface)"
                            : "bg-(--app-surface) text-(--app-text) border border-(--app-border)")
                    }
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}