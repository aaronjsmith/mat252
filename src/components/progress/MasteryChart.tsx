import type { TopicId } from '../../data/catalog';
import type { MasteryView } from '../../state/progress';
import styles from './MasteryChart.module.css';

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function sectorPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  a0: number,
  a1: number,
): string {
  if (a1 - a0 < 0.01) return '';
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = polar(cx, cy, rOuter, a0);
  const [x1, y1] = polar(cx, cy, rOuter, a1);
  const [xi0, yi0] = polar(cx, cy, rInner, a0);
  const [xi1, yi1] = polar(cx, cy, rInner, a1);
  return [
    `M${x0.toFixed(2)},${y0.toFixed(2)}`,
    `A${rOuter},${rOuter} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`,
    `L${xi1.toFixed(2)},${yi1.toFixed(2)}`,
    `A${rInner},${rInner} 0 ${large} 0 ${xi0.toFixed(2)},${yi0.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function formatPct(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function MasteryChart({
  view,
  compact = false,
  onTopicClick,
}: {
  view: MasteryView;
  compact?: boolean;
  onTopicClick?: (id: TopicId) => void;
}) {
  const n = view.slices.length || 1;
  const size = compact ? 88 : 220;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = compact ? 38 : 96;
  const rHole = compact ? 20 : 46;
  const gap = n > 1 ? (compact ? 1.6 : 1.2) : 0;
  const sweep = 360 / n;

  return (
    <div className={styles.chart} data-compact={compact || undefined}>
      <div className={styles.pieWrap}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`Overall mastery ${formatPct(view.overall)} percent. ${view.mastered} of ${view.total} topics mastered.`}
        >
          {view.slices.map((slice, i) => {
            const a0 = i * sweep + gap / 2;
            const a1 = (i + 1) * sweep - gap / 2;
            const frac = Math.max(0, Math.min(1, slice.mastery / 100));
            const track = sectorPath(cx, cy, rHole, rOuter, a0, a1);
            const rFilled = rHole + (rOuter - rHole) * frac;
            const fill = frac > 0.02 ? sectorPath(cx, cy, rHole, rFilled, a0, a1) : '';
            return (
              <g key={slice.id}>
                {track ? (
                  <path
                    d={track}
                    fill={slice.color}
                    fillOpacity={0.22}
                    stroke="var(--bg-surface)"
                    strokeWidth={compact ? 0.8 : 1}
                  />
                ) : null}
                {fill ? (
                  <path
                    d={fill}
                    fill={slice.color}
                    stroke="var(--bg-surface)"
                    strokeWidth={compact ? 0.6 : 0.75}
                  >
                    <title>
                      {slice.label}: {slice.unaided}/{slice.needed}
                    </title>
                  </path>
                ) : null}
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={rHole - (compact ? 1 : 2)} fill="var(--bg-surface)" />
          <text
            x={cx}
            y={cy - (compact ? 2 : 6)}
            textAnchor="middle"
            className={styles.piePct}
            fontSize={compact ? 13 : 22}
          >
            {formatPct(view.overall)}%
          </text>
          <text
            x={cx}
            y={cy + (compact ? 11 : 14)}
            textAnchor="middle"
            className={styles.pieSub}
            fontSize={compact ? 6.5 : 10}
          >
            overall
          </text>
        </svg>
        {!compact ? (
          <p className={styles.summary}>
            {view.mastered} of {view.total} topics mastered · {view.unaidedNeeded} unaided each
          </p>
        ) : null}
      </div>

      {!compact ? (
        <ul className={styles.list}>
          {view.slices.map((slice) => {
            const pct = Math.round(slice.mastery);
            const inner = (
              <>
                <div className={styles.topicHead}>
                  <i style={{ background: slice.color }} />
                  <span>
                    {slice.mastered ? '✓ ' : ''}
                    {slice.label}
                  </span>
                  <em>
                    {slice.unaided}/{slice.needed} · {pct}%
                  </em>
                </div>
                <div className={styles.bar} role="presentation">
                  <i style={{ width: `${pct}%`, background: slice.color }} />
                </div>
              </>
            );
            return (
              <li key={slice.id} className={styles.topic} data-mastered={slice.mastered || undefined}>
                {onTopicClick ? (
                  <button
                    type="button"
                    className={styles.topicBtn}
                    onClick={() => onTopicClick(slice.id)}
                    title={slice.label}
                  >
                    {inner}
                  </button>
                ) : (
                  <div className={styles.topicBtn} title={slice.label}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
