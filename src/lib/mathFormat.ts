import katex from 'katex';

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Convert lightweight course math into TeX. */
export function toTex(raw: string): string {
  let s = String(raw ?? '').trim();
  if (!s) return '';

  s = s
    .replace(/[−–—]/g, '-')
    .replace(/×/g, ' \\times ')
    .replace(/÷/g, ' \\div ')
    .replace(/[·⋅]/g, ' \\cdot ')
    .replace(/≈/g, ' \\approx ')
    .replace(/≠/g, ' \\neq ')
    .replace(/≤/g, ' \\le ')
    .replace(/≥/g, ' \\ge ')
    .replace(/±/g, ' \\pm ')
    .replace(/π/g, '\\pi ')
    .replace(/∞/g, '\\infty ')
    .replace(/x̄/g, '\\bar{x}')
    .replace(/X̄/g, '\\bar{X}')
    .replace(/H₀/g, 'H_{0}')
    .replace(/Hₐ/g, 'H_{a}')
    .replace(/μ₀/g, '\\mu_{0}')
    .replace(/μₐ/g, '\\mu_{a}')
    .replace(/z\*/g, 'z^{*}')
    .replace(/r²/g, 'r^{2}')
    .replace(/x²/g, 'x^{2}')
    .replace(/√\s*\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/√\s*([A-Za-z0-9]+)/g, '\\sqrt{$1}')
    .replace(/√/g, '\\sqrt ');

  // Greek after Latin letter: zσ → z\sigma (implicit product)
  s = s.replace(/([A-Za-z0-9)])\s*μ/g, '$1\\mu ');
  s = s.replace(/([A-Za-z0-9)])\s*σ/g, '$1\\sigma ');
  s = s.replace(/([A-Za-z0-9)])\s*χ/g, '$1\\chi ');
  s = s.replace(/μ/g, '\\mu ');
  s = s.replace(/σ/g, '\\sigma ');
  s = s.replace(/χ/g, '\\chi ');
  s = s.replace(/α/g, '\\alpha ');
  s = s.replace(/β/g, '\\beta ');
  s = s.replace(/ρ/g, '\\rho ');

  // (2)(8) → (2)\times(8)
  s = s.replace(/\)\s*\(/g, ')\\times(');

  s = s.replace(/%/g, '\\%');
  s = s.replace(/\^\(([^)]+)\)/g, '^{($1)}');
  s = s.replace(/\b([A-Za-z])_([0-9]+|[nN])\b/g, '$1_{$2}');
  s = s.replace(/\b([A-Za-z])\^([0-9]+|[nN])\b/g, '$1^{$2}');

  s = s.replace(
    /\bC\(\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+)\s*\)/g,
    '\\mathrm{C}($1, $2)',
  );
  s = s.replace(
    /\bP\(\s*([nN0-9]+)\s*,\s*([rRkK0-9]+)\s*\)/g,
    '\\mathrm{P}($1, $2)',
  );

  s = s.replace(/([0-9A-Za-z]+!)\s*\/\s*(\([^()]+\)!)/g, '\\dfrac{$1}{$2}');
  s = s.replace(
    /([0-9A-Za-z]+!)\s*\/\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g,
    '\\dfrac{$1}{$2}',
  );
  s = s.replace(
    /\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*\/\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g,
    '\\dfrac{$1}{$2}',
  );
  // (num) / token  → fraction (e.g. (x − μ) / σ)
  s = s.replace(
    /\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*\/\s*([A-Za-z0-9\\_{}\\]+)/g,
    '\\dfrac{$1}{$2}',
  );
  // σ / √n after Greek conversion
  s = s.replace(/\\sigma\s*\/\s*\\sqrt\{([^}]+)\}/g, '\\dfrac{\\sigma}{\\sqrt{$1}}');
  s = s.replace(/\\sigma\s*\/\s*\\sqrt\s+([A-Za-z0-9]+)/g, '\\dfrac{\\sigma}{\\sqrt{$1}}');
  s = s.replace(
    /(^|[=+\-]\s*|,\s*)([A-Za-z0-9\\_{}\\]+!?)\s*\/\s*([A-Za-z0-9\\_{}\\]+!?)(?=\s*$|\s*[.,;])/g,
    '$1\\dfrac{$2}{$3}',
  );

  s = s.replace(/\bSE\(/g, '\\mathrm{SE}(');
  s = s.replace(/\bEE\(/g, '\\mathrm{EE}(');
  s = s.replace(/\bME\b/g, '\\mathrm{ME}');
  s = s.replace(/\bIQR\b/g, '\\mathrm{IQR}');
  s = s.replace(/\bRIC\b/g, '\\mathrm{RIC}');

  return s.replace(/ {2,}/g, ' ').trim();
}

function renderTex(tex: string, displayMode: boolean): string {
  if (!tex) return '';
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      trust: false,
    });
  } catch {
    return `<span class="math-fallback">${escapeHtml(tex)}</span>`;
  }
}

function looksLikeProse(s: string): boolean {
  const text = String(s);
  const mid = text.match(/\b[A-Za-z]{3,}\b/g) || [];
  const long = text.match(/\b[A-Za-z]{4,}\b/g) || [];
  if (mid.length >= 4 || long.length >= 2) return true;
  if (
    /\b(find|use|then|from|when|where|with|into|over|between|substitute|given|after|before|each|your|this|that|and|for|the|slope|intercept|mean|population|sample|standard|deviation|hypothesis|null|alternative|about|within|start|move|solve|describes|evidence|against|approach|side)\b/i.test(
      text,
    ) &&
    mid.length >= 2
  ) {
    return true;
  }
  const tokens = text.trim().split(/\s+/);
  if (tokens.length >= 5 && /[A-Za-z]{3,}/.test(text)) return true;
  return false;
}

function isEquationLine(line: string): boolean {
  const s = line.trim();
  if (!s || s.length > 180) return false;
  if (/^overview:/i.test(s)) return false;
  if (looksLikeProse(s)) return false;
  if (/[=≈]/.test(s)) return true;
  // Pure symbol / formula fragments
  if (/^[μσχx̄zHn\d\s+\-−×÷·⋅/()√±*^_.,]+$/u.test(s) && /[μσχx̄√=]/.test(s)) return true;
  return false;
}

function formatPlainMathHtml(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
  s = s.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
  s = s.replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>');
  s = s.replace(/([A-Za-z])_([0-9nN]+)/g, '$1<sub>$2</sub>');
  s = s.replace(/([A-Za-z0-9)])\^([0-9nN]+)/g, '$1<sup>$2</sup>');
  return s;
}

/**
 * Pull math chunks out of prose. Prefer short equations and symbols over
 * greedy matches that swallow English words.
 */
function formatInlineProse(line: string): string {
  const s = String(line);
  const parts: { type: 'text' | 'math'; value: string }[] = [];

  // Match candidates longest-first via a scan that stops before English words.
  const re =
    /(?:[A-Za-zμσχx̄X̄][₀ₐ0-9nN]*|(?:SE|EE|ME|IQR)\([^)]*\))\s*[=≈]\s*[^,;.?!\n]+?(?=(?:\s+(?:and|or|then|when|where|with|for|the|a|an|is|are|of|to|from|start|move|solve|use|find|what|which|about|population|sample|standard|mean|deviation|hypothesis)\b)|[,;.!?](?:\s|$)|$)|(?:μ₀|μₐ|H₀|Hₐ|x̄|X̄|z\*|r²|√n|√\([^)]+\)|[μσχ])/gu;

  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    let chunk = m[0].trimEnd();
    // Trim trailing English that may have slipped in
    chunk = chunk.replace(
      /\s+(and|or|then|when|where|with|for|the|a|an|is|are|of|to|from|start|move|solve|use|find|what|which|about|population|sample|standard|mean|deviation|hypothesis)\b.*$/i,
      '',
    );
    if (!chunk || looksLikeProse(chunk)) {
      re.lastIndex = m.index + 1;
      continue;
    }
    if (m.index > last) parts.push({ type: 'text', value: s.slice(last, m.index) });
    parts.push({ type: 'math', value: chunk });
    last = m.index + chunk.length;
    re.lastIndex = last;
  }
  if (last < s.length) parts.push({ type: 'text', value: s.slice(last) });
  if (!parts.length) parts.push({ type: 'text', value: s });

  return parts
    .map((p) => {
      if (p.type === 'text') return formatPlainMathHtml(p.value);
      return `<span class="math-inline">${renderTex(toTex(p.value), false)}</span>`;
    })
    .join('');
}

function formatLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return '<div class="math-gap" aria-hidden="true"></div>';

  if (isEquationLine(trimmed)) {
    return `<div class="math-block">${renderTex(toTex(trimmed), true)}</div>`;
  }

  return `<p class="math-prose">${formatInlineProse(trimmed)}</p>`;
}

/** Full rich HTML for prompts / hints / setup panels. */
export function formatRichHtml(text: string): string {
  if (text == null || text === '') return '';
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const out = ['<div class="math-doc">'];
  for (const line of lines) out.push(formatLine(line));
  out.push('</div>');
  return out.join('');
}

/** Lightweight HTML for short MC choices. */
export function formatMathHtml(text: string): string {
  if (text == null || text === '') return '';
  if (isEquationLine(text) || /[μσχ√̄₀ₐ²]/.test(text) || /[=^_]/.test(text)) {
    return `<span class="math-inline">${renderTex(toTex(text), false)}</span>`;
  }
  return formatInlineProse(text);
}
