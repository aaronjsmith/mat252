/**
 * Fetch Canvas course 27287 modules + items + page bodies into content/.
 * Uses CANVAS_BASE, CANVAS_COURSE_ID, and either CANVAS_TOKEN or CANVAS_COOKIE.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.CANVAS_BASE ?? 'https://ensign.instructure.com';
const COURSE = process.env.CANVAS_COURSE_ID ?? '27287';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'canvas');

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: 'application/json' };
  if (process.env.CANVAS_TOKEN) {
    h.Authorization = `Bearer ${process.env.CANVAS_TOKEN}`;
  } else if (process.env.CANVAS_COOKIE) {
    h.Cookie = process.env.CANVAS_COOKIE;
  }
  return h;
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: headers(), redirect: 'follow' });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}\n${text.slice(0, 400)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return { html: text };
  }
}

async function getAll<T>(url: string): Promise<T[]> {
  const out: T[] = [];
  let next: string | null = url;
  while (next) {
    const res = await fetch(next, { headers: headers(), redirect: 'follow' });
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${next}\n${text.slice(0, 400)}`);
    const page = JSON.parse(text) as T[];
    out.push(...page);
    const link = res.headers.get('Link') || '';
    const m = link.match(/<([^>]+)>;\s*rel="next"/);
    next = m ? m[1]! : null;
  }
  return out;
}

async function main() {
  await mkdir(ROOT, { recursive: true });
  const course = await getJson(`${BASE}/api/v1/courses/${COURSE}`);
  await writeFile(join(ROOT, 'course.json'), JSON.stringify(course, null, 2));

  const modules = await getAll<Record<string, unknown>>(
    `${BASE}/api/v1/courses/${COURSE}/modules?per_page=100`,
  );
  await writeFile(join(ROOT, 'modules.json'), JSON.stringify(modules, null, 2));

  const index: unknown[] = [];
  for (const mod of modules) {
    const id = mod.id as number;
    const items = await getAll<Record<string, unknown>>(
      `${BASE}/api/v1/courses/${COURSE}/modules/${id}/items?per_page=100&include[]=content_details`,
    );
    const slug = String(mod.name ?? id).replace(/[^\w.-]+/g, '_').slice(0, 80);
    const dir = join(ROOT, 'modules', `${id}-${slug}`);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'items.json'), JSON.stringify(items, null, 2));

    for (const item of items) {
      const type = String(item.type ?? '');
      const itemId = item.id;
      const pageUrl = item.url ? String(item.url) : '';
      if (type === 'Page' && item.page_url) {
        const page = await getJson(
          `${BASE}/api/v1/courses/${COURSE}/pages/${encodeURIComponent(String(item.page_url))}`,
        );
        await writeFile(join(dir, `page-${itemId}.json`), JSON.stringify(page, null, 2));
      } else if (type === 'File' && pageUrl) {
        try {
          const meta = await getJson(pageUrl);
          await writeFile(join(dir, `file-${itemId}.json`), JSON.stringify(meta, null, 2));
        } catch (err) {
          await writeFile(join(dir, `file-${itemId}.error.txt`), String(err));
        }
      } else if ((type === 'Assignment' || type === 'Quiz' || type === 'Discussion') && pageUrl) {
        try {
          const body = await getJson(pageUrl);
          await writeFile(join(dir, `${type.toLowerCase()}-${itemId}.json`), JSON.stringify(body, null, 2));
        } catch (err) {
          await writeFile(join(dir, `${type.toLowerCase()}-${itemId}.error.txt`), String(err));
        }
      }
    }
    index.push({ id, name: mod.name, items: items.length });
  }
  await writeFile(join(ROOT, 'index.json'), JSON.stringify(index, null, 2));
  console.log(`Wrote ${modules.length} modules to ${ROOT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
