/* ===== DATA: change numbers and texts here ===== */
const DATA = {
    project: '', // optional subtitle under the title; leave empty to use a default
    team: '', // optional, e.g. 'Name, Name, Name'
    // Financials in USD thousands. Checked against Air Astana's audited IFRS consolidated statements (ir.airastana.com):
    // FY2019 statements; FY2021 statements (comparatives 2020, 2019); FY2022 statements (2021 operating profit restated to 102,173,
    // originally 94,160); FY2023 statements; FY2024 and FY2025 results releases.
    // Revenue = "total revenue and other income" as reported. 2020 was a loss year: operating loss -69,314, net loss -93,933.
    fin: {
        years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
        revenue: [898729, 400264, 761838, 1032382, 1174514, 1309148, 1453890],
        op: [78699, -69314, 102173, 148715, 135981, 130006, 88125],
        net: [30032, -93933, 36159, 78414, 68705, 52776, 13552],
        assets: [992594, 1049154, 1102193, 1250875, 1362444, 1813075, 2056581],
        equity: [103181, 18407, 63974, 152268, 213359, 394530, 369314],
        liab: [889413, 1030747, 1038219, 1098607, 1149085, 1418545, 1687267]
    },
    // Overview and Business model slides appear only when you fill these in. Empty = slide is skipped.
    cards: [],     // [{t: 'Title', d: 'Text'}]
    timeline: [],  // [{y: 2001, d: 'What happened'}]
    mission: null, goals: null, // ['Heading', 'Text']
    revenueRows: [], costRows: [], // [['Label', % Air Astana, % FlyArystan]]
    // Simulator: key, label, min, max, step, default
    params: [['fuel', 'Fuel price, $/liter', .3, 1.5, .01, .75], ['burn', 'Fuel burn, liters/flight', 2000, 12000, 100, 6000],
    ['yield', 'Average fare, $', 30, 200, 1, 90], ['lf', 'Load factor, %', 40, 100, 1, 80],
    ['flights', 'Flights per month', 100, 3000, 10, 1000], ['seats', 'Seats per flight', 100, 250, 1, 150],
    ['fixed', 'Fixed costs, $ thousands', 500, 8000, 50, 2500], ['other', 'Other variable cost, $/passenger', 5, 60, 1, 25]],
    scenarios: { Base: { y: 1, f: 1, l: 1 }, Optimistic: { y: 1.05, f: .9, l: 1.04 }, Pessimistic: { y: .95, f: 1.15, l: .94 } },
    findings: [['Sales are back, and then some', 'Revenue dropped to $400M in 2020, then grew every year to $1.45B in 2025.'],
    ['Profit moved the other way', 'Operating profit peaked at $148.7M in 2022 and was $88.1M in 2025. Profit for the year fell from $68.7M in 2023 to $13.6M.'],
    ['The balance sheet got bigger', 'Total assets doubled since 2019 to $2.06B. In 2025, liabilities were about 82% of them.']],
    recs: [] // add strings to show a recommendations list
};
/* ===== helpers ===== */
const $ = id => document.getElementById(id), F = DATA.fin, N = DATA.fin.years.length;
const money = v => (v < 0 ? '-$' : '$') + (Math.abs(v) / 1000).toLocaleString('en', { maximumFractionDigits: 1 }) + 'M';
const GOLD = '#C9A227', DIM = 'rgba(201,162,39,.35)', TXT = '#9fb0c6';
Chart.defaults.color = TXT; Chart.defaults.font.family = 'Inter'; Chart.defaults.font.size = innerWidth < 600 ? 10 : 12;
function countUp(el, to, fmt) { // animate number from its previous value
    const from = +el.dataset.v || 0, t0 = performance.now(); el.dataset.v = to;
    const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    (function s(t) { const k = reduce ? 1 : Math.min(1, (t - t0) / 700); el.textContent = fmt(from + (to - from) * k); if (k < 1) requestAnimationFrame(s); })(t0);
}
/* ===== slides & navigation ===== */
const hasOverview = DATA.cards.length || DATA.timeline.length || DATA.mission || DATA.goals, hasModel = DATA.revenueRows.length || DATA.costRows.length;
// [menu name, element id, shown?, minutes for the 7-minute talk]; slides without data are removed
const defs = [['Home', 's-home', 1, .5], ['Overview', 's-overview', hasOverview, 1], ['Financials', 's-fin', 1, 1.5], ['Business model', 's-model', hasModel, 1.5], ['Simulator', 's-sim', 1, 1.5], ['Conclusion', 's-end', 1, 1]];
defs.filter(d => !d[2]).forEach(d => $(d[1]).remove());
const live = defs.filter(d => d[2]), slides = live.map(d => $(d[1])), names = live.map(d => d[0]), last = live.length - 1;
const msum = live.reduce((s, d) => s + d[3], 0); let cur = 0, t0 = Date.now();
$('menu').innerHTML = names.map((n, i) => `<button data-go="${i}">${i + 1}. ${n}</button>`).join('');
function go(i) {
    cur = Math.max(0, Math.min(last, i));
    slides.forEach((s, k) => { s.classList.toggle('on', k === cur); s.classList.toggle('before', k < cur); });
    document.querySelectorAll('[data-go]').forEach(b => b.classList.toggle('on', b.closest('nav') && +b.dataset.go === cur));
    $('bar').style.width = (cur + 1) / live.length * 100 + '%'; $('count').textContent = (cur + 1) + ' / ' + live.length;
    $('prev').style.visibility = cur ? 'visible' : 'hidden'; $('next').style.visibility = cur < last ? 'visible' : 'hidden';
    slides[cur].scrollTop = 0;
    const ab = document.querySelector('#menu .on'), mn = $('menu'); // keep active menu item visible on phones
    if (ab) mn.scrollTo({ left: ab.offsetLeft - mn.clientWidth / 2 + ab.offsetWidth / 2, behavior: 'smooth' });
}
document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(+b.dataset.go); });
$('prev').onclick = () => go(cur - 1); $('next').onclick = () => go(cur + 1);
addEventListener('keydown', e => {
    if (e.target.matches('input')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'ArrowLeft') go(cur - 1);
    else if (/^[1-9]$/.test(e.key) && +e.key <= live.length) go(+e.key - 1);
    else if (e.key.toLowerCase() === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
    else if (e.key.toLowerCase() === 't') { $('timer').hidden = !$('timer').hidden; t0 = Date.now(); }
});
// swipe between slides: ignored on sliders, menus, tables, multi-touch and mostly-vertical gestures
let sx = 0, sy = 0, skip = false; const noSwipe = 'input,nav,.seg,#tl,table,.mini';
addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; skip = e.touches.length > 1 || !!e.target.closest(noSwipe); }, { passive: true });
addEventListener('touchend', e => {
    if (skip) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
}, { passive: true });
setInterval(() => {
    const left = Math.max(0, 420 - (Date.now() - t0) / 1000);
    $('timer').textContent = `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')} left · this slide ≈ ${Math.round(live[cur][3] / msum * 420)}s`;
}, 500);
/* ===== hero & overview ===== */
$('proj').textContent = DATA.project || 'Financial results, 2019–2025'; $('team').textContent = $('team2').textContent = DATA.team ? 'Group 6 · ' + DATA.team : 'Group 6';
if (matchMedia('(prefers-reduced-motion:reduce)').matches) document.querySelector('.sky svg').pauseAnimations();
if (hasOverview) {
    $('cards').innerHTML = DATA.cards.map(c => `<div><h3>${c.t}</h3><p>${c.d}</p></div>`).join('');
    $('mm').innerHTML = [DATA.mission, DATA.goals].filter(Boolean).map(m => `<div><h3>${m[0]}</h3><p>${m[1]}</p></div>`).join('');
    $('tl').innerHTML = DATA.timeline.map((e, i) => `<button data-i="${i}"><span>${e.y}</span></button>`).join('');
    document.querySelectorAll('#tl button').forEach(b => b.onclick = () => {
        document.querySelectorAll('#tl button').forEach(x => x.classList.toggle('on', x === b)); $('tlText').textContent = DATA.timeline[b.dataset.i].d;
    });
    $('tl').firstChild?.click();
}
/* ===== financial dashboard ===== */
let year = 'all'; const yrBtns = [...F.years, 'all'];
$('yrs').innerHTML = yrBtns.map(y => `<button data-y="${y}">${y === 'all' ? 'All years' : y}</button>`).join('');
const mk = (id, cfg) => new Chart($(id), {
    ...cfg, options: {
        maintainAspectRatio: false, animation: { duration: 700 }, plugins: {
            legend: { display: cfg.type === 'doughnut', labels: { boxWidth: 10 } }, title: { display: true, text: cfg.t, color: '#f4f1ea' },
            tooltip: { callbacks: { label: c => ' ' + (c.dataset.pct ? c.parsed.y.toFixed(1) + '%' : money(c.parsed.y ?? c.parsed)) } }
        }, ...cfg.extra
    }
});
const labels = F.years.map(String), margin = F.years.map((_, i) => F.op[i] / F.revenue[i] * 100);
const ch = [mk('c1', { type: 'bar', t: 'Revenue', data: { labels, datasets: [{ data: F.revenue }] } }),
mk('c2', { type: 'line', t: 'Profit for the year', data: { labels, datasets: [{ data: F.net, borderColor: GOLD, tension: .3, pointRadius: 4 }] } }),
mk('c3', { type: 'doughnut', t: 'Equity vs liabilities', data: { labels: ['Equity', 'Liabilities'], datasets: [{ data: [0, 0], backgroundColor: [GOLD, '#27415f'], borderColor: '#0F2038' }] } }),
mk('c4', { type: 'line', t: 'Operating margin, %', data: { labels, datasets: [{ data: margin, pct: 1, borderColor: '#E6C256', tension: .3 }] } })];
function fin(y) {
    year = y; const all = y === 'all', i = all ? N - 1 : F.years.indexOf(+y), j = all ? 0 : i - 1; // j = comparison year: prior year, or 2019 in "All years"
    document.querySelectorAll('#yrs button').forEach(b => b.classList.toggle('on', b.dataset.y == y));
    const items = [['Revenue', F.revenue[i], F.revenue[j], money], ['Operating profit', F.op[i], F.op[j], money],
    ['Profit for the year', F.net[i], F.net[j], money], ['Operating margin', margin[i], margin[j], v => v.toFixed(1) + '%'],
    ['Total assets', F.assets[i], F.assets[j], money], ['Total equity', F.equity[i], F.equity[j], money]];
    if (!$('kpis').children.length) $('kpis').innerHTML = items.map((_, k) => `<div class="kpi"><span></span><b></b><em></em></div>`).join('');
    items.forEach(([n, v, p, f], k) => {
        const el = $('kpis').children[k], has = p !== undefined, d = v - p;
        el.children[0].textContent = n + ' ' + F.years[i]; countUp(el.children[1], v, f);
        el.children[2].className = has ? (d >= 0 ? 'up' : 'down') : '';
        el.children[2].textContent = has ? (d >= 0 ? '▲ ' : '▼ ') + f(Math.abs(d)) + (all ? ' vs ' + F.years[0] : ' vs prior year') : 'first year in the data';
    });
    const hl = k => y === 'all' || F.years[k] == y ? GOLD : DIM;
    ch[0].data.datasets[0].backgroundColor = F.years.map((_, k) => hl(k));
    ch[1].data.datasets[0].pointBackgroundColor = F.years.map((_, k) => hl(k));
    ch[2].data.datasets[0].data = [F.equity[i], F.liab[i]]; ch[2].options.plugins.title.text = 'Equity vs liabilities, ' + F.years[i];
    ch.forEach(c => c.update());
}
document.querySelector('#s-fin .note').textContent = 'Company figures in US dollars, shown in millions. Source: Air Astana Group audited IFRS financial statements and results releases, ' + F.years[0] + '–' + F.years[N - 1] + ' (ir.airastana.com). 2020 is a loss year.';
$('yrs').onclick = e => e.target.dataset.y && fin(e.target.dataset.y); fin('all');
/* ===== business model ===== */
if (hasModel) {
    let bm = 'Air Astana';
    $('bmSwitch').innerHTML = ['Air Astana', 'FlyArystan', 'Comparison'].map(n => `<button data-b="${n}">${n}</button>`).join('');
    function bmRender() {
        document.querySelectorAll('#bmSwitch button').forEach(b => b.classList.toggle('on', b.dataset.b === bm));
        const tbl = (title, rows) => `<div><h3>${title}</h3><table>` + rows.map(r => bm === 'Comparison'
            ? `<tr><td>${r[0]}</td><td>${r[1]}% / ${r[2]}%</td><td><div class="pb"><i style="width:${r[1]}%"></i></div><div class="pb" style="margin-top:3px"><i style="width:${r[2]}%;background:#6f8fb5"></i></div></td></tr>`
            : `<tr><td>${r[0]}</td><td>${r[bm === 'FlyArystan' ? 2 : 1]}%</td><td><div class="pb"><i style="width:${r[bm === 'FlyArystan' ? 2 : 1]}%"></i></div></td></tr>`).join('') + '</table></div>';
        $('bmTables').innerHTML = tbl('Revenue sources', DATA.revenueRows) + tbl('Main costs', DATA.costRows);
    }
    $('bmSwitch').onclick = e => { if (e.target.dataset.b) { bm = e.target.dataset.b; bmRender(); } }; bmRender();
}
/* ===== simulator ===== */
const val = {}; let scen = 'Base';
$('sliders').innerHTML = DATA.params.map(([k, l, a, b, s, d]) => {
    val[k] = d;
    return `<div class="sl"><label>${l}<output id="o_${k}"></output></label><input type="range" id="r_${k}" min="${a}" max="${b}" step="${s}" value="${d}"></div>`;
}).join('');
$('scen').innerHTML = Object.keys(DATA.scenarios).map(n => `<button data-s="${n}">${n}</button>`).join('');
/* Formulas. Per flight: revenue = seats*LF*fare; variable cost = fuel burn*fuel price + passengers*other cost.
   Profit = flights*(revenue - variable) - fixed. BEP (flights) = fixed / contribution per flight. */
function calc(fuelMult = 1) {
    const s = DATA.scenarios[scen], lf = Math.min(1, val.lf / 100 * s.l), pax = val.seats * lf;
    const revF = pax * val.yield * s.y, varF = val.burn * val.fuel * s.f * fuelMult + pax * val.other, fixed = val.fixed * 1000;
    const contrib = revF - varF, rev = revF * val.flights, cost = fixed + varF * val.flights;
    return { revF, varF, fixed, rev, cost, profit: rev - cost, margin: rev ? (rev - cost) / rev * 100 : 0, bep: contrib > 0 ? fixed / contrib : null };
}
const sim = new Chart($('bep'), {
    type: 'line', data: {
        datasets: [
            { label: 'Revenue', data: [], borderColor: '#E6C256', pointRadius: 0, fill: { target: 1, above: 'rgba(62,207,142,.18)', below: 'rgba(240,97,109,.18)' } },
            { label: 'Total cost', data: [], borderColor: '#9fb0c6', pointRadius: 0 },
            { type: 'scatter', label: 'BEP', data: [], backgroundColor: GOLD, borderColor: '#fff', pointRadius: 8 }]
    },
    options: {
        maintainAspectRatio: false, animation: false, parsing: false, interaction: { mode: 'nearest', intersect: false, axis: 'x' },
        plugins: { legend: { labels: { boxWidth: 10 } }, tooltip: { callbacks: { label: c => ' ' + c.dataset.label + ': ' + (c.dataset.label === 'BEP' ? Math.ceil(c.parsed.x) + ' flights' : money(c.parsed.y / 1000)) } } },
        scales: { x: { type: 'linear', title: { display: true, text: 'Flights per month' }, ticks: { maxTicksLimit: 6 } }, y: { ticks: { maxTicksLimit: 6, callback: v => money(v / 1000) } } }
    }
});
const sens = new Chart($('sens'), {
    type: 'bar', data: { labels: ['Fuel base', 'Fuel +10%', 'Fuel +20%'], datasets: [{ data: [], backgroundColor: [] }] },
    options: { maintainAspectRatio: false, animation: { duration: 400 }, plugins: { legend: { display: false }, title: { display: true, text: 'Monthly profit if fuel price rises', color: '#f4f1ea' } }, scales: { y: { ticks: { callback: v => money(v / 1000) } } } }
});
function simUpdate() {
    DATA.params.forEach(([k]) => { $('o_' + k).textContent = val[k]; });
    const r = calc(), xmax = Math.max(val.flights * 1.5, r.bep ? r.bep * 1.4 : 0), pts = [];
    for (let i = 0; i <= 20; i++) { const x = xmax * i / 20; pts.push(x); }
    sim.data.datasets[0].data = pts.map(x => ({ x, y: x * r.revF })); sim.data.datasets[1].data = pts.map(x => ({ x, y: r.fixed + x * r.varF }));
    sim.data.datasets[2].data = r.bep ? [{ x: r.bep, y: r.bep * r.revF }] : []; sim.update();
    const sv = [1, 1.1, 1.2].map(m => calc(m).profit); sens.data.datasets[0].data = sv; sens.data.datasets[0].backgroundColor = sv.map(v => v >= 0 ? GOLD : '#f0616d'); sens.update('none');
    const k = [['Revenue', money(r.rev / 1000), ''], ['Total cost', money(r.cost / 1000), ''], [r.profit >= 0 ? 'Profit' : 'Loss', money(r.profit / 1000), r.profit >= 0 ? 'up' : 'down'],
    ['Margin', r.margin.toFixed(1) + '%', r.margin >= 0 ? 'up' : 'down'], ['Break-even', r.bep ? Math.ceil(r.bep) + ' flights' : 'never', '']];
    $('simKpis').innerHTML = k.map(([n, v, c]) => `<div class="kpi"><span>${n}</span><b class="${c}">${v}</b></div>`).join('');
    $('simMini').innerHTML = k.slice(2).map(([n, v, c]) => `<span>${n}<b class="${c}">${v}</b></span>`).join(''); // sticky summary for phones
    document.querySelectorAll('#scen button').forEach(b => b.classList.toggle('on', b.dataset.s === scen));
}
DATA.params.forEach(([k]) => $('r_' + k).oninput = e => { val[k] = +e.target.value; simUpdate(); });
$('scen').onclick = e => { if (e.target.dataset.s) { scen = e.target.dataset.s; simUpdate(); } };
$('reset').onclick = () => { DATA.params.forEach(([k, , , , , d]) => { val[k] = d; $('r_' + k).value = d; }); scen = 'Base'; simUpdate(); };
simUpdate();
/* ===== conclusion ===== */
$('findings').innerHTML = DATA.findings.map(f => `<div class="card"><h3>${f[0]}</h3><p>${f[1]}</p></div>`).join('');
$('recsWrap').hidden = !DATA.recs.length; $('recs').innerHTML = DATA.recs.map(r => `<li>${r}</li>`).join('');
go(0);
