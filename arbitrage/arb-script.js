document.getElementById('year').textContent = new Date().getFullYear();

(function(){
  var rows = Array.prototype.slice.call(document.querySelectorAll('#arb-table tbody tr'));

  // --- lecture du tableau ---
  var parsed = rows.map(function(row){
    var cells = row.querySelectorAll('td');
    var dateStr = cells[0] ? cells[0].textContent.trim() : '';
    var niveau = cells[2] ? cells[2].textContent.trim() : 'Non précisé';
    var parts = dateStr.split('/'); // JJ/MM/AAAA
    var mois = parts.length === 3 ? parts[1] + '/' + parts[2] : 'Inconnu';
    return { niveau: niveau, mois: mois };
  });

  document.getElementById('total-matchs').textContent = parsed.length;

  // --- agrégation par niveau ---
  var parNiveau = {};
  parsed.forEach(function(m){
    parNiveau[m.niveau] = (parNiveau[m.niveau] || 0) + 1;
  });
  var niveauLabels = Object.keys(parNiveau);
  var niveauValues = niveauLabels.map(function(k){ return parNiveau[k]; });

  // --- agrégation par mois (triée chronologiquement) ---
  var parMois = {};
  parsed.forEach(function(m){
    parMois[m.mois] = (parMois[m.mois] || 0) + 1;
  });
  var moisLabels = Object.keys(parMois).sort(function(a, b){
    var pa = a.split('/').reverse().join('');
    var pb = b.split('/').reverse().join('');
    return pa.localeCompare(pb);
  });
  var moisValues = moisLabels.map(function(k){ return parMois[k]; });

  // --- couleurs tirées de la charte graphique ---
  var css = getComputedStyle(document.documentElement);
  var accent = css.getPropertyValue('--accent').trim();
  var sage = css.getPropertyValue('--sage').trim();
  var ink = css.getPropertyValue('--ink').trim();
  var line = css.getPropertyValue('--line').trim();

  var commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: ink, font: { size: 11 } }, grid: { display: false } },
      y: { beginAtZero: true, ticks: { color: ink, precision: 0 }, grid: { color: line } }
    }
  };

  new Chart(document.getElementById('chart-niveau'), {
    type: 'bar',
    data: {
      labels: niveauLabels,
      datasets: [{ data: niveauValues, backgroundColor: accent, borderRadius: 4 }]
    },
    options: commonOptions
  });

  new Chart(document.getElementById('chart-mois'), {
    type: 'line',
    data: {
      labels: moisLabels,
      datasets: [{
        data: moisValues, borderColor: sage, backgroundColor: sage,
        tension: 0.3, pointRadius: 4, fill: false
      }]
    },
    options: commonOptions
  });
})();
