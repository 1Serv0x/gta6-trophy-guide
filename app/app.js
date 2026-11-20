// Leonida Legend: an offline GTA VI trophy guide and tracker.
// Loads app/data/trophies.json (a local file), renders the 55-trophy checklist,
// the guide detail panel and the platinum roadmap, and saves progress in
// localStorage. Nothing is fetched from the network at run time.

const PROGRESS_KEY = 'leonida-legend-progress-v1';
const SPOILER_KEY = 'leonida-legend-spoiler-v1';
const DATA_URL = 'data/trophies.json';

const ROADMAP_STAGES = [
  {
    stage: 'story',
    title: 'Stage 1 — Play the story',
    hours: '60–80 hours',
    text: 'Play all five chapters with Jason and Lucia, from Gone Fishing to the final mission. Chapter and mission trophies pop on their own as you finish each one. Do the Chapter 1 balcony meditation with Lucia (see Positive Mental Attitude) before the chapter ends, keep a manual save at the start and end of every chapter, and scan new vehicles and study animals as you travel — that progress already counts towards 100% later.',
  },
  {
    stage: 'side',
    title: 'Stage 2 — Strangers & Freaks',
    hours: 'Alongside the story, finish after it',
    text: 'Stranger missions appear as icons on the map. Follow eight full strands to their ends, including the final missions for Andy, Kenton, Billy, Randy and Tyrone, and hunt Bret’s unique animal. Some quest givers are away during parts of the story — Andy’s strand is Lucia-only, Tyrone’s and Bret’s are Jason-only — but the guides report trophy quest givers return after the story, so nothing here is missable.',
  },
  {
    stage: 'collectibles',
    title: 'Stage 3 — Collectibles and exploration',
    hours: 'Fold into the story, finish in free roam',
    text: 'WAiNK-scan 100 locations, discover 100 vehicles, complete 3 card sets, buy all 8 garages and explore every corner of Leonida. The 100% checklist wants more of each (15 of 18 card sets, 200 of 277 vehicles), so keep collecting past the trophy totals and this stage feeds straight into Stage 5.',
  },
  {
    stage: 'activities',
    title: 'Stage 4 — Activities, races and robberies',
    hours: 'Fold into the story, finish in free roam',
    text: 'Gold all 42 Shooting Range challenges, win a Top Fun drone race at all 14 locations, win 20 different races, complete 250 stunts and 50 of the 80 challenges, and work the robberies: 5 bank vaults, an armored truck, a jewelry store without being seen, and an illegal operation for each of the 9 gangs. Launder $250,000 in Marked Bills and spend $100,000 in shops along the way.',
  },
  {
    stage: 'completion',
    title: 'Stage 5 — 100% completion and cleanup',
    hours: 'About 100 hours',
    text: 'After the credits, open Progress, then Stats, then 100% Completion and work what is left: every robbery and vault, the collectible totals, the activity totals and 70 of the 80 challenges. You do not need everything — only part of most activities — so stop each line the moment its checklist number is met, then mop up any trophies still missing.',
  },
  {
    stage: 'platinum',
    title: 'Platinum — Leonida Legend',
    hours: 'Pops on its own',
    text: 'Vice Got a Price! unlocks the moment the other 54 trophies are earned. There is nothing extra to do for it.',
  },
];

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail-panel');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade-filter');
const spoilerEl = document.getElementById('spoiler-toggle');
const statusEl = document.getElementById('filter-status');
const emptyNoteEl = document.getElementById('empty-note');

let trophies = [];
let listSources = [];
let earned = new Set(loadProgress());
let activeKind = 'all';
let selectedId = 28;
let spoilerOn = loadSpoiler();

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((name) => typeof name === 'string') : [];
  } catch {
    return [];
  }
}

function loadSpoiler() {
  return localStorage.getItem(SPOILER_KEY) !== 'off';
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? 'on' : 'off');
}

function trophyById(id) {
  return trophies.find((trophy) => trophy.id === id);
}

function isSpoilerHidden(trophy) {
  return spoilerOn && !earned.has(trophy.name) && (trophy.hidden || trophy.kind === 'story');
}

function displayName(trophy) {
  return isSpoilerHidden(trophy) ? 'Hidden trophy' : trophy.name;
}

function displayDescription(trophy) {
  return isSpoilerHidden(trophy)
    ? 'Hidden until earned — tick it off to reveal its name and description.'
    : trophy.description;
}

function gradeBadge(trophy) {
  return trophy.grade.charAt(0).toUpperCase() + trophy.grade.slice(1);
}

function countLabel(trophy) {
  if (trophy.count_label) return trophy.count_label;
  if (typeof trophy.count === 'number') return `Target: ${trophy.count}`;
  return '';
}

function matchesFilters(trophy) {
  if (activeKind !== 'all') {
    if (activeKind === 'online') return false;
    if (trophy.kind !== activeKind) return false;
  }
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  const query = searchEl.value.trim().toLowerCase();
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  document.getElementById('progress-count').textContent = `${done} of ${total}`;
  const fill = document.getElementById('progress-fill');
  fill.style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';
  const bar = document.getElementById('progress-bar');
  bar.setAttribute('aria-valuenow', String(done));
  bar.setAttribute('aria-valuemax', String(total));
  const gradeCounts = ['platinum', 'gold', 'silver', 'bronze']
    .map((grade) => {
      const ofGrade = trophies.filter((trophy) => trophy.grade === grade);
      const earnedOfGrade = ofGrade.filter((trophy) => earned.has(trophy.name)).length;
      return `${gradeBadge({ grade })} ${earnedOfGrade}/${ofGrade.length}`;
    })
    .join(' · ');
  document.getElementById('progress-grades').textContent = gradeCounts;
  const next = trophies.find((trophy) => trophy.grade !== 'platinum' && !earned.has(trophy.name));
  document.getElementById('progress-next').textContent = done === total
    ? 'Platinum earned — you are a Leonida Legend.'
    : next ? `Next up: ${displayName(next)}` : '';
}

function renderList() {
  listEl.replaceChildren();
  let shown = 0;
  for (const trophy of trophies) {
    if (!matchesFilters(trophy)) continue;
    shown += 1;
    const item = document.createElement('li');
    item.className = 'trophy-card' + (earned.has(trophy.name) ? ' is-earned' : '');
    item.dataset.trophyId = String(trophy.id);
    if (selectedId === trophy.id) item.classList.add('is-selected');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${displayName(trophy)} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveProgress();
      renderAll();
    });

    const body = document.createElement('button');
    body.type = 'button';
    body.className = 'trophy-body';
    body.addEventListener('click', () => {
      selectedId = trophy.id;
      renderAll();
      detailEl.scrollIntoView({ block: 'nearest' });
    });

    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = displayName(trophy);

    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(trophy);

    const meta = document.createElement('span');
    meta.className = 'trophy-meta';
    const grade = document.createElement('span');
    grade.className = `grade grade-${trophy.grade}`;
    grade.textContent = gradeBadge(trophy);
    meta.append(grade);
    const kind = document.createElement('span');
    kind.className = 'kind-tag';
    kind.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
    meta.append(kind);
    if (trophy.hidden) {
      const hidden = document.createElement('span');
      hidden.className = 'flag flag-hidden';
      hidden.textContent = 'Hidden';
      meta.append(hidden);
    }
    if (trophy.missable) {
      const missable = document.createElement('span');
      missable.className = 'flag flag-missable';
      missable.textContent = 'Possibly missable';
      meta.append(missable);
    }
    if (countLabel(trophy)) {
      const count = document.createElement('span');
      count.className = 'count-tag';
      count.textContent = countLabel(trophy);
      meta.append(count);
    }

    body.append(name, desc, meta);
    item.append(box, body);
    listEl.append(item);
  }
  emptyNoteEl.hidden = shown > 0;
  statusEl.textContent = shown === trophies.length
    ? `Showing all ${trophies.length} trophies.`
    : `Showing ${shown} of ${trophies.length} trophies.`;
}

function renderDetail() {
  const trophy = trophyById(selectedId) ?? trophies[0];
  if (!trophy) return;
  detailEl.replaceChildren();
  const heading = document.createElement('h2');
  heading.className = 'detail-name';
  heading.textContent = displayName(trophy);
  detailEl.append(heading);

  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  const grade = document.createElement('span');
  grade.className = `grade grade-${trophy.grade}`;
  grade.textContent = gradeBadge(trophy);
  meta.append(grade);
  const kind = document.createElement('span');
  kind.className = 'kind-tag';
  kind.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  meta.append(kind);
  if (trophy.hidden) {
    const hidden = document.createElement('span');
    hidden.className = 'flag flag-hidden';
    hidden.textContent = 'Hidden on PlayStation until earned';
    meta.append(hidden);
  }
  if (trophy.missable) {
    const missable = document.createElement('span');
    missable.className = 'flag flag-missable';
    missable.textContent = 'Possibly missable — read the guide';
    meta.append(missable);
  }
  detailEl.append(meta);

  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = displayDescription(trophy);
  detailEl.append(desc);

  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.className = 'missable-warning';
    warn.textContent = 'Missable warning: this is the only trophy the guides flag as possibly missable. Do the Chapter 1 balcony meditation with Lucia before Chapter 1 ends.';
    detailEl.append(warn);
  }

  const earnedToggle = document.createElement('label');
  earnedToggle.className = 'detail-earned';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveProgress();
    renderAll();
  });
  earnedToggle.append(box, document.createTextNode(' Earned'));
  detailEl.append(earnedToggle);

  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'Guide';
  detailEl.append(guideHeading);
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = isSpoilerHidden(trophy)
    ? 'This trophy is hidden, so its guide stays covered until you earn it. Tick it off and the guide opens here.'
    : trophy.guide;
  detailEl.append(guide);

  if (!isSpoilerHidden(trophy)) {
    if (countLabel(trophy)) {
      const target = document.createElement('p');
      target.className = 'detail-target';
      target.textContent = countLabel(trophy);
      detailEl.append(target);
    }
    const sourcesHeading = document.createElement('h3');
    sourcesHeading.textContent = 'Sources';
    detailEl.append(sourcesHeading);
    const sourcesNote = document.createElement('p');
    sourcesNote.className = 'sources-note';
    sourcesNote.textContent = 'The guide above is written in our own words. These are the guides it draws on — links open only if you click them.';
    detailEl.append(sourcesNote);
    const sourceList = document.createElement('ul');
    sourceList.className = 'detail-sources';
    for (const source of trophy.sources ?? []) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      item.append(link);
      sourceList.append(item);
    }
    detailEl.append(sourceList);
  }

  const stage = document.createElement('p');
  stage.className = 'detail-stage';
  const stageInfo = ROADMAP_STAGES.find((entry) => entry.stage === trophy.roadmap_stage);
  stage.textContent = stageInfo ? `Roadmap: ${stageInfo.title}` : '';
  detailEl.append(stage);
}

function renderRoadmap() {
  const stagesEl = document.getElementById('roadmap-stages');
  stagesEl.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const item = document.createElement('li');
    item.className = 'roadmap-stage';
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    const hours = document.createElement('span');
    hours.className = 'stage-hours';
    hours.textContent = stage.hours;
    heading.append(document.createTextNode(' '), hours);
    const text = document.createElement('p');
    text.textContent = stage.text;
    item.append(heading, text);
    const chips = document.createElement('ul');
    chips.className = 'stage-trophies';
    const stageTrophies = trophies.filter((trophy) => trophy.roadmap_stage === stage.stage);
    for (const trophy of stageTrophies) {
      const chip = document.createElement('li');
      chip.className = 'stage-trophy' + (earned.has(trophy.name) ? ' is-earned' : '');
      const chipButton = document.createElement('button');
      chipButton.type = 'button';
      chipButton.textContent = `${displayName(trophy)} (${gradeBadge(trophy)})`;
      chipButton.addEventListener('click', () => {
        selectedId = trophy.id;
        renderAll();
        detailEl.scrollIntoView({ block: 'nearest' });
      });
      chip.append(chipButton);
      chips.append(chip);
    }
    const count = document.createElement('p');
    count.className = 'stage-count';
    const earnedInStage = stageTrophies.filter((trophy) => earned.has(trophy.name)).length;
    count.textContent = `${earnedInStage} of ${stageTrophies.length} earned in this stage.`;
    item.append(chips, count);
    stagesEl.append(item);
  }
}

function renderListSources() {
  const list = document.getElementById('list-sources');
  list.replaceChildren();
  for (const source of listSources) {
    const item = document.createElement('li');
    if (source.url) {
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      item.append(link);
    } else {
      item.textContent = source.name;
    }
    if (source.note) item.append(document.createTextNode(` — ${source.note}`));
    list.append(item);
  }
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    exported: new Date().toISOString(),
    earned: [...earned],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(file) {
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    statusEl.textContent = 'That file is not valid progress JSON — nothing was imported.';
    return;
  }
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) {
    statusEl.textContent = 'That file holds no earned list — nothing was imported.';
    return;
  }
  const known = new Set(trophies.map((trophy) => trophy.name));
  const imported = names.filter((name) => typeof name === 'string' && known.has(name));
  earned = new Set(imported);
  saveProgress();
  renderAll();
  statusEl.textContent = `Imported ${imported.length} earned trophies.`;
}

function bindControls() {
  searchEl.addEventListener('input', renderList);
  gradeEl.addEventListener('change', renderList);
  spoilerEl.checked = spoilerOn;
  spoilerEl.addEventListener('change', () => {
    spoilerOn = spoilerEl.checked;
    saveSpoiler();
    renderAll();
  });
  for (const button of document.querySelectorAll('.kind-btn')) {
    button.addEventListener('click', () => {
      activeKind = button.dataset.kind;
      for (const other of document.querySelectorAll('.kind-btn')) {
        other.classList.toggle('active', other === button);
      }
      renderList();
    });
  }
  document.getElementById('export-btn').addEventListener('click', exportProgress);
  document.getElementById('import-file').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) void importProgress(file);
    event.target.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies? This cannot be undone.')) {
      earned = new Set();
      saveProgress();
      renderAll();
    }
  });
}

async function initGuide() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  trophies = data.trophies;
  listSources = data.list_sources ?? [];
  bindControls();
  renderListSources();
  renderAll();
}

await initGuide();
