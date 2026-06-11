interface SwitchProps {
    on: boolean;
    onChange: (value: boolean) => void;
}

export function Switch({ on, onChange }: SwitchProps) {
    return (
        <button
            type="button"
            className={`switch${on ? ' on' : ''}`}
            onClick={() => onChange(!on)}
            aria-pressed={on}
        />
    );
}
