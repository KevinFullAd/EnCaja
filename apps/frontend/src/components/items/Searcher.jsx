export default function Searcher({ value, onChange }) {
    const clear = () => onChange("");

    return (
        <div className="relative w-56">
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search"
                aria-label="Search products"
                className="w-full p-2 text-sm rounded-xl 
                           bg-(--app-surface) border border-(--app-border) 
                           text-(--app-text) placeholder:text-(--app-muted)
                           outline-none focus:ring-2 focus:ring-blue-500/30"
            />
 

            {/* Botón limpiar */}
            {value && (
                <button
                    onClick={clear}
                    type="button"
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 
                               text-(--app-muted) hover:text-(--app-text)"
                >
                    ✕
                </button>
            )}
        </div>
    );
}