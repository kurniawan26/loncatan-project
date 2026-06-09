import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    BarChart2,
    Bell,
    Calendar,
    Check,
    ChevronDown,
    ChevronRight,
    Clock,
    Copy,
    Download,
    Edit,
    ExternalLink,
    Eye,
    Filter,
    Globe,
    LayoutDashboard,
    Link2,
    Lock,
    LogOut,
    Menu,
    Moon,
    MoreVertical,
    Phone,
    Plus,
    QrCode,
    Scissors,
    Search,
    Settings,
    Share2,
    SlidersHorizontal,
    Star,
    Sun,
    Tag,
    Trash2,
    TrendingUp,
    X,
    Zap,
} from 'lucide-react';

const icons = {
    arrowDown: ArrowDown,
    arrowLeft: ArrowLeft,
    arrowRight: ArrowRight,
    arrowUp: ArrowUp,
    bell: Bell,
    calendar: Calendar,
    chart: BarChart2,
    check: Check,
    chevDown: ChevronDown,
    chevRight: ChevronRight,
    clock: Clock,
    copy: Copy,
    dashboard: LayoutDashboard,
    download: Download,
    edit: Edit,
    external: ExternalLink,
    eye: Eye,
    filter: Filter,
    globe: Globe,
    link: Link2,
    lock: Lock,
    logout: LogOut,
    menu: Menu,
    moon: Moon,
    dots: MoreVertical,
    phone: Phone,
    plus: Plus,
    qr: QrCode,
    scissors: Scissors,
    search: Search,
    settings: Settings,
    share: Share2,
    sliders: SlidersHorizontal,
    star: Star,
    sun: Sun,
    tag: Tag,
    trash: Trash2,
    trending: TrendingUp,
    x: X,
    zap: Zap,
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
