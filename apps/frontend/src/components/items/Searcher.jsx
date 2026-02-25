export default function Searcher({value, onChange,}) {
    return (
        <div className="flex gap-2">
            <div className="flex items-center bg-(--app-surface) border border-(--app-border) rounded-xl px-3 py-2 w-56">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 text-sm bg-transparent outline-none text-(--app-text) placeholder:text-(--app-muted)"
                    aria-label="Search products"
                    placeholder="Search"
                />
            </div>

            <button
                className="w-10 h-10 bg-(--app-surface) border border-(--app-border) rounded-xl"
                aria-label="Filter"
                type="button"
            />
        </div>
    );
}