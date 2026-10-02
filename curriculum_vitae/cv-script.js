document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('last-update').textContent = new Date(document.lastModified).toLocaleDateString('fr-FR');
function setLang(lang){
  document.querySelectorAll('.fr').forEach(function(el){ el.style.display = lang === 'fr' ? '' : 'none'; });
  document.querySelectorAll('.en').forEach(function(el){ el.style.display = lang === 'en' ? '' : 'none'; });
  document.getElementById('btn-fr').classList.toggle('active', lang === 'fr');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.documentElement.lang = lang;
}
setLang('fr');
function downloadPDF(){
  var el = document.querySelector('.wrap');
  var actions = document.querySelector('.header-actions');
  actions.classList.add('pdf-hide');

  var opt = {
    margin: 8,
    filename: document.title.replace(/\s*[—-]\s*/g, '-') + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  html2pdf().set(opt).from(el).save().then(function(){
    actions.classList.remove('pdf-hide');
  }).catch(function(err){
    actions.classList.remove('pdf-hide');
    console.error('Erreur export PDF :', err);
  });
}
