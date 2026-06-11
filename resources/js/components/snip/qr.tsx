import { QRCodeSVG } from 'qrcode.react';
import { useAppearance } from '@/hooks/use-appearance';

interface QRProps {
    value: string;
    size?: number;
}

export function QR({ value, size = 64 }: QRProps) {
    const { resolvedAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    return (
        <QRCodeSVG
            value={value || ' '}
            size={size}
            fgColor={isDark ? '#F5F5F3' : '#121212'}
            bgColor={isDark ? '#171717' : '#FFFFFF'}
            level="M"
            style={{ flexShrink: 0 }}
        />
    );
}
