export function parseNoteNumbers(text: string): number[] {
  const re = /-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/gi;
  const out: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const n = parseFloat(m[0]);
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

export function formatNoteNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 1e10) / 1e10);
}

export function notesSumOf(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

export function sortNumbersInPlace(text: string, desc: boolean): { text: string; nums: number[] } | null {
  const re = /-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/gi;
  const nums = parseNoteNumbers(text);
  if (!nums.length) return null;
  const sorted = nums.slice().sort((a, b) => (desc ? b - a : a - b));
  let i = 0;
  const out = text.replace(re, () => formatNoteNumber(sorted[i++]!));
  return { text: out, nums: sorted };
}

export function uniqueLine(nums: number[], label: (list: string) => string): string {
  const freq: Record<string, number> = {};
  const order: string[] = [];
  for (const n of nums) {
    const key = formatNoteNumber(n);
    if (!Object.prototype.hasOwnProperty.call(freq, key)) {
      freq[key] = 0;
      order.push(key);
    }
    freq[key]! += 1;
  }
  order.sort((a, b) => parseFloat(a) - parseFloat(b));
  const list = order.map((k) => k + (freq[k]! > 1 ? '×' + freq[k] : '')).join(', ');
  return label(list);
}

/** MAT 107 sheet copy: row numbers + column letters as TSV for Excel. */
export function excelValuesTsv(values: number[]): string {
  const lines = ['\tA'];
  values.forEach((v, i) => {
    lines.push(`${i + 1}\t${formatNoteNumber(v)}`);
  });
  return lines.join('\n');
}

export function valuesFromPrompt(prompt: string): number[] {
  const brace = prompt.match(/\{([^}]+)\}/);
  if (brace) {
    const nums = parseNoteNumbers(brace[1]!);
    if (nums.length >= 2) return nums;
  }
  const freq = prompt.match(/frequencies?\s+(-?\d+(?:\s*,\s*-?\d+)+)/i)
    || prompt.match(/frecuencias\s+(-?\d+(?:\s*,\s*-?\d+)+)/i);
  if (freq) {
    const nums = parseNoteNumbers(freq[1]!);
    if (nums.length >= 2) return nums;
  }
  return [];
}

export function fallbackCopyText(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  // Prefer a synchronous copy while the click gesture is still active.
  if (fallbackCopyText(text)) return true;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
