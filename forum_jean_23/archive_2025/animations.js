/* GERER LA TAILLE DES ELEMENTS */

function mettreAJourTailleHeader() {
    document.documentElement.style.setProperty("--tailleHeader", `${document.querySelector("header").offsetHeight / window.innerHeight * 100}vh`);
}
window.addEventListener("resize", mettreAJourTailleHeader);
window.addEventListener("load", mettreAJourTailleHeader);

/* GERER LA ROTATION DES SECTIONS */

window.lecture = true;
window.index = { valeur : 0 };
function afficherSectionSuivante(sections, index, forceurFleche, sens) {
	if (lecture || forceurFleche) {
		sections[index.valeur].classList.remove("active");
		index.valeur = (index.valeur + sens + sections.length) % sections.length;
		sections[index.valeur].classList.add("active");
	}
}
function lancerRotationSections() {
	document.querySelectorAll("section")[index.valeur].classList.add("active");
	setInterval(() => afficherSectionSuivante(document.querySelectorAll("section"), window.index, false, 1), 10000);
}
window.addEventListener("load", lancerRotationSections);
window.addEventListener("keydown", function(event) {
	if (event.code === "Space") {
		event.preventDefault();
		window.lecture = !window.lecture;
		console.log(window.lecture);
	} else if (event.code === "ArrowRight") {
		event.preventDefault();
		afficherSectionSuivante(document.querySelectorAll("section"), window.index, true, 1);
	} else if (event.code === "ArrowLeft") {
		event.preventDefault();
		afficherSectionSuivante(document.querySelectorAll("section"), window.index, true, -1);
	}
});

/* CHARGER EN PLEIN ECRAN */

function lancerPleinEcran() {
	const elem = document.documentElement;
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) { // Firefox
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) { // Chrome, Safari et Opera
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { // IE/Edge
		elem.msRequestFullscreen();
	}
}