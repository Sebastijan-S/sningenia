const focusSection = (target) => {
  const heading = target.querySelector('h1, h2') || target;
  if (!heading.hasAttribute('tabindex')) {
    heading.setAttribute('tabindex', '-1');
    heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
  }
  heading.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
};
const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const navLinks = Array.from(document.querySelectorAll('.nav-links a, .mobile-nav-links a'));
const sections = Array.from(document.querySelectorAll('section[id], .hero'));
const mobileNavClose = document.querySelector('.mobile-nav-close');

const openMobileNav = () => {
  mobileNav.removeAttribute('inert');
  mobileNav.setAttribute('aria-hidden', 'false');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  mobileNav.querySelector('a')?.focus();
  updateMobileCta();
};

const closeMobileNav = (restoreFocus = true) => {
  mobileNav.setAttribute('inert', '');
  mobileNav.setAttribute('aria-hidden', 'true');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  if (restoreFocus) navToggle.focus();
  updateMobileCta();
};

navToggle?.addEventListener('click', () => {
  if (mobileNav.getAttribute('aria-hidden') === 'true') {
    openMobileNav();
  } else {
    closeMobileNav();
  }
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) return;

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    if (mobileNav.getAttribute('aria-hidden') === 'false') closeMobileNav(false);
    history.pushState(null, '', href);
    focusSection(target);
  });
});

// Close mobile nav when clicking backdrop area
mobileNav?.addEventListener('click', (e) => {
  if (e.target === mobileNav) closeMobileNav();
});

mobileNavClose?.addEventListener('click', () => closeMobileNav());

const updateActiveNav = () => {
  const scrollPosition = window.scrollY + window.innerHeight / 2;
  const currentSection = sections.find((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    return scrollPosition >= top && scrollPosition < top + height;
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href === `#${currentSection?.id || 'home'}`);
  });
};

window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('resize', updateActiveNav);
updateActiveNav();

const modal = document.getElementById('projectModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.querySelector('.modal-subtitle');
const modalCopy = document.querySelector('.modal-copy');
const modalResult = document.querySelector('.modal-result');
const modalImage = document.getElementById('modalImage');
const isSerbian = document.documentElement.lang === 'sr';
const showLoadedImage = () => {
  modalImage.classList.remove('is-loading');
  modalImage.parentElement.removeAttribute('aria-busy');
};
modalImage.addEventListener('load', showLoadedImage);
modalImage.addEventListener('error', showLoadedImage);

const focusableSelector = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';
let focusableModalElements = [];
let firstFocusableModal = null;
let lastFocusableModal = null;

const updateModalFocus = () => {
  focusableModalElements = Array.from(modal.querySelectorAll(focusableSelector)).filter((el) => !el.hasAttribute('disabled'));
  firstFocusableModal = focusableModalElements[0];
  lastFocusableModal = focusableModalElements[focusableModalElements.length - 1];
};

const trapModalFocus = (event) => {
  if (event.key !== 'Tab') return;
  if (!modal.classList.contains('active')) return;

  if (event.shiftKey) {
    if (document.activeElement === firstFocusableModal) {
      event.preventDefault();
      lastFocusableModal?.focus();
    }
  } else {
    if (document.activeElement === lastFocusableModal) {
      event.preventDefault();
      firstFocusableModal?.focus();
    }
  }
};

const openModal = () => {
  document.querySelectorAll('body > :not(.project-modal):not(script)').forEach(el => {
    if (!el.hasAttribute('inert')) { el.setAttribute('inert', ''); el.dataset.modalInert = 'true'; }
  });
  modal.removeAttribute('inert');
  modal.querySelector('.modal-content').scrollTop = 0;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  updateModalFocus();
  firstFocusableModal?.focus();
  updateMobileCta();
};

const closeModal = () => {
  document.querySelectorAll('[data-modal-inert]').forEach(el => { el.removeAttribute('inert'); delete el.dataset.modalInert; });
  modal.setAttribute('inert', '');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  modalTrigger?.focus();
  modalTrigger = null;
  updateMobileCta();
};

let modalTrigger = null;
const cardOpenButtons = document.querySelectorAll('.card-open');
cardOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.project-card');
    if (!card) return;

    const title = card.querySelector('.card-title')?.textContent?.trim() || 'Project title';
    const description = card.querySelector('.card-desc')?.textContent?.trim() || '';
    const challenge = card.dataset.challenge || '';
    const solution = card.dataset.solution || '';
    const result = card.dataset.result || '';
    const image = card.dataset.image || '';

    modalTitle.textContent = title;
    modalSubtitle.textContent = description;
    document.querySelector('.modal-tag').textContent = card.dataset.status;
    const demo = card.dataset.demo === 'true';
    const headings = modalCopy.querySelectorAll('h3');
    headings[0].textContent = isSerbian ? (demo ? 'Namena demo projekta' : 'Namena') : (demo ? 'Demo purpose' : 'Purpose');
    headings[1].textContent = isSerbian ? 'Vizuelni pristup' : 'Visual approach';
    modalCopy.querySelector('.modal-block:nth-of-type(1) p').textContent = challenge;
    modalCopy.querySelector('.modal-block:nth-of-type(2) p').textContent = solution;
    if (modalResult) {
      modalResult.querySelector('p').textContent = result;
    }
    if (modalImage) {
      modalImage.classList.add('is-loading');
      modalImage.parentElement.setAttribute('aria-busy', 'true');
      modalImage.loading = 'eager';
      modalImage.src = image;
      modalImage.alt = `${title} — ${isSerbian ? 'prikaz interfejsa' : 'interface preview'}`;
    }

    modalTrigger = button;
    openModal();
  });
});

document.querySelector('.modal-call').addEventListener('click', (event) => {
  event.preventDefault();
  closeModal();
  history.pushState(null, '', '#contact');
  focusSection(document.getElementById('contact'));
});
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('active')) {
    event.preventDefault();
    closeModal();
  }
  trapModalFocus(event);
});

// Allow Escape to close the mobile nav as well
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileNav?.getAttribute('aria-hidden') === 'false') {
    closeMobileNav();
    return;
  }

  if (event.key !== 'Tab' || mobileNav?.getAttribute('aria-hidden') !== 'false') return;

  const menuFocusables = Array.from(mobileNav.querySelectorAll('a[href], button:not([disabled])'));
  const firstMenuItem = menuFocusables[0];
  const lastMenuItem = menuFocusables[menuFocusables.length - 1];

  if (event.shiftKey && document.activeElement === firstMenuItem) {
    event.preventDefault();
    lastMenuItem?.focus();
  } else if (!event.shiftKey && document.activeElement === lastMenuItem) {
    event.preventDefault();
    firstMenuItem?.focus();
  }
});

const mobileCta = document.getElementById('mobileCta');
const heroSection = document.getElementById('home');
const contactSection = document.getElementById('contact');

// Keep the call action out of the hero, contact section and open overlays.
function updateMobileCta() {
  if (!mobileCta || !heroSection || !contactSection) return;
  const intersectsViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };
  const showCta = window.matchMedia('(max-width: 900px)').matches &&
    !intersectsViewport(heroSection) && !intersectsViewport(contactSection) &&
    !modal.classList.contains('active') && mobileNav.getAttribute('aria-hidden') !== 'false';
  mobileCta.setAttribute('aria-hidden', String(!showCta));
  mobileCta.toggleAttribute('inert', !showCta);
}

const measureMobileCta = () => {
  if (!mobileCta) return;
  const height = mobileCta.getBoundingClientRect().height;
  if (height) document.documentElement.style.setProperty('--sticky-clearance', height + 'px');
  updateMobileCta();
};
let ctaFrame = 0;
window.addEventListener('scroll', () => {
  if (ctaFrame) return;
  ctaFrame = requestAnimationFrame(() => { ctaFrame = 0; updateMobileCta(); });
}, { passive: true });
window.addEventListener('resize', measureMobileCta);
if (mobileCta && 'ResizeObserver' in window) new ResizeObserver(measureMobileCta).observe(mobileCta);
modal.setAttribute('inert', '');
measureMobileCta();

window.matchMedia('(max-width: 900px)').addEventListener('change', event => {
  if (!event.matches && mobileNav.getAttribute('aria-hidden') === 'false') closeMobileNav(false);
});

// Enable enhanced controls only after essential handlers initialize successfully.
document.documentElement.classList.add('site-ready');
