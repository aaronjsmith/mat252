/** Inline SVG figures for quiz prompts (MAT 107–style). */

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export type BarChartOpts = {
  values: number[];
  labels: string[];
  title?: string;
  yLabel?: string;
  highlight?: number;
  ariaLabel?: string;
};

/** Vertical bar / histogram chart. */
export function barChartSvg(opts: BarChartOpts): string {
  const { values, labels, title, yLabel, highlight, ariaLabel } = opts;
  const n = values.length;
  if (!n) return '';

  const padL = yLabel ? 42 : 28;
  const padR = 16;
  const padT = title ? 28 : 16;
  const padB = 36;
  const plotW = Math.max(220, Math.min(340, 48 * n + 40));
  const plotH = 150;
  const gap = 6;
  const barW = (plotW - gap * (n - 1)) / n;
  const maxH = Math.max(...values, 1);
  const ox = padL;
  const oy = padT;
  const baseY = oy + plotH;
  const vbW = padL + plotW + padR;
  const vbH = padT + plotH + padB;

  const fill = '#6fbf94';
  const fillHi = '#2e6b4f';
  const stroke = '#1d5038';
  const axis = '#6b7a6d';
  const ink = '#161d17';

  let bars = '';
  for (let i = 0; i < n; i++) {
    const v = values[i]!;
    const bh = (v / maxH) * (plotH - 6);
    const x = ox + i * (barW + gap);
    const y = baseY - bh;
    const isHi = highlight === i;
    bars +=
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" ` +
      `fill="${isHi ? fillHi : fill}" stroke="${stroke}" stroke-width="1.2" rx="3"/>` +
      `<text x="${(x + barW / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle" ` +
      `font-size="11" font-family="system-ui,sans-serif" font-weight="600" fill="${ink}">${v}</text>` +
      `<text x="${(x + barW / 2).toFixed(1)}" y="${(baseY + 16).toFixed(1)}" text-anchor="middle" ` +
      `font-size="11" font-family="system-ui,sans-serif" fill="${axis}">${esc(labels[i] ?? String(i + 1))}</text>`;
  }

  const axisLines =
    `<line x1="${ox}" y1="${baseY}" x2="${ox + plotW}" y2="${baseY}" stroke="${axis}" stroke-width="1.5"/>` +
    `<line x1="${ox}" y1="${oy}" x2="${ox}" y2="${baseY}" stroke="${axis}" stroke-width="1.5"/>`;

  const titleEl = title
    ? `<text x="${(vbW / 2).toFixed(1)}" y="16" text-anchor="middle" font-size="12" ` +
      `font-family="system-ui,sans-serif" font-weight="700" fill="${ink}">${esc(title)}</text>`
    : '';

  const yEl = yLabel
    ? `<text x="12" y="${(oy + plotH / 2).toFixed(1)}" text-anchor="middle" font-size="10" ` +
      `font-family="system-ui,sans-serif" fill="${axis}" ` +
      `transform="rotate(-90 12 ${(oy + plotH / 2).toFixed(1)})">${esc(yLabel)}</text>`
    : '';

  const label = ariaLabel || title || 'Bar chart';
  return (
    `<svg viewBox="0 0 ${vbW.toFixed(1)} ${vbH.toFixed(1)}" xmlns="http://www.w3.org/2000/svg" ` +
    `class="q-svg" role="img" aria-label="${esc(label)}">` +
    titleEl +
    yEl +
    axisLines +
    bars +
    `</svg>`
  );
}

export type SkewKind = 'left' | 'right' | 'symmetric';

/** Shape histogram for skew / center questions. */
export function skewHistogramSvg(kind: SkewKind, locale: 'en' | 'es' = 'en'): string {
  let heights: number[];
  let label: string;
  if (kind === 'left') {
    heights = [1.2, 1.6, 2.2, 3.0, 4.2, 6.0, 8.5, 7.2];
    label = locale === 'es' ? 'Histograma sesgado a la izquierda' : 'Left-skewed histogram';
  } else if (kind === 'right') {
    heights = [7.2, 8.5, 6.0, 4.2, 3.0, 2.2, 1.6, 1.2];
    label = locale === 'es' ? 'Histograma sesgado a la derecha' : 'Right-skewed histogram';
  } else {
    heights = [2.5, 4.5, 7.0, 8.5, 8.5, 7.0, 4.5, 2.5];
    label = locale === 'es' ? 'Histograma aproximadamente simétrico' : 'Roughly symmetric histogram';
  }

  const labels = heights.map((_, i) => String(i + 1));
  // Scale to integers for display counts
  const max = Math.max(...heights);
  const values = heights.map((h) => Math.round((h / max) * 20));
  return barChartSvg({
    values,
    labels,
    title: label,
    yLabel: locale === 'es' ? 'Frecuencia' : 'Frequency',
    ariaLabel: label,
  });
}

/** Simple normal curve with μ ± kσ markers (empirical-rule reference). */
export function normalCurveSvg(
  mu: number,
  sigma: number,
  shadeLo?: number,
  shadeHi?: number,
  locale: 'en' | 'es' = 'en',
): string {
  const padL = 24;
  const padR = 24;
  const padT = 20;
  const padB = 32;
  const plotW = 300;
  const plotH = 120;
  const vbW = padL + plotW + padR;
  const vbH = padT + plotH + padB;
  const ox = padL;
  const oy = padT;
  const baseY = oy + plotH;

  const xMin = mu - 3.5 * sigma;
  const xMax = mu + 3.5 * sigma;
  const toX = (x: number) => ox + ((x - xMin) / (xMax - xMin)) * plotW;
  const density = (x: number) => {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z);
  };
  const peak = density(mu);
  const toY = (d: number) => baseY - (d / peak) * (plotH - 8);

  const steps = 60;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + ((xMax - xMin) * i) / steps;
    pts.push(`${toX(x).toFixed(1)},${toY(density(x)).toFixed(1)}`);
  }

  let shade = '';
  if (shadeLo != null && shadeHi != null) {
    const sPts: string[] = [`${toX(shadeLo).toFixed(1)},${baseY.toFixed(1)}`];
    for (let i = 0; i <= steps; i++) {
      const x = shadeLo + ((shadeHi - shadeLo) * i) / steps;
      sPts.push(`${toX(x).toFixed(1)},${toY(density(x)).toFixed(1)}`);
    }
    sPts.push(`${toX(shadeHi).toFixed(1)},${baseY.toFixed(1)}`);
    shade =
      `<polygon points="${sPts.join(' ')}" fill="#6fbf94" fill-opacity="0.35" stroke="none"/>`;
  }

  const axis = '#6b7a6d';
  const ink = '#161d17';
  const stroke = '#2e6b4f';

  const tick = (x: number, lab: string) =>
    `<line x1="${toX(x).toFixed(1)}" y1="${baseY}" x2="${toX(x).toFixed(1)}" y2="${baseY + 5}" stroke="${axis}" stroke-width="1"/>` +
    `<text x="${toX(x).toFixed(1)}" y="${baseY + 18}" text-anchor="middle" font-size="10" ` +
    `font-family="system-ui,sans-serif" fill="${ink}">${esc(lab)}</text>`;

  const label =
    locale === 'es'
      ? `Curva normal μ=${mu}, σ=${sigma}`
      : `Normal curve μ=${mu}, σ=${sigma}`;

  return (
    `<svg viewBox="0 0 ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg" class="q-svg" role="img" aria-label="${esc(label)}">` +
    shade +
    `<polyline points="${pts.join(' ')}" fill="none" stroke="${stroke}" stroke-width="2.2"/>` +
    `<line x1="${ox}" y1="${baseY}" x2="${ox + plotW}" y2="${baseY}" stroke="${axis}" stroke-width="1.5"/>` +
    tick(mu - 2 * sigma, String(mu - 2 * sigma)) +
    tick(mu, `μ=${mu}`) +
    tick(mu + 2 * sigma, String(mu + 2 * sigma)) +
    `</svg>`
  );
}
