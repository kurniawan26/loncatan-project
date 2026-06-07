import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'quiet';
    size?: 'sm' | 'md' | 'lg';
    icon?: IconName;
    iconRight?: IconName;
    children?: ReactNode;
}

export function Button({ variant = 'primary', size, icon, iconRight, children, className = '', ...props }: ButtonProps) {
    const classes = [
        'btn',
        variant && `btn-${variant}`,
        size && size !== 'md' && `btn-${size}`,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} {...props}>
            {icon && <Icon name={icon} size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
            {children}
            {iconRight && <Icon name={iconRight} size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
        </button>
    );
}
