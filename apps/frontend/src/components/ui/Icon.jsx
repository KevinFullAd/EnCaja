export default function Icon({ icon: IconComponent, size = 20, className = "" }) {
    return <IconComponent size={size} strokeWidth={2} className={className} />;
}