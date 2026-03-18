/* ==================== CONFIG ==================== */

const SCROLL_AMOUNT = 400;


/* ==================== INITIALISATION ==================== */

document.addEventListener('DOMContentLoaded', () => {
    initPageTransitions();
    initDetailsSections();
    initGaleries();
});


/* ==================== TRANSITIONS PAGE ==================== */

function initPageTransitions() {
    document.body.classList.add('page-loaded');

    const btnExplorer = document.querySelector('.btn-explorer');

    if (btnExplorer) {
        btnExplorer.addEventListener('click', (e) => {
            e.preventDefault();
            const cible = btnExplorer.href;

            document.body.classList.add('is-transitioning');

            setTimeout(() => {
                document.body.classList.add('page-exit');
            }, 180);

            setTimeout(() => {
                window.location.href = cible;
            }, 750);
        });
    }
}


/* ==================== DETAILS / MODE FOCUS ==================== */

function initDetailsSections() {
    const tousLesDetails = document.querySelectorAll('details');

    tousLesDetails.forEach((details) => {
        details.addEventListener('toggle', (e) => {
            e.stopPropagation();

            const galerie = details.querySelector('.galerie');

            if (details.open) {
                gererOuvertureDetails(details, galerie);
            } else {
                gererFermetureDetails(details);
            }
        });
    });
}

function gererOuvertureDetails(details, galerie) {
    if (details.classList.contains('collection-section')) {
        details.classList.add('fullscreen-mode');

        document.querySelectorAll('.collection-section').forEach((other) => {
            if (other !== details) {
                other.classList.add('hidden-mode');
            }
        });
    }

    if (galerie) {
        galerie.style.animation = 'none';
        galerie.style.opacity = '0';
        galerie.style.transform = 'scale(1.04)';
        galerie.style.filter = 'blur(6px)';

        setTimeout(() => {
            galerie.style.animation = 'cinematicReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards';
            updateArrows(galerie);
        }, 30);
    }

    setTimeout(() => {
        if (details.classList.contains('collection-section')) {
            const sousCollections = details.querySelector('.sous-collections-container');
            const sousCollection = details.querySelector('.sous-collection');

            if (sousCollections && sousCollection) {
                montrerDebutSousCollections(details);
            } else if (galerie) {
                centrerGalerie(details);
            }
        }

        if (details.classList.contains('sous-collection') && galerie) {
            centrerGalerie(details);
        }
    }, 80);
}
function gererFermetureDetails(details) {
    if (details.classList.contains('collection-section')) {
        details.classList.remove('fullscreen-mode');

        document.querySelectorAll('.collection-section').forEach((other) => {
            other.classList.remove('hidden-mode');
        });
    }

    const galerie = details.querySelector('.galerie');
    if (galerie) {
        galerie.style.animation = '';
        galerie.style.opacity = '';
        galerie.style.transform = '';
        galerie.style.filter = '';
    }
}
function centrerGalerie(details) {
    const galerieWrapper = details.querySelector('.galerie-wrapper');
    if (!galerieWrapper) return;

    const rect = galerieWrapper.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;

    // On place le haut de la galerie vers le haut de l'écran,
    // avec une marge agréable pour voir le titre sans couper les œuvres
    const targetY = Math.max(0, absoluteTop - window.innerHeight * 0.18);

    smoothScrollTo(targetY, 1200);
}
function montrerDebutSousCollections(details) {
    const container = details.querySelector('.sous-collections-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;

    const targetY = Math.max(0, absoluteTop - 40);

    smoothScrollTo(targetY, 900);
}
function smoothScrollTo(targetY, duration = 1000) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime = null;

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const eased = easeInOutCubic(progress);
        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}
/* ==================== GALERIES ==================== */

function initGaleries() {
    document.querySelectorAll('.galerie-wrapper').forEach((wrapper) => {
        const galerie = wrapper.querySelector('.galerie');
        const btnLeft = wrapper.querySelector('.btn-scroll-left');
        const btnRight = wrapper.querySelector('.btn-scroll-right');

        if (!galerie) return;

        function update() {
            const maxScroll = galerie.scrollWidth - galerie.clientWidth;
            btnLeft?.classList.toggle('active', galerie.scrollLeft > 5);
            btnRight?.classList.toggle('active', galerie.scrollLeft < maxScroll - 5);
        }

        btnLeft?.addEventListener('click', () => {
            galerie.scrollBy({ left: -SCROLL_AMOUNT});
        });

        btnRight?.addEventListener('click', () => {
            galerie.scrollBy({ left: SCROLL_AMOUNT});
        });

        wrapper.querySelectorAll('.image-lien').forEach((element) => {
            element.addEventListener('click', () => ouvrirLightbox(element));
        });

        galerie.addEventListener('scroll', update);
        update();
    });
}

function scrollGalerie(bouton, direction) {
    const wrapper = bouton.closest('.galerie-wrapper');
    if (!wrapper) return;

    const galerie = wrapper.querySelector('.galerie');
    if (!galerie) return;

    galerie.scrollBy({
        left: direction === 'droite' ? SCROLL_AMOUNT : -SCROLL_AMOUNT
    });
}

function scrollGalerieDroite(bouton) {
    scrollGalerie(bouton, 'droite');
}

function scrollGalerieGauche(bouton) {
    scrollGalerie(bouton, 'gauche');
}

function updateArrows(galerie) {
    const wrapper = galerie.closest('.galerie-wrapper');
    if (!wrapper) return;

    const btnGauche = wrapper.querySelector('.btn-scroll-left');
    const btnDroit = wrapper.querySelector('.btn-scroll-right');

    if (!btnGauche || !btnDroit) return;

    const scrollLeft = galerie.scrollLeft;
    const maxScroll = galerie.scrollWidth - galerie.clientWidth;

    btnGauche.classList.toggle('active', scrollLeft > 5);
    btnDroit.classList.toggle('active', scrollLeft < maxScroll - 5);
}


/* ==================== LIGHTBOX ==================== */

let currentImages = [];
let currentIndex = 0;

function ouvrirLightbox(element) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const galerie = element.closest('.galerie');
    if (!galerie) return;

    currentImages = Array.from(galerie.querySelectorAll('.image-lien img'));
    currentIndex = currentImages.indexOf(element.querySelector('img'));

    lightbox.style.display = 'flex';
    majContenuLightbox();
}

function majContenuLightbox() {
    const imgZoom = document.getElementById('img-zoom');
    const captionText = document.getElementById('caption');

    if (!imgZoom || !captionText || currentImages.length === 0) return;

    const imageActuelle = currentImages[currentIndex];
    if (!imageActuelle) return;

    imgZoom.src = imageActuelle.src;

    const titre = imageActuelle.closest('.oeuvre')?.querySelector('h2');
    captionText.innerHTML = titre ? titre.innerHTML : '';
}

function changeImage(direction) {
    if (currentImages.length === 0) return;

    currentIndex += direction;

    if (currentIndex >= currentImages.length) {
        currentIndex = 0;
    }

    if (currentIndex < 0) {
        currentIndex = currentImages.length - 1;
    }

    majContenuLightbox();
}

function fermerLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.style.display = 'none';
}


/* ==================== CLAVIER ==================== */

document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');

    if (!lightbox || lightbox.style.display !== 'flex') return;

    if (e.key === 'ArrowRight') changeImage(1);
    if (e.key === 'ArrowLeft') changeImage(-1);
    if (e.key === 'Escape') fermerLightbox();
});