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
/* ==================== PAGE RESERVATION ==================== */

document.addEventListener('DOMContentLoaded', () => {
  initReservationPage();
});

function initReservationPage() {
  const form = document.getElementById('reservation-form');
  if (!form) return;

  prefillReservationForm();
  setupReservationForm();
  setupReservationPopup();
}

function prefillReservationForm() {
  const params = new URLSearchParams(window.location.search);

  const collection = params.get('collection') || '';
  const sousCollection = params.get('sousCollection') || '';
  const oeuvre = params.get('oeuvre') || '';
  const prix = params.get('prix') || '- €';

  const collectionField = document.getElementById('collection');
  const sousCollectionField = document.getElementById('sous-collection');
  const oeuvreField = document.getElementById('oeuvre');
  const prixField = document.getElementById('prix');

  if (collectionField) collectionField.value = collection;
  if (sousCollectionField) sousCollectionField.value = sousCollection || 'Collection principale';
  if (oeuvreField) oeuvreField.value = oeuvre;
  if (prixField) prixField.value = prix;
}

function setupReservationForm() {
  const form = document.getElementById('reservation-form');
  const submitButton = document.getElementById('reservation-submit');
  if (!form || !submitButton) return;

  const requiredFields = [
    document.getElementById('prenom'),
    document.getElementById('nom'),
    document.getElementById('email'),
    document.getElementById('telephone'),
    document.getElementById('collection'),
    document.getElementById('sous-collection'),
    document.getElementById('oeuvre'),
    document.getElementById('prix')
  ];

  requiredFields.forEach((field) => {
    if (!field) return;

    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('change', () => clearFieldError(field));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    clearAllFieldErrors(form);

    const isValid = validateReservationForm(requiredFields);

    if (!isValid) {
      const firstInvalidField = form.querySelector('.input-error');
      if (firstInvalidField) firstInvalidField.focus();
      return;
    }

    const prenom = document.getElementById('prenom')?.value.trim() || '';
    const nom = document.getElementById('nom')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';

    const replyToField = form.querySelector('input[name="reply_to"]');
    const fullNameField = form.querySelector('input[name="full_name"]');

    if (replyToField) replyToField.value = email;
    if (fullNameField) fullNameField.value = `${prenom} ${nom}`;

    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";

    try {
      await emailjs.sendForm(
        'service_3eao6ro',
        'template_evwt6ek',
        form
      );

      form.reset();
      prefillReservationForm();
      openReservationPopup();

    } catch (error) {
      console.error('Erreur EmailJS :', error);
      alert("Une erreur est survenue lors de l’envoi. Merci de réessayer dans quelques instants.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer la demande de réservation";
    }
  });
}
function validateReservationForm(fields) {
  let isValid = true;

  fields.forEach((field) => {
    if (!field) return;

    const value = field.value.trim();
    const fieldId = field.id;

    if (!value) {
      showFieldError(field, "Ce champ est obligatoire.");
      isValid = false;
      return;
    }

    if (fieldId === 'email' && !isValidEmail(value)) {
      showFieldError(field, "Merci de renseigner une adresse mail valide.");
      isValid = false;
      return;
    }

    if (fieldId === 'telephone' && !isValidPhone(value)) {
      showFieldError(field, "Merci de renseigner un numéro de téléphone valide.");
      isValid = false;
      return;
    }
  });

  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const cleaned = phone.replace(/[^\d+()\-\s]/g, '').trim();

  if (cleaned.length < 6) return false;

  const phoneRegex = /^[+]?[\d\s().\-]{6,}$/;
  return phoneRegex.test(cleaned);
}

function showFieldError(field, message) {
  field.classList.add('input-error');

  const formGroup = field.closest('.form-group');
  if (!formGroup) return;

  const existingError = formGroup.querySelector('.field-error-message');
  if (existingError) existingError.remove();

  const errorElement = document.createElement('p');
  errorElement.className = 'field-error-message';
  errorElement.textContent = message;

  formGroup.appendChild(errorElement);
}

function clearFieldError(field) {
  field.classList.remove('input-error');

  const formGroup = field.closest('.form-group');
  if (!formGroup) return;

  const errorElement = formGroup.querySelector('.field-error-message');
  if (errorElement) errorElement.remove();
}

function clearAllFieldErrors(form) {
  form.querySelectorAll('.input-error').forEach((field) => {
    field.classList.remove('input-error');
  });

  form.querySelectorAll('.field-error-message').forEach((msg) => {
    msg.remove();
  });
}

function setupReservationPopup() {
  const popup = document.getElementById('reservation-success-popup');
  const closeBtn = document.getElementById('reservation-popup-close');
  if (!popup || !closeBtn) return;

  closeBtn.addEventListener('click', closeReservationPopup);

  popup.addEventListener('click', (e) => {
    if (
      e.target.classList.contains('reservation-popup-backdrop') ||
      e.target === popup
    ) {
      closeReservationPopup();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('active')) {
      closeReservationPopup();
    }
  });
}

function openReservationPopup() {
  const popup = document.getElementById('reservation-success-popup');
  if (!popup) return;

  popup.classList.add('active');
  popup.setAttribute('aria-hidden', 'false');
  document.body.classList.add('popup-open');
}

function closeReservationPopup() {
  const popup = document.getElementById('reservation-success-popup');
  if (!popup) return;

  popup.classList.remove('active');
  popup.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('popup-open');
}

/* ==================== SOUTIEN ARTISTE ==================== */

document.addEventListener("DOMContentLoaded", () => {
    initSupportArtistFeature();
});

function initSupportArtistFeature() {
    const trigger = document.getElementById("support-trigger");
    const modal = document.getElementById("support-modal");
    const form = document.getElementById("support-form");
    const closeButtons = document.querySelectorAll("[data-close-support]");
    const anonymousCheckbox = document.getElementById("support-anonymous");
    const firstnameInput = document.getElementById("support-firstname");
    const messageInput = document.getElementById("support-message");
    const errorBox = document.getElementById("support-error");
    const submitButton = document.getElementById("support-submit");
    const toast = document.getElementById("support-toast");
    const counter = document.getElementById("support-count");

    if (!trigger || !modal || !form) return;

    const WORKER_URL = "https://laetydraw-support.augustin-britsch.workers.dev/";

    function openModal() {
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            const checkedReaction = form.querySelector('input[name="reaction"]:checked');
            if (checkedReaction) {
                const firstFocusable = checkedReaction.closest("label");
                if (firstFocusable) firstFocusable.focus?.();
            }
        }, 50);
    }

    function closeModal() {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        clearError();
    }

    function showError(message) {
        if (errorBox) errorBox.textContent = message;
    }

    function clearError() {
        if (errorBox) errorBox.textContent = "";
    }

    function showToast() {
        if (!toast) return;
        toast.classList.add("show");
        toast.setAttribute("aria-hidden", "false");

        setTimeout(() => {
            toast.classList.remove("show");
            toast.setAttribute("aria-hidden", "true");
        }, 3200);
    }

    function updateCounter() {
        if (!messageInput || !counter) return;
        counter.textContent = messageInput.value.length.toString();
    }

    function handleAnonymousState() {
        if (!anonymousCheckbox || !firstnameInput) return;

        if (anonymousCheckbox.checked) {
            firstnameInput.value = "";
            firstnameInput.disabled = true;
            firstnameInput.placeholder = "Anonyme";
        } else {
            firstnameInput.disabled = false;
            firstnameInput.placeholder = "Votre prénom (facultatif)";
        }
    }

    trigger.addEventListener("click", openModal);

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("open")) {
            closeModal();
        }
    });

    if (anonymousCheckbox) {
        anonymousCheckbox.addEventListener("change", handleAnonymousState);
        handleAnonymousState();
    }

    if (messageInput) {
        messageInput.addEventListener("input", updateCounter);
        updateCounter();
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearError();

        const honeypot = document.getElementById("support-website");
        const reaction = form.querySelector('input[name="reaction"]:checked')?.value || "❤️";
        const firstname = anonymousCheckbox.checked ? "" : firstnameInput.value.trim();
        const isAnonymous = anonymousCheckbox.checked;
        const message = messageInput.value.trim();

        if (honeypot && honeypot.value.trim() !== "") {
            showError("Envoi impossible.");
            return;
        }

        if (!message) {
            showError("Merci d’écrire un petit message.");
            return;
        }

        if (message.length < 6) {
            showError("Le message est un peu trop court.");
            return;
        }

        if (!isAnonymous && firstname.length > 40) {
            showError("Le prénom est trop long.");
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="support-submit-icon">⏳</span><span>Envoi en cours...</span>`;

        const payload = {
            reaction,
            firstname,
            anonymous: isAnonymous,
            message,
            pageUrl: window.location.href,
            pageTitle: document.title,
            userAgent: navigator.userAgent
        };

        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Impossible d’envoyer le message.");
            }

            form.reset();
            updateCounter();
            handleAnonymousState();
            closeModal();
            showToast();
        } catch (error) {
            console.error(error);
            showError("Une erreur est survenue. Merci de réessayer dans un instant.");
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = `<span class="support-submit-icon">💌</span><span>Envoyer mon soutien</span>`;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initFloatingTopActions();
});

function initFloatingTopActions() {
    const supportTrigger = document.getElementById("support-trigger");
    const modeSwitch = document.querySelector(".mode-switch");
    const elements = [supportTrigger, modeSwitch].filter(Boolean);

    if (!elements.length) return;

    let lastScrollY = window.scrollY;
    const hideAfter = 80;

    function updateFloatingActions() {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY;

        if (currentScrollY <= hideAfter) {
            elements.forEach(el => el.classList.remove("is-hidden"));
        } else if (scrollingDown) {
            elements.forEach(el => el.classList.add("is-hidden"));
        } else {
            elements.forEach(el => el.classList.remove("is-hidden"));
        }

        lastScrollY = currentScrollY;
    }

    window.addEventListener("scroll", updateFloatingActions, { passive: true });
    updateFloatingActions();
}

document.addEventListener("DOMContentLoaded", () => {
    initAutoOpenNusSubcollections();
});

function initAutoOpenNusSubcollections() {
    const collections = document.querySelectorAll(".collection-section");

    collections.forEach((collection) => {
        const title = collection.querySelector(".nom-collection");
        if (!title) return;

        const titleText = title.textContent.toLowerCase();

        if (!titleText.includes("croquis d'après modèle vivant")) return;

        const subcollections = collection.querySelectorAll(".sous-collection");

        const openAllSubcollections = () => {
            subcollections.forEach((sub) => {
                sub.open = true;
            });
        };

        if (collection.open) {
            openAllSubcollections();
        }

        collection.addEventListener("toggle", () => {
            if (collection.open) {
                openAllSubcollections();
            }
        });
    });
}