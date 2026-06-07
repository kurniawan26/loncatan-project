interface QRProps {
    seed?: number;
    size?: number;
    cells?: number;
}

function seededRandom(seed: number) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

export function QR({ seed = 42, size = 64, cells = 17 }: QRProps) {
    const rand = seededRandom(seed);
    const cellSize = size / cells;

    const grid: boolean[][] = Array.from({ length: cells }, () =>
        Array.from({ length: cells }, () => rand() > 0.5),
    );

    const isFinderCorner = (r: number, c: number) => {
        const inTopLeft = r < 7 && c < 7;
        const inTopRight = r < 7 && c >= cells - 7;
        const inBottomLeft = r >= cells - 7 && c < 7;
        return inTopLeft || inTopRight || inBottomLeft;
    };

    const renderFinder = (x: number, y: number) => (
        <g key={`finder-${x}-${y}`} transform={`translate(${x},${y})`}>
            <rect width={cellSize * 7} height={cellSize * 7} rx={cellSize} fill="var(--ink)" />
            <rect
                x={cellSize}
                y={cellSize}
                width={cellSize * 5}
                height={cellSize * 5}
                rx={cellSize * 0.5}
                fill="var(--surface)"
            />
            <rect
                x={cellSize * 2}
                y={cellSize * 2}
                width={cellSize * 3}
                height={cellSize * 3}
                rx={cellSize * 0.4}
                fill="var(--ink)"
            />
        </g>
    );

    return (
        <svg width={size} height={size} style={{ flexShrink: 0 }}>
            {grid.map((row, r) =>
                row.map((on, c) => {
                    if (!on || isFinderCorner(r, c)) return null;
                    return (
                        <rect
                            key={`${r}-${c}`}
                            x={c * cellSize}
                            y={r * cellSize}
                            width={cellSize - 1}
                            height={cellSize - 1}
                            rx={0.8}
                            fill="var(--ink)"
                        />
                    );
                }),
            )}
            {renderFinder(0, 0)}
            {renderFinder((cells - 7) * cellSize, 0)}
            {renderFinder(0, (cells - 7) * cellSize)}
        </svg>
    );
}
