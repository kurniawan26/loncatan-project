import {
    ArrowRight,
    BarChart2,
    ChevronRight,
    Clock,
    Copy,
    Edit,
    Link2,
    Plus,
    QrCode,
    Scissors,
    Search,
} from 'lucide-react';

const icons = {
    arrowRight: ArrowRight,
    chart: BarChart2,
    chevRight: ChevronRight,
    clock: Clock,
    copy: Copy,
    edit: Edit,
    link: Link2,
    plus: Plus,
    qr: QrCode,
    scissors: Scissors,
    search: Search,
} as const;

export type IconName = keyof typeof icons;

interface IconProps {
    name: IconName;
    size?: number;
    className?: string;
}

export function Icon({ name, size = 16, className }: IconProps) {
    const Component = icons[name];

    return <Component size={size} className={className} />;
}
