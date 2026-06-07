import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './icon';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: IconName;
    size?: 'sm' | 'md';
    variant?: 'ghost' | 'quiet';
}

export function IconButton({ icon, size = 'md', variant = 'ghost', className = '', ...props }: IconButtonProps) {
    const classes = [
        'btn',
        'btn-icon',
        `btn-${variant}`,
        size === 'sm' && 'btn-sm',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} {...props}>
            <Icon name={icon} size={size === 'sm' ? 14 : 16} />
        </button>
    );
}
