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

// Full-screen media viewer. Photos and videos can be tapped/clicked to open full screen.
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

  const exitVideoFullscreen = () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    } catch (_) {}
  };

  const closeLightbox = () => {
    const activeVideo = lightboxContent.querySelector('video');
    if (activeVideo) {
      activeVideo.pause();
      activeVideo.removeAttribute('src');
      activeVideo.load();
    }
    exitVideoFullscreen();
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lightboxContent.innerHTML = '';
  };

  const enterVideoFullscreen = (video) => {
    // iPhone/iPad Safari uses this native video fullscreen API.
    if (typeof video.webkitEnterFullscreen === 'function') {
      try {
        video.webkitEnterFullscreen();
        return;
      } catch (_) {}
    }
    if (video.requestFullscreen) {
      video.requestFullscreen().catch(() => {});
    }
  };

  const openLightbox = (target) => {
    lightboxContent.innerHTML = '';

    let sourceVideo = null;
    if (target.matches('video')) {
      sourceVideo = target;
    } else if (target.matches('.video-placeholder')) {
      sourceVideo = target.querySelector('video');
    }

    if (sourceVideo) {
      const video = sourceVideo.cloneNode(true);
      video.controls = true;
      video.autoplay = false;
      video.loop = false;
      video.muted = false;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('controls', '');
      lightboxContent.appendChild(video);

      video.addEventListener('ended', closeLightbox, { once: true });

      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');

      // The click that opened the viewer supplies the user gesture, so sound
      // playback is allowed. Start first, then enter the device's fullscreen.
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => enterVideoFullscreen(video)).catch(() => enterVideoFullscreen(video));
      } else {
        enterVideoFullscreen(video);
      }
      return;
    }

    if (target.matches('img')) {
      const img = target.cloneNode(true);
      img.removeAttribute('width');
      img.removeAttribute('height');
      lightboxContent.appendChild(img);
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
    if (!target) return;

    // If the user clicked a control inside the fullscreen viewer, don't reopen it.
    if (event.target.closest('.media-lightbox')) return;
    event.preventDefault();
    openLightbox(target);
  });

  // Keyboard accessibility for the portrait video preview.
  document.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('.video-placeholder')) {
      event.preventDefault();
      openLightbox(event.target.closest('.video-placeholder'));
    }
    if (event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

  lightbox.querySelector('.media-lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });

  // If native/standard fullscreen ends without the video ending, leave the
  // lightbox open so the user can continue watching or close it normally.
}
