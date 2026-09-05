import { mkdir, writeFile, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// 채널 슬러그. are.na에서 채널을 열었을 때 주소 마지막 조각.
// 예: https://www.are.na/aamemoho-oh/geodeonaegi  ->  "geodeonaegi"
const CHANNEL = process.env.ARENA_CHANNEL ?? "CHANNEL-SLUG-HERE";

const SITE = "site";
const DATA = join(SITE, "data");

// 블록 설명에서 "뺀 것 / 예상 / 실제" 세 줄을 뽑는다.
// 형식이 안 맞으면 통째로 raw 에 남긴다. 기록을 버리지 않는 게 우선.
function parseBlock(text = "") {
  const out = { removed: "", expected: "", actual: "", raw: text.trim() };
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*(뺀\s*것|예상|실제)\s*[:：]\s*(.*)$/);
    if (!m) continue;
    const value = m[2].trim();
    if (m[1].startsWith("뺀")) out.removed = value;
    else if (m[1] === "예상") out.expected = value;
    else out.actual = value;
  }
  return out;
}

async function fetchChannel(slug) {
  const url = `https://api.are.na/v2/channels/${encodeURIComponent(slug)}?per=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`are.na ${res.status}`);
  const json = await res.json();

  return (json.contents ?? [])
    .map((b) => ({
      id: b.id,
      title: b.title ?? "",
      image: b.image?.large?.url ?? b.image?.display?.url ?? null,
      source: b.source?.url ?? null,
      arena: `https://www.are.na/block/${b.id}`,
      added: b.created_at,
      ...parseBlock(b.description ?? ""),
    }))
    .reverse(); // 오래된 것부터
}

async function readElements() {
  const dir = join(SITE, "elements");
  const names = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of names) {
    if (!entry.isDirectory()) continue;
    try {
      const meta = JSON.parse(
        await readFile(join(dir, entry.name, "meta.json"), "utf8")
      );
      out.push({ ...meta, id: meta.id ?? entry.name });
    } catch {
      console.warn(`meta.json 없음: ${entry.name} — 건너뜀`);
    }
  }
  return out;
}

await mkdir(DATA, { recursive: true });

let observations = [];
try {
  observations = await fetchChannel(CHANNEL);
  console.log(`are.na 블록 ${observations.length}개 가져옴`);
} catch (err) {
  console.warn(`are.na 못 가져옴 (${err.message}) — 이전 스냅샷 유지`);
  try {
    observations = JSON.parse(await readFile(join(DATA, "arena.json"), "utf8"));
  } catch {
    observations = [];
  }
}

const elements = await readElements();
console.log(`요소 ${elements.length}개`);

await writeFile(join(DATA, "arena.json"), JSON.stringify(observations, null, 2));
await writeFile(join(DATA, "elements.json"), JSON.stringify(elements, null, 2));
