import { formatMathHtml, formatRichHtml } from '../../lib/mathFormat';
import styles from './MathText.module.css';

type Props = {
  text: string;
  /** Rich multi-line formatting for prompts/hints/setup. */
  rich?: boolean;
  className?: string;
  as?: 'div' | 'span' | 'p' | 'h1';
};

export function MathText({ text, rich = false, className, as = 'div' }: Props) {
  const html = rich ? formatRichHtml(text) : formatMathHtml(text);
  const Tag = as;
  const cls = [styles.wrap, className].filter(Boolean).join(' ');
  return <Tag className={cls} dangerouslySetInnerHTML={{ __html: html }} />;
}
