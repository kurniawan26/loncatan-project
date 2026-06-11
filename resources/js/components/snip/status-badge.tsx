export type LinkStatus = 'active' | 'paused' | 'expired';

interface StatusBadgeProps {
    status: LinkStatus;
}

const config: Record<LinkStatus, { label: string; className: string }> = {
    active:  { label: 'Aktif',       className: 'snip-badge active' },
    paused:  { label: 'Dijeda',      className: 'snip-badge muted' },
    expired: { label: 'Kedaluwarsa', className: 'snip-badge warn' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const { label, className } = config[status];

    return (
        <span className={className}>
            <span className="dot" />
            {label}
        </span>
    );
}
