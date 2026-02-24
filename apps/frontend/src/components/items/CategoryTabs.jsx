import { ChevronRight } from "lucide-react";
import { CATEGORIES } from "../../data/categories";
import { useUIStore } from "../../store/uiStore";

export default function CategoryTabs() {
  const active = useUIStore((s) => s.activeCategory);
  const setActive = useUIStore((s) => s.setActiveCategory);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={
            "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors " +
            (active === cat
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50")
          }
        >
          {cat}
        </button>
      ))}

      <button className="ml-1 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
        <ChevronRight size={16} className="text-gray-400" />
      </button>
    </div>
  );
}