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
let lightboxFromRandomMode = false;

let zoomScale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

function getImgZoom() {
    return document.getElementById('img-zoom');
}

function appliquerTransformLightbox() {
    const imgZoom = getImgZoom();
    if (!imgZoom) return;

    imgZoom.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;

    if (zoomScale > 1) {
        imgZoom.classList.add('zoomed');
    } else {
        imgZoom.classList.remove('zoomed');
        imgZoom.classList.remove('dragging');
    }
}

function resetZoomLightbox() {
    zoomScale = 1;
    translateX = 0;
    translateY = 0;
    isDragging = false;
    appliquerTransformLightbox();
}

function ouvrirLightbox(element) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const galerie = element.closest('.galerie');
    if (!galerie) return;

    lightboxFromRandomMode = false;

    currentImages = Array.from(galerie.querySelectorAll('.image-lien img'));
    currentIndex = currentImages.indexOf(element.querySelector('img'));

    lightbox.style.display = 'flex';
    majContenuLightbox();
    resetZoomLightbox();
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

    resetZoomLightbox();
}

function changeImage(direction) {
    if (lightboxFromRandomMode) {
    if (direction > 0) {
        nextRandomArtwork();
    } else {
        prevRandomArtwork();
    }

    const artwork = allArtworks[currentRandomIndex];
    const imgZoom = document.getElementById('img-zoom');
    const captionText = document.getElementById('caption');

    if (!imgZoom || !artwork) return;

    imgZoom.src = artwork.src;
    imgZoom.alt = artwork.alt || artwork.title || '';

    if (captionText) {
        captionText.innerHTML = artwork.title || '';
    }

    resetZoomLightbox();
    return;
}

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
    lightboxFromRandomMode = false;
    resetZoomLightbox();
}

document.addEventListener('DOMContentLoaded', function () {
    const imgZoom = document.getElementById('img-zoom');
    const lightbox = document.getElementById('lightbox');

    if (!imgZoom || !lightbox) return;

    imgZoom.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    imgZoom.addEventListener('wheel', function (event) {
        event.preventDefault();
        event.stopPropagation();

        const zoomStep = 0.2;

        if (event.deltaY < 0) {
            zoomScale += zoomStep;
        } else {
            zoomScale -= zoomStep;
        }

        zoomScale = Math.max(1, Math.min(zoomScale, 4));

        if (zoomScale === 1) {
            translateX = 0;
            translateY = 0;
        }

        appliquerTransformLightbox();
    }, { passive: false });

    imgZoom.addEventListener('dblclick', function (event) {
        event.stopPropagation();
        resetZoomLightbox();
    });

    imgZoom.addEventListener('mousedown', function (event) {
        if (zoomScale <= 1) return;

        event.preventDefault();
        event.stopPropagation();

        isDragging = true;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;

        imgZoom.classList.add('dragging');
    });

    window.addEventListener('mousemove', function (event) {
        if (!isDragging) return;

        translateX = event.clientX - startX;
        translateY = event.clientY - startY;

        appliquerTransformLightbox();
    });

    window.addEventListener('mouseup', function () {
        if (!isDragging) return;

        isDragging = false;
        imgZoom.classList.remove('dragging');
    });
});
function zoomIn() {
    zoomScale = Math.min(zoomScale + 0.3, 4);
    appliquerTransformLightbox();
}

function zoomOut() {
    zoomScale = Math.max(zoomScale - 0.3, 1);

    if (zoomScale === 1) {
        translateX = 0;
        translateY = 0;
    }

    appliquerTransformLightbox();
}

/* ==================== CLAVIER ==================== */

document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');

    if (!lightbox || lightbox.style.display !== 'flex') return;

    if (e.key === 'ArrowRight') changeImage(1);
    if (e.key === 'ArrowLeft') changeImage(-1);
    if (e.key === 'Escape') fermerLightbox();
});
/* =========================
   MODE ALEATOIRE COLLECTIONS
========================= */

let allArtworks = [];
let currentRandomIndex = 0;
let shuffledArtworkIndices = [];
let currentShuffledPosition = 0;

function cleanText(text) {
    return (text || '').replace(/\s*New\s*/gi, ' ').replace(/\s+/g, ' ').trim();
}

function shuffleArray(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function createRandomOrder(startIndex = null) {
    const indices = allArtworks.map((_, i) => i);
    let shuffled = shuffleArray(indices);

    if (startIndex !== null) {
        shuffled = shuffled.filter(i => i !== startIndex);
        shuffled.unshift(startIndex);
        currentShuffledPosition = 0;
    } else {
        currentShuffledPosition = 0;
    }

    shuffledArtworkIndices = shuffled;
}

function collectAllArtworks() {
    const artworks = document.querySelectorAll('.oeuvre');

    allArtworks = Array.from(artworks).map((art) => {
        const img = art.querySelector('img');
        const titleEl = art.querySelector('h2');
        const details = art.querySelectorAll('.details p');
        const prixEl = art.querySelector('.prix');
        const statutEl = art.querySelector('.statut');
        const reserveLink = art.querySelector('.mon-bouton-reserve');

        let dimensions = '';
        let technique = '';

        details.forEach((p) => {
            const txt = p.innerText.trim();

            if (txt.includes('Dimensions')) {
                dimensions = txt.replace('Dimensions :', '').replace('Dimensions : ', '').replace('Dimensions:', '').trim();
            }

            if (txt.includes('Technique')) {
                technique = txt.replace('Technique :', '').replace('Technique : ', '').replace('Technique:', '').trim();
            }
        });

        const sousCollectionEl = art.closest('.sous-collection')?.querySelector('.nom-sous-collection');
        const collectionEl = art.closest('.collection-section')?.querySelector('.nom-collection');

        const sousCollection = cleanText(sousCollectionEl?.innerText || '');
        const collection = cleanText(collectionEl?.innerText || '');
        const title = cleanText(titleEl?.innerText || img?.alt || 'Sans titre');
        const prix = cleanText(prixEl?.innerText || '');
        const statut = cleanText(statutEl?.innerText || '');
        const artworkId = art.id || '';
        const mailto = reserveLink?.getAttribute('href') || '';
        const isVendue = art.querySelector('.statut.vendue') !== null;

        return {
            src: img?.getAttribute('src') || '',
            alt: img?.getAttribute('alt') || '',
            title,
            collection,
            sousCollection,
            year: '',
            technique,
            dimensions,
            prix,
            statut,
            description: '',
            artworkId,
            mailto,
            isVendue
        };
    }).filter((a) => a.src);
}

function buildMetaText(artwork) {
    const parts = [
        artwork.sousCollection,
        artwork.technique,
        artwork.dimensions
    ].filter(Boolean);

    return parts.join(' • ');
}

function renderRandomArtwork(index) {
    if (!allArtworks.length) return;

    currentRandomIndex = (index + allArtworks.length) % allArtworks.length;
    const artwork = allArtworks[currentRandomIndex];

    const image = document.getElementById('random-image');
    const collection = document.getElementById('random-collection');
    const title = document.getElementById('random-title');
    const meta = document.getElementById('random-meta');
    const description = document.getElementById('random-description');
    const openBtn = document.getElementById('random-open-in-collection');

    if (!image || !collection || !title || !meta || !description) return;

    image.src = artwork.src;
    image.alt = artwork.alt || artwork.title;

    title.textContent = artwork.title;
    collection.textContent = artwork.collection;
    meta.textContent = buildMetaText(artwork);

    const descriptionParts = [artwork.prix, artwork.statut].filter(Boolean);
    description.textContent = descriptionParts.join(' • ');

    image.onclick = function () {
        openRandomLightbox(artwork);
    };

    if (openBtn) {
    openBtn.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        openArtworkInCollection(artwork);
    };
}
}

function openRandomMode() {
    const collectionsView = document.getElementById('collections-view');
    const randomViewer = document.getElementById('random-viewer');
    const btnRandom = document.getElementById('btn-random-mode');
    const btnCollections = document.getElementById('btn-collections-mode');

    if (!collectionsView || !randomViewer || !btnRandom || !btnCollections) return;

    if (!allArtworks.length) {
        collectAllArtworks();
    }

    if (!allArtworks.length) return;

    const startIndex = Math.floor(Math.random() * allArtworks.length);
    createRandomOrder(startIndex);

    currentRandomIndex = shuffledArtworkIndices[currentShuffledPosition];

    collectionsView.classList.add('hidden');
    randomViewer.classList.remove('hidden');

    btnRandom.classList.add('active');
    btnCollections.classList.remove('active');

    renderRandomArtwork(currentRandomIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openCollectionsMode() {
    const collectionsView = document.getElementById('collections-view');
    const randomViewer = document.getElementById('random-viewer');
    const btnRandom = document.getElementById('btn-random-mode');
    const btnCollections = document.getElementById('btn-collections-mode');

    if (!collectionsView || !randomViewer || !btnRandom || !btnCollections) return;

    collectionsView.classList.remove('hidden');
    randomViewer.classList.add('hidden');

    btnRandom.classList.remove('active');
    btnCollections.classList.add('active');
}

function nextRandomArtwork() {
    if (!shuffledArtworkIndices.length) return;

    currentShuffledPosition++;

    if (currentShuffledPosition >= shuffledArtworkIndices.length) {
        createRandomOrder();
    }

    currentRandomIndex = shuffledArtworkIndices[currentShuffledPosition];
    renderRandomArtwork(currentRandomIndex);
}

function prevRandomArtwork() {
    if (!shuffledArtworkIndices.length) return;

    currentShuffledPosition--;

    if (currentShuffledPosition < 0) {
        createRandomOrder();
        currentShuffledPosition = shuffledArtworkIndices.length - 1;
    }

    currentRandomIndex = shuffledArtworkIndices[currentShuffledPosition];
    renderRandomArtwork(currentRandomIndex);
}
function openArtworkInCollection(artwork) {
    if (!artwork || !artwork.artworkId) return;

    const article = document.getElementById(artwork.artworkId);
    if (!article) {
        console.error("Œuvre introuvable :", artwork.artworkId);
        return;
    }

    const parentCollection = article.closest('.collection-section');
    const parentSousCollection = article.closest('.sous-collection');
    const randomViewer = document.getElementById('random-viewer');
    const collectionsView = document.getElementById('collections-view');
    const btnRandom = document.getElementById('btn-random-mode');
    const btnCollections = document.getElementById('btn-collections-mode');

    // On repasse proprement en mode collections
    if (randomViewer) randomViewer.classList.add('hidden');
    if (collectionsView) collectionsView.classList.remove('hidden');
    if (btnRandom) btnRandom.classList.remove('active');
    if (btnCollections) btnCollections.classList.add('active');

    // Reset complet de l'état précédent
    document.querySelectorAll('.collection-section').forEach((collection) => {
        collection.classList.remove('hidden-mode', 'fullscreen-mode');
        collection.open = false;
    });

    document.querySelectorAll('.sous-collection').forEach((sousCollection) => {
        sousCollection.open = false;
    });

    // Ouvre la bonne collection
    if (parentCollection) {
        parentCollection.open = true;
        parentCollection.classList.add('fullscreen-mode');

        document.querySelectorAll('.collection-section').forEach((collection) => {
            if (collection !== parentCollection) {
                collection.classList.add('hidden-mode');
            }
        });
    }

    // Ouvre la bonne sous-collection si besoin
    if (parentSousCollection) {
        parentSousCollection.open = true;
    }

    // Scroll propre vers l'œuvre
    setTimeout(() => {
        article.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        article.classList.add('oeuvre-highlight');

        setTimeout(() => {
            article.classList.remove('oeuvre-highlight');
        }, 2200);
    }, 350);
}

document.addEventListener('DOMContentLoaded', function () {
    collectAllArtworks();

    const btnRandom = document.getElementById('btn-random-mode');
    const btnCollections = document.getElementById('btn-collections-mode');
    const prevBtn = document.getElementById('random-prev');
    const nextBtn = document.getElementById('random-next');

    if (btnRandom) {
        btnRandom.addEventListener('click', openRandomMode);
    }

    if (btnCollections) {
        btnCollections.addEventListener('click', openCollectionsMode);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevRandomArtwork);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextRandomArtwork);
    }

    document.addEventListener('keydown', function (e) {
        const randomViewer = document.getElementById('random-viewer');
        if (!randomViewer || randomViewer.classList.contains('hidden')) return;

        if (e.key === 'ArrowRight') {
            nextRandomArtwork();
        } else if (e.key === 'ArrowLeft') {
            prevRandomArtwork();
        } else if (e.key === 'Escape') {
            openCollectionsMode();
        }
    });
});

function openRandomLightbox(artwork) {
    const lightbox = document.getElementById('lightbox');
    const imgZoom = document.getElementById('img-zoom');
    const caption = document.getElementById('caption');

    if (!lightbox || !imgZoom || !artwork) return;

    lightboxFromRandomMode = true;

    imgZoom.src = artwork.src;
    imgZoom.alt = artwork.alt || artwork.title || '';

    if (caption) {
        caption.innerHTML = artwork.title || '';
    }

    lightbox.style.display = 'flex';
    resetZoomLightbox();
}