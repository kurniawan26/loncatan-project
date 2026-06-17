import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#121212" />
            <rect x="19" y="19" width="9" height="9" rx="2.5" fill="#FAFAFA" />
        </svg>
    );
}
