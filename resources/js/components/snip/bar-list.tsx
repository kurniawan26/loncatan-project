export interface BarListItem {
    label: string;
    value: number;
    code?: string;
}

interface BarListProps {
    items: BarListItem[];
    showFlag?: boolean;
}

export function BarList({ items, showFlag = false }: BarListProps) {
    const max = Math.max(...items.map((i) => i.value), 1);

    return (
        <div className="barlist">
            {items.map((item, i) => (
                <div className="bl-row" key={i}>
                    <div className="bl-track">
                        <div className="bl-fill" style={{ width: `${(item.value / max) * 100}%` }} />
                        <div className="bl-label">
                            {showFlag && item.code && <span className="bl-flag">{item.code}</span>}
                            {item.label}
                        </div>
                    </div>
                    <div className="bl-val">{item.value}%</div>
                </div>
            ))}
        </div>
    );
}
