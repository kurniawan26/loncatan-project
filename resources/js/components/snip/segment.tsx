export type SegmentOption = {
    value: string;
    label: string;
};

interface SegmentProps {
    value: string;
    onChange: (value: string) => void;
    options: SegmentOption[];
}

export function Segment({ value, onChange, options }: SegmentProps) {
    return (
        <div className="segment">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    className={value === opt.value ? 'active' : undefined}
                    onClick={() => onChange(opt.value)}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
