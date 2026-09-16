import { readFile, writeFile, mkdir } from "node:fs/promises";

const DATA_PATH = "data/collection.json";
const README_PATH = "README.md";
const MAX_POKEMON_ID = 1025;
const TYPES = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];

await mkdir("data", { recursive: true });
const collection = await loadCollection();
const pokemonId = randomInt(1, MAX_POKEMON_ID);

// TODO-API-1: PokéAPI 주소에 무작위 pokemonId를 넣고 fetch로 요청하세요.
// 정답 예시는 Notion 수업 자료에 있습니다.
const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
if (!response.ok) throw new Error(`PokéAPI 호출 실패: HTTP ${response.status}`);

// TODO-API-2: HTTP 응답 본문을 JavaScript 객체로 변환하세요.
// null을 올바른 코드로 교체해야 아래 데이터 가공 코드가 작동합니다.
const apiPokemon = await response.json();

if (Object.keys(collection.typeTotals ?? {}).length === 0) {
  collection.typeTotals = await loadTypeTotals();
}

const totalStats = apiPokemon.stats.reduce((sum, item) => sum + item.base_stat, 0);
const pulledAt = new Date().toISOString();
const pull = {
  id: apiPokemon.id,
  name: apiPokemon.name,
  image: apiPokemon.sprites.other["official-artwork"].front_default ?? apiPokemon.sprites.front_default,
  types: apiPokemon.types.map((item) => item.type.name),
  totalStats,
  grade: calculateGrade(totalStats),
  pulledAt
};

const key = String(pull.id);
const existing = collection.pokemon[key];
if (existing) {
  existing.count += 1;
  existing.fusionLevel = Math.floor((existing.count - 1) / 3);
  existing.lastPulledAt = pulledAt;
} else {
  collection.pokemon[key] = {
    ...pull,
    count: 1,
    fusionLevel: 0,
    firstPulledAt: pulledAt,
    lastPulledAt: pulledAt
  };
}

collection.totalPulls += 1;
collection.updatedAt = pulledAt;
collection.lastPull = pull;
collection.pulls.unshift(pull);
collection.pulls = collection.pulls.slice(0, 10);

// TODO-API-3: collection 객체를 JSON 문자열로 변환해 DATA_PATH에 저장하세요.
// 아래 오류 발생 코드를 writeFile 코드로 교체합니다.
await writeFile(DATA_PATH, `${JSON.stringify(collection, null, 2)}\n` ,"utf8");

await updateReadme(collection);

// Workflow의 커밋 메시지에서 사용합니다.
console.log(`RESULT_NAME=${pull.name}`);
console.log(`RESULT_GRADE=${pull.grade}`);
console.log(`뽑기 완료: ${pull.name} [${pull.grade}] / 능력치 ${pull.totalStats}`);

async function loadCollection() {
  try {
    return JSON.parse(await readFile(DATA_PATH, "utf8"));
  } catch {
    return { version: 1, totalPulls: 0, updatedAt: null, lastPull: null, pulls: [], pokemon: {}, typeTotals: {} };
  }
}

async function loadTypeTotals() {
  const entries = await Promise.all(TYPES.map(async (type) => {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    if (!response.ok) throw new Error(`타입 데이터 호출 실패: ${type}`);
    const data = await response.json();
    const validIds = new Set(data.pokemon
      .map((entry) => Number(entry.pokemon.url.match(/\/pokemon\/(\d+)\/?$/)?.[1]))
      .filter((id) => Number.isInteger(id) && id <= MAX_POKEMON_ID));
    return [type, validIds.size];
  }));
  return Object.fromEntries(entries);
}

function calculateGrade(totalStats) {
  if (totalStats >= 600) return "SSR";
  if (totalStats >= 500) return "SR";
  if (totalStats >= 400) return "R";
  return "N";
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function updateReadme(data) {
  let readme = await readFile(README_PATH, "utf8");
  const uniqueCount = Object.keys(data.pokemon).length;
  const latest = data.lastPull;
  const autoSection = `<!-- AUTO-GACHA:START -->\n## 자동 가챠 현황\n\n- 최근 획득: **${latest.name} [${latest.grade}]**\n- 종합 능력치: **${latest.totalStats}**\n- 총 뽑기: **${data.totalPulls}회**\n- 보유 종류: **${uniqueCount}/${MAX_POKEMON_ID}**\n- 마지막 갱신: **${latest.pulledAt}**\n\n<!-- AUTO-GACHA:END -->`;
  readme = readme.replace(/<!-- AUTO-GACHA:START -->[\s\S]*?<!-- AUTO-GACHA:END -->/, autoSection);
  await writeFile(README_PATH, readme, "utf8");
}