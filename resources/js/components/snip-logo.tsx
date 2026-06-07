export function SnipLogo({ size = 'md' }: { size?: 'md' | 'lg' }) {
    return (
        <span className="brand">
            <span className={`brand-mark${size === 'lg' ? ' lg' : ''}`} />
            <span className="brand-name">
                Snip<span className="dot">.</span>
            </span>
        </span>
    );
}
