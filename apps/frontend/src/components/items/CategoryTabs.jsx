import { CATEGORIES } from "../../data/categories";
import { useUIStore } from "../../store/uiStore";

export default function CategoryTabs() {
  const active = useUIStore((s) => s.activeCategoryId);
  const setActive = useUIStore((s) => s.setActiveCategory);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActive(cat.id)}
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