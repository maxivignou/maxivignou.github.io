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

  var pxToMm = 0.2645833333; // conversion pixels → millimètres (96 dpi)
  var widthMm = el.scrollWidth * pxToMm;
  var heightMm = el.scrollHeight * pxToMm;

  var opt = {
    margin: 0,
    filename: document.title.replace(/\s*[—-]\s*/g, '-') + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight
    },
    jsPDF: {
      unit: 'mm',
      format: [widthMm, heightMm],
      orientation: widthMm > heightMm ? 'landscape' : 'portrait'
    },
    pagebreak: { mode: ['avoid-all'] }
  };

  html2pdf().set(opt).from(el).save().then(function(){
    actions.classList.remove('pdf-hide');
  }).catch(function(err){
    actions.classList.remove('pdf-hide');
    console.error('Erreur export PDF :', err);
  });
}
