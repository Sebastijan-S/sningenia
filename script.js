const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const parent = entry.target.parentElement;
    const siblings = parent ? parent.querySelectorAll('.reveal:not(.visible)') : [entry.target];
    let delay = 0;

    siblings.forEach((el) => {
      if (el === entry.target || el.getBoundingClientRect().top < window.innerHeight) {
        setTimeout(() => el.classList.add('visible'), delay);
        delay += 80;
      }
    });

    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

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
};

const closeMobileNav = () => {
  mobileNav.setAttribute('inert', '');
  mobileNav.setAttribute('aria-hidden', 'true');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  navToggle.focus();
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
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) return;

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    target.scrollIntoView({ behavior, block: 'start' });
    closeMobileNav();
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
const modalDetails = document.querySelector('.modal-details');
const modalCopy = document.querySelector('.modal-copy');
const modalResult = document.querySelector('.modal-result');
const modalImage = document.getElementById('modalImage');
const contactForm = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');
const contactError = document.getElementById('contactError');
const contactErrorMessage = document.getElementById('contactErrorMessage');
const isSerbian = document.documentElement.lang === 'sr';

const showContactError = (message) => {
  if (contactErrorMessage) contactErrorMessage.textContent = message;
  if (contactSuccess) contactSuccess.hidden = true;
  if (contactError) contactError.hidden = false;
  document.dispatchEvent(new CustomEvent('sn:form-error'));
};

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
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  updateModalFocus();
  firstFocusableModal?.focus();
};

const closeModal = () => {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  modalTrigger?.focus();
  modalTrigger = null;
};

let modalTrigger = null;
const cardOpenButtons = document.querySelectorAll('.card-open');
cardOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.project-card');
    if (!card) return;

    const title = card.querySelector('.card-title')?.textContent?.trim() || 'Project title';
    const description = card.querySelector('.card-desc')?.textContent?.trim() || '';
    const role = card.dataset.role || '';
    const timeline = card.dataset.timeline || '';
    const deliverables = card.dataset.deliverables || '';
    const challenge = card.dataset.challenge || '';
    const solution = card.dataset.solution || '';
    const result = card.dataset.result || '';
    const image = card.dataset.image || '';
    const detailValues = modalDetails.querySelectorAll('strong');

    modalTitle.textContent = title;
    modalSubtitle.textContent = description;
    if (detailValues.length >= 3) {
      detailValues[0].textContent = role;
      detailValues[1].textContent = timeline;
      detailValues[2].textContent = deliverables;
    }
    modalCopy.querySelector('.modal-block:nth-of-type(1) p').textContent = challenge;
    modalCopy.querySelector('.modal-block:nth-of-type(2) p').textContent = solution;
    if (modalResult) {
      modalResult.querySelector('p').textContent = result;
    }
    if (modalImage) {
      modalImage.src = image;
      modalImage.alt = `${title} case study image`;
    }

    modalTrigger = button;
    openModal();
  });
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

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (contactForm.elements.website.value) return;

    const endpoint = contactForm.dataset.endpoint.trim();
    if (!endpoint) {
      showContactError(isSerbian
        ? 'Forma još nije povezana. Pošaljite nam e-poruku na'
        : 'The form is not connected yet. Please email');
      return;
    }

    if (contactError) contactError.hidden = true;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(contactForm)
      });
      if (!response.ok) throw new Error('Form submission failed');

      if (contactSuccess) contactSuccess.hidden = false;
      document.dispatchEvent(new CustomEvent('sn:form-success'));
      contactForm.reset();
    } catch {
      showContactError(isSerbian
        ? 'Poruku nije bilo moguće poslati. Pošaljite nam e-poruku na'
        : 'Your message could not be sent. Please email');
    }
  });
}

const mobileCta = document.getElementById('mobileCta');
const heroSection = document.getElementById('home');
const contactSection = document.getElementById('contact');

if (mobileCta && heroSection && contactSection && 'IntersectionObserver' in window) {
  let heroVisible = true;
  let contactVisible = false;

  const updateMobileCta = () => {
    const showCta = !heroVisible && !contactVisible;
    mobileCta.setAttribute('aria-hidden', String(!showCta));
    if (showCta) {
      mobileCta.removeAttribute('inert');
    } else {
      mobileCta.setAttribute('inert', '');
    }
  };

  const heroObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    updateMobileCta();
  });
  const contactObserver = new IntersectionObserver(([entry]) => {
    contactVisible = entry.isIntersecting;
    updateMobileCta();
  });

  heroObserver.observe(heroSection);
  contactObserver.observe(contactSection);
}
