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
  var footer = document.querySelector('footer');
  actions.classList.add('pdf-hide');
  footer.classList.add('pdf-hide');

  var pxToMm = 0.2645833333; // conversion pixels → millimètres (96 dpi)
  var marginMm = 10; // marge blanche de chaque côté
  var contentWidthMm = el.scrollWidth * pxToMm;
  var contentHeightMm = el.scrollHeight * pxToMm;
  var pageWidthMm = contentWidthMm + marginMm * 2;
  var pageHeightMm = contentHeightMm + marginMm * 2;

  html2canvas(el, { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 }).then(function(canvas){
    var imgData = canvas.toDataURL('image/jpeg', 0.98);
    var doc = new window.jspdf.jsPDF({
      unit: 'mm',
      format: [pageWidthMm, pageHeightMm],
      orientation: pageWidthMm > pageHeightMm ? 'landscape' : 'portrait'
    });
    doc.addImage(imgData, 'JPEG', marginMm, marginMm, contentWidthMm, contentHeightMm);
    doc.save(document.title.replace(/\s*[—-]\s*/g, '-') + '.pdf');

    actions.classList.remove('pdf-hide');
    footer.classList.remove('pdf-hide');
  }).catch(function(err){
    actions.classList.remove('pdf-hide');
    footer.classList.remove('pdf-hide');
    console.error('Erreur export PDF :', err);
  });
}
