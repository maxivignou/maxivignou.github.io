document.getElementById('year').textContent = new Date().getFullYear();

(function(){
  var MOIS_DEBUT_SAISON = 7; // une saison va de juillet (N) à juin (N+1)

  // ---------- lecture du tableau ----------
  function num(cell){
    return parseFloat(cell.textContent.replace(/\s/g, '').replace(',', '.')) || 0;
  }
  function round2(x){ return Math.round(x * 100) / 100; }

  var matches = Array.prototype.map.call(
    document.querySelectorAll('#arb-table tbody tr'),
    function(tr){
      var c = tr.cells;
      var dateText = c[0].textContent.trim();
      var p = dateText.split('/');
      var month = +p[1], year = +p[2];
      var start = month >= MOIS_DEBUT_SAISON ? year : year - 1;
      var brut = num(c[4]), net = num(c[5]);
      return {
        tr: tr, dateText: dateText, season: start + '-' + (start + 1),
        dist: num(c[3]), brut: brut, net: net, cost: round2(brut - net)
      };
    }
  );

  // ---------- agrégats par saison ----------
  var seasons = [];
  var perSeason = {};
  matches.forEach(function(m){
    if (!perSeason[m.season]){ perSeason[m.season] = { count: 0, brut: 0, net: 0 }; seasons.push(m.season); }
    var s = perSeason[m.season];
    s.count++; s.brut += m.brut; s.net += m.net;
  });
  seasons.sort();

  var total = { count: matches.length, brut: 0, net: 0 };
  matches.forEach(function(m){ total.brut += m.brut; total.net += m.net; });

  // ---------- filtre ----------
  var select = document.getElementById('filtre-saison');
  seasons.forEach(function(s){
    var o = document.createElement('option');
    o.value = s; o.textContent = s;
    select.appendChild(o);
  });
  var filter = 'all';

  function fmtEuro(x){
    return round2(x).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €';
  }
  function fmtInt(x){ return x.toLocaleString('fr-FR'); }

  function setKpi(id, current, totalValue, fmt){
    var html = '<span class="num">' + fmt(current) + '</span>';
    if (filter !== 'all') html += '<span class="of"> / ' + fmt(totalValue) + '</span>';
    document.getElementById(id).innerHTML = html;
  }

  function updateTableAndKpis(){
    matches.forEach(function(m){ m.tr.hidden = (filter !== 'all' && m.season !== filter); });
    var cur = filter === 'all' ? total : perSeason[filter];
    setKpi('kpi-matchs', cur.count, total.count, fmtInt);
    setKpi('kpi-brut', cur.brut, total.brut, fmtEuro);
    setKpi('kpi-net', cur.net, total.net, fmtEuro);
  }

  // ---------- graphiques ----------
  var charts = {};

  function palette(){
    var s = getComputedStyle(document.documentElement);
    function g(n){ return s.getPropertyValue(n).trim(); }
    return { accent: g('--accent'), sage: g('--sage'), ink: g('--ink'), soft: g('--ink-soft'), line: g('--line') };
  }
  function withAlpha(hex, aa){ return hex.length === 7 ? hex + aa : hex; }

  function renderCharts(){
    if (typeof Chart === 'undefined'){
      console.error('Chart.js n\'est pas chargé : les graphiques sont désactivés.');
      return;
    }
    Object.keys(charts).forEach(function(k){ charts[k].destroy(); });
    charts = {};

    var c = palette();
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.color = c.soft;

    var active = filter !== 'all';
    function isSel(season){ return active && season === filter; }

    // options communes aux deux courbes par saison (point sélectionné = gras)
    function lineOptions(yFmt, showLegend){
      return {
        responsive: true, maintainAspectRatio: false, animation: false,
        layout: { padding: { top: 6, right: 10 } },
        plugins: {
          legend: { display: showLegend, labels: { usePointStyle: true, boxWidth: 8, color: c.soft } },
          tooltip: { callbacks: { label: function(ctx){ return ctx.dataset.label + ' : ' + yFmt(ctx.parsed.y); } } }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: c.ink,
              font: function(ctx){ return { weight: isSel(seasons[ctx.index]) ? '700' : '400', size: 11 }; }
            }
          },
          y: { beginAtZero: true, grid: { color: c.line }, ticks: { color: c.soft, precision: 0, callback: function(v){ return yFmt(v); } } }
        }
      };
    }
    function lineDataset(label, values, color){
      return {
        label: label, data: values,
        borderColor: color, backgroundColor: color, tension: 0.25, borderWidth: 2,
        pointBackgroundColor: color,
        pointRadius: seasons.map(function(s){ return !active ? 4 : (isSel(s) ? 8 : 3); }),
        pointHoverRadius: 8,
        pointBorderColor: seasons.map(function(s){ return isSel(s) ? c.ink : color; }),
        pointBorderWidth: seasons.map(function(s){ return isSel(s) ? 3 : 1; })
      };
    }

    // 1) nombre de matchs par saison
    charts.matchs = new Chart(document.getElementById('chart-matchs'), {
      type: 'line',
      data: { labels: seasons, datasets: [ lineDataset('Matchs', seasons.map(function(s){ return perSeason[s].count; }), c.accent) ] },
      options: lineOptions(fmtInt, false)
    });

    // 2) salaires brut / net par saison
    charts.salaires = new Chart(document.getElementById('chart-salaires'), {
      type: 'line',
      data: { labels: seasons, datasets: [
        lineDataset('Brut', seasons.map(function(s){ return round2(perSeason[s].brut); }), c.accent),
        lineDataset('Net',  seasons.map(function(s){ return perSeason[s].net; }), c.sage)
      ] },
      options: lineOptions(fmtEuro, true)
    });

    // 3) dépenses (brut − net) selon la distance
    function pt(m){ return { x: m.dist, y: m.cost, date: m.dateText }; }
    var others = matches.filter(function(m){ return !active || m.season !== filter; });
    var inSeason = matches.filter(function(m){ return active && m.season === filter; });
    var datasets = [{
      label: active ? 'Autres saisons' : 'Matchs', data: others.map(pt), order: 1,
      pointRadius: active ? 3 : 4,
      backgroundColor: active ? withAlpha(c.sage, '73') : withAlpha(c.accent, 'B3'),
      borderColor: active ? withAlpha(c.sage, '73') : withAlpha(c.accent, 'B3')
    }];
    if (active){
      datasets.push({
        label: 'Saison ' + filter, data: inSeason.map(pt), order: 0,
        pointRadius: 6, pointHoverRadius: 8, pointBorderWidth: 2,
        backgroundColor: c.accent, borderColor: c.ink
      });
    }
    charts.depenses = new Chart(document.getElementById('chart-depenses'), {
      type: 'scatter',
      data: { datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        layout: { padding: { top: 6, right: 10 } },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: {
            title: function(items){ return items[0].raw.date; },
            label: function(ctx){ return ['Distance : ' + ctx.raw.x + ' km', 'Dépenses : ' + fmtEuro(ctx.raw.y)]; }
          } }
        },
        scales: {
          x: { beginAtZero: true, grid: { color: c.line }, title: { display: true, text: 'Distance (km)', color: c.soft } },
          y: { beginAtZero: true, grid: { color: c.line }, title: { display: true, text: 'Brut − net (€)', color: c.soft } }
        }
      }
    });
  }

  // ---------- branchement ----------
  function refresh(){ updateTableAndKpis(); renderCharts(); }

  select.addEventListener('change', function(){ filter = select.value; refresh(); });
  if (window.matchMedia){
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(renderCharts);
  }
  refresh();
})();
