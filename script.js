const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.textContent = open ? '✕' : '☰';
  });
}

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

// Full-screen media viewer. Keep the existing media containers when replacing
// placeholders with real images or videos and they will remain clickable.
const mediaLightboxTargets = '.photo-placeholder, .video-placeholder, .gallery-item img, .gallery-item video, .video-wrap img, .video-wrap video';

if (document.querySelector(mediaLightboxTargets)) {
  const lightbox = document.createElement('div');
  lightbox.className = 'media-lightbox';
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = `
    <button class="media-lightbox-close" type="button" aria-label="Close full screen media">×</button>
    <div class="media-lightbox-content"></div>
  `;
  document.body.appendChild(lightbox);

  const lightboxContent = lightbox.querySelector('.media-lightbox-content');
  const closeLightbox = () => {
    const activeVideo = lightboxContent.querySelector('video');
    if (activeVideo) activeVideo.pause();
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lightboxContent.innerHTML = '';
  };

  const openLightbox = (target) => {
    lightboxContent.innerHTML = '';

    if (target.matches('img')) {
      const img = target.cloneNode(true);
      img.removeAttribute('width');
      img.removeAttribute('height');
      lightboxContent.appendChild(img);
    } else if (target.matches('video')) {
      const video = target.cloneNode(true);
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      lightboxContent.appendChild(video);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'lightbox-placeholder';
      placeholder.textContent = target.querySelector('.placeholder-label')?.textContent || target.textContent.trim() || 'Media Here';
      lightboxContent.appendChild(placeholder);
    }

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  };

  // Delegation means newly-added photos/videos will work automatically too.
  document.addEventListener('click', event => {
    const target = event.target.closest(mediaLightboxTargets);
    if (target) openLightbox(target);
  });

  lightbox.querySelector('.media-lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}
