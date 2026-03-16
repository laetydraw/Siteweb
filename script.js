/**
 * INITIALISATION GÉNÉRALE & TRANSITIONS
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Allumage du site (Transition artistique)
        document.body.classList.add('page-loaded');
    // 2. Gestion de la sortie de l'accueil vers les collections
    const btnExplorer = document.querySelector('.btn-explorer');
    if (btnExplorer) {
        btnExplorer.addEventListener('click', function(e) {
            e.preventDefault();
            const cible = this.href;
            document.body.classList.add('page-exit');
            setTimeout(() => {
                window.location.href = cible;
            }, 500);
        });
    }

   // 3. Gestion du Mode Focus et de l'Apparition des Images
    const toutesLesSections = document.querySelectorAll('details');

    toutesLesSections.forEach((details) => {
        details.addEventListener('toggle', (e) => {
            // On empêche l'événement de remonter pour ne pas mélanger parent et enfant
            e.stopPropagation();

            const galerie = details.querySelector('.galerie');

            if (details.open) {
                // A. GESTION DU MODE FOCUS (uniquement pour les grandes collections)
                if (details.classList.contains('collection-section')) {
                    details.classList.add('fullscreen-mode');
                    // On cache les autres grandes collections
                    document.querySelectorAll('.collection-section').forEach(other => {
                        if (other !== details) other.classList.add('hidden-mode');
                    });
                    
                    const targetY = details.offsetTop - 50; 
                    window.scrollTo({ top: targetY, behavior: 'auto' });
                }

                // B. APPARITION DES IMAGES (pour TOUTES les galeries, sous-collections incluses)
                if (galerie) {
                    galerie.style.opacity = '0';
                    galerie.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        galerie.style.transition = 'all 0.6s ease-out';
                        galerie.style.opacity = '1';
                        galerie.style.transform = 'translateY(0)';
                        updateArrows(galerie); // On active les flèches
                    }, 50);
                }
            } else {
                // C. SORTIE DU MODE FOCUS
                if (details.classList.contains('collection-section')) {
                    details.classList.remove('fullscreen-mode');
                    document.querySelectorAll('.collection-section').forEach(other => {
                        other.classList.remove('hidden-mode');
                    });
                    details.scrollIntoView({ behavior: 'auto', block: 'center' });
                }
            }
        });
    });

    // 4. Initialisation des flèches de galerie
    document.querySelectorAll('.galerie').forEach(galerie => {
        galerie.addEventListener('scroll', () => updateArrows(galerie));
        updateArrows(galerie);
    });
});

/**
 * NAVIGATION GALERIE HORIZONTALE
 */
function scrollGalerie(bouton, direction) {
    const wrapper = bouton.closest('.galerie-wrapper');
    const galerie = wrapper.querySelector('.galerie');
    const scrollAmount = 400;
    galerie.scrollBy({ 
        left: direction === 'droite' ? scrollAmount : -scrollAmount, 
        behavior: 'smooth' 
    });
}
function scrollGalerieDroite(bouton) { scrollGalerie(bouton, 'droite'); }
function scrollGalerieGauche(bouton) { scrollGalerie(bouton, 'gauche'); }

function updateArrows(galerie) {
    const wrapper = galerie.closest('.galerie-wrapper');
    const btnGauche = wrapper.querySelector('.btn-scroll-left');
    const btnDroit = wrapper.querySelector('.btn-scroll-right');
    if (!btnGauche || !btnDroit) return;

    const scrollLeft = galerie.scrollLeft;
    const maxScroll = galerie.scrollWidth - galerie.clientWidth;

    scrollLeft > 5 ? btnGauche.classList.add('active') : btnGauche.classList.remove('active');
    scrollLeft < maxScroll - 5 ? btnDroit.classList.add('active') : btnDroit.classList.remove('active');
}

/**
 * GESTION LIGHTBOX
 */
let currentImages = [];
let currentIndex = 0;

function ouvrirLightbox(element) {
    const lightbox = document.getElementById("lightbox");
    const galerie = element.closest('.galerie');
    currentImages = Array.from(galerie.querySelectorAll('.image-lien img'));
    currentIndex = currentImages.indexOf(element.querySelector('img'));
    lightbox.style.display = "flex";
    majContenuLightbox();
}

function majContenuLightbox() {
    const imgZoom = document.getElementById("img-zoom");
    const captionText = document.getElementById("caption");
    const imageActuelle = currentImages[currentIndex];
    imgZoom.src = imageActuelle.src;
    captionText.innerHTML = imageActuelle.closest('.oeuvre').querySelector('h2').innerHTML;
}

function changeImage(direction) {
    currentIndex += direction;
    if (currentIndex >= currentImages.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = currentImages.length - 1;
    majContenuLightbox();
}

function fermerLightbox() {
    document.getElementById("lightbox").style.display = "none";
}

// Clavier
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById("lightbox");
    if (lightbox && lightbox.style.display === "flex") {
        if (e.key === "ArrowRight") changeImage(1);
        if (e.key === "ArrowLeft") changeImage(-1);
        if (e.key === "Escape") fermerLightbox();
    }
});