import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../context/LanguageContext';
import { fmt } from '../../i18n/locale';
import {
  formatNoteNumber,
  notesSumOf,
  parseNoteNumbers,
  sortNumbersInPlace,
  uniqueLine,
} from '../../lib/scratch';
import styles from './ScratchPad.module.css';

type Target = { start: number; end: number; text: string };

type Props = {
  storageKey: string;
  onCopyExcel: (notesText: string) => void;
  copyBusy?: boolean;
  insert?: { key: number; text: string };
};

export function ScratchPad({ storageKey, onCopyExcel, copyBusy, insert }: Props) {
  const { t } = useI18n();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<{ msg: string; empty?: boolean } | null>(null);

  useEffect(() => {
    try {
      setText(localStorage.getItem(storageKey) || '');
    } catch {
      setText('');
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: string) => {
      setText(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  useEffect(() => {
    if (!insert?.text) return;
    persist(insert.text);
  }, [insert?.key, insert?.text, persist]);

  function target(): Target {
    const ta = taRef.current;
    if (!ta) return { start: 0, end: text.length, text };
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (typeof start === 'number' && typeof end === 'number' && end > start) {
      return { start, end, text: ta.value.slice(start, end) };
    }
    return { start: 0, end: ta.value.length, text: ta.value };
  }

  function replaceTarget(sel: Target, replacement: string) {
    const ta = taRef.current;
    const before = text.slice(0, sel.start);
    const after = text.slice(sel.end);
    const next = before + replacement + after;
    persist(next);
    const caret = before.length + replacement.length;
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(before.length, caret);
    });
  }

  function updateStatus(nums: number[]) {
    if (!nums.length) {
      setStatus({ msg: t.notesStatusEmpty, empty: true });
      return;
    }
    setStatus({
      msg: fmt(t.notesStatus, { n: nums.length, sum: formatNoteNumber(notesSumOf(nums)) }),
    });
  }

  function onSort(desc: boolean) {
    const sel = target();
    const result = sortNumbersInPlace(sel.text, desc);
    if (!result) {
      setStatus({ msg: t.notesStatusEmpty, empty: true });
      return;
    }
    replaceTarget(sel, result.text);
    updateStatus(result.nums);
  }

  function onSum() {
    const sel = target();
    const nums = parseNoteNumbers(sel.text);
    if (!nums.length) {
      setStatus({ msg: t.notesStatusEmpty, empty: true });
      return;
    }
    const line = fmt(t.notesSumLine, { n: nums.length, sum: formatNoteNumber(notesSumOf(nums)) });
    const joined = (sel.text.replace(/\s+$/, '') + '\n' + line).replace(/^\n/, '');
    replaceTarget(sel, joined);
    updateStatus(nums);
  }

  function onUnique() {
    const sel = target();
    const nums = parseNoteNumbers(sel.text);
    if (!nums.length) {
      setStatus({ msg: t.notesStatusEmpty, empty: true });
      return;
    }
    const line = uniqueLine(nums, (list) => fmt(t.notesUniqueLine, { list }));
    const joined = (sel.text.replace(/\s+$/, '') + '\n' + line).replace(/^\n/, '');
    replaceTarget(sel, joined);
    updateStatus(nums);
  }

  return (
    <div className={styles.pad}>
      <div className={styles.head}>
        <label htmlFor="scratch-notes">{t.notesLabel}</label>
        <div className={styles.tools} role="group" aria-label={t.notesToolsAria}>
          <button type="button" className={styles.tool} title={t.notesSortAscTitle} onClick={() => onSort(false)}>
            {t.notesSortAsc}
          </button>
          <button type="button" className={styles.tool} title={t.notesSortDescTitle} onClick={() => onSort(true)}>
            {t.notesSortDesc}
          </button>
          <button type="button" className={styles.tool} title={t.notesSumTitle} onClick={onSum}>
            {t.notesSum}
          </button>
          <button type="button" className={styles.tool} title={t.notesUniqueTitle} onClick={onUnique}>
            {t.notesUnique}
          </button>
          <button
            type="button"
            className={styles.tool}
            title={t.excelCopyAria}
            aria-label={t.excelCopyAria}
            onClick={() => onCopyExcel(taRef.current?.value ?? text)}
          >
            {copyBusy ? t.excelCopied : t.excelCopy}
          </button>
        </div>
      </div>
      <textarea
        id="scratch-notes"
        ref={taRef}
        rows={4}
        spellCheck={false}
        placeholder={t.notesPlaceholder}
        value={text}
        onChange={(e) => persist(e.target.value)}
      />
      {status && (
        <p className={`${styles.status} ${status.empty ? styles.empty : ''}`} aria-live="polite">
          {status.msg}
        </p>
      )}
    </div>
  );
}
