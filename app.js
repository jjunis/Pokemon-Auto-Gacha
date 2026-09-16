// Unity/C# 대응표
// const/let      ↔ 변수 선언
// function       ↔ 메서드
// Array.map      ↔ LINQ Select
// Array.filter   ↔ LINQ Where
// fetch          ↔ UnityWebRequest.Get
// document...    ↔ GameObject/UI 컴포넌트 찾기

const TOTAL_POKEMON = 1025;
let collectionData = null;

const byId = (id) => document.getElementById(id);

async function loadCollection() {
  try {
    const response = await fetch(`data/collection.json?t=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    collectionData = await response.json();
    renderDashboard(collectionData);
  } catch (error) {
    console.error(error);
    byId("latestCard").className = "latest-card error";
    byId("latestCard").textContent = "데이터를 불러오지 못했습니다. Actions 실행 여부를 확인하세요.";
  }
}

function renderDashboard(data) {
  const pokemon = Object.values(data.pokemon ?? {});
  const ssrCount = pokemon.filter((item) => item.grade === "SSR").length;

  byId("updatedAt").textContent = `마지막 갱신 · ${formatDate(data.updatedAt)}`;
  byId("totalPulls").textContent = data.totalPulls.toLocaleString("ko-KR");
  byId("uniqueCount").textContent = pokemon.length.toLocaleString("ko-KR");
  byId("completionRate").textContent = `${((pokemon.length / TOTAL_POKEMON) * 100).toFixed(1)}%`;
  byId("ssrCount").textContent = ssrCount;

  renderLatest(data.lastPull);
  renderRecords(pokemon);
  renderTypeProgress(pokemon, data.typeTotals ?? {});
  renderRecent(data.pulls ?? []);
  renderCollection(pokemon);
}

function renderLatest(item) {
  if (!item) return;
  const container = byId("latestCard");
  const badge = byId("latestGrade");
  badge.textContent = item.grade;
  badge.className = `grade-badge grade-${item.grade}`;
  container.className = `latest-card ${item.grade === "SSR" ? "ssr-flash" : ""}`;
  container.innerHTML = `
    <img src="${item.image}" alt="${item.name} 공식 아트워크">
    <div class="latest-info">
      <h3>${item.name}</h3>
      <p>${item.types.join(" · ")} 타입</p>
      <p>종합 능력치 <strong>${item.totalStats}</strong></p>
      <p>${formatDate(item.pulledAt)} 획득</p>
    </div>`;
}

function renderRecords(pokemon) {
  const mostPulled = [...pokemon].sort((a, b) => b.count - a.count)[0];
  const strongest = [...pokemon].sort((a, b) => b.totalStats - a.totalStats)[0];
  byId("records").innerHTML = `
    <article class="record"><span>가장 많이 나온 포켓몬</span><strong>${mostPulled ? `${mostPulled.name} × ${mostPulled.count}` : "-"}</strong></article>
    <article class="record"><span>최고 능력치 포켓몬</span><strong>${strongest ? `${strongest.name} · ${strongest.totalStats}` : "-"}</strong></article>`;
}

function renderTypeProgress(pokemon, typeTotals) {
  const ownedByType = {};
  for (const item of pokemon) {
    for (const type of item.types) ownedByType[type] = (ownedByType[type] ?? 0) + 1;
  }

  const rows = Object.keys(typeTotals).sort().map((type) => {
    const owned = ownedByType[type] ?? 0;
    const total = typeTotals[type] || 1;
    const percent = Math.min(100, (owned / total) * 100);
    return `<article class="type-row">
      <header><strong>${type}</strong><span>${owned}/${total}</span></header>
      <div class="progress"><span style="width:${percent}%"></span></div>
    </article>`;
  });
  byId("typeProgress").innerHTML = rows.join("") || '<p class="empty">타입 데이터가 없습니다.</p>';
}

function renderRecent(pulls) {
  byId("recentPulls").innerHTML = pulls.slice(0, 10).map((item) => `
    <li>
      <span class="history-grade grade-${item.grade}">${item.grade}</span>
      <strong>${item.name}</strong>
      <time class="history-time">${formatDate(item.pulledAt)}</time>
    </li>`).join("") || '<li class="empty">아직 뽑기 기록이 없습니다.</li>';
}

function renderCollection(pokemon, keyword = "") {
  const normalized = keyword.trim().toLowerCase();
  const filtered = pokemon
    .filter((item) => item.name.includes(normalized) || item.types.some((type) => type.includes(normalized)))
    .sort((a, b) => gradeScore(b.grade) - gradeScore(a.grade) || b.totalStats - a.totalStats);

  const grid = byId("collectionGrid");
  grid.innerHTML = "";
  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty">조건에 맞는 포켓몬이 없습니다.</p>';
    return;
  }

  for (const item of filtered) {
    const card = byId("pokemonCardTemplate").content.cloneNode(true);
    const grade = card.querySelector(".card-grade");
    grade.textContent = item.grade;
    grade.classList.add(`grade-${item.grade}`);
    const image = card.querySelector(".card-image");
    image.src = item.image;
    image.alt = `${item.name} 이미지`;
    card.querySelector(".card-name").textContent = item.name;
    card.querySelector(".card-types").textContent = item.types.join(" · ");
    card.querySelector(".card-stats").textContent = item.totalStats;
    card.querySelector(".card-count").textContent = `${item.count}회`;
    card.querySelector(".card-fusion").textContent = `+${item.fusionLevel}`;
    grid.append(card);
  }
}

function gradeScore(grade) {
  return ({ SSR: 4, SR: 3, R: 2, N: 1 })[grade] ?? 0;
}

function formatDate(value) {
  if (!value) return "기록 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short"
  }).format(new Date(value));
}

byId("searchInput").addEventListener("input", (event) => {
  renderCollection(Object.values(collectionData?.pokemon ?? {}), event.target.value);
});

loadCollection();
