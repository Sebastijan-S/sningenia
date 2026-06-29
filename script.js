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
  mobileNav.setAttribute('aria-hidden', 'false');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
};

const closeMobileNav = () => {
  mobileNav.setAttribute('aria-hidden', 'true');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
};

navToggle?.addEventListener('click', () => {
  if (mobileNav.getAttribute('aria-hidden') === 'true') {
    openMobileNav();
  } else {
    closeMobileNav();
  }
});

navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    // smooth scroll without changing file:// URL hash (avoids cross-origin frame issues)
    e.preventDefault();
    const href = link.getAttribute('href') || '';
    const targetId = href.replace('#', '');
    const target = targetId ? document.getElementById(targetId) : document.body;
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.id || 'home';
    const isActive = scrollPosition >= top && scrollPosition < top + height;

    navLinks.forEach((link) => {
      const href = link.getAttribute('href')?.replace('#', '') || '';
      link.classList.toggle('active', href === id);
    });
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
const modalPanel = document.querySelector('.modal-panel');
const submitSuccess = document.createElement('div');
submitSuccess.className = 'form-success';
submitSuccess.textContent = 'Thanks — this is a demo form. I’ll be in touch once you add your real inbox handler.';

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
  navToggle?.focus();
};

const cards = document.querySelectorAll('.work-card');
cards.forEach((card) => {
  card.addEventListener('click', (event) => {
    event.preventDefault();
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
  }
});

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (contactForm.nextElementSibling !== submitSuccess) {
      contactForm.parentElement?.appendChild(submitSuccess);
    }
    contactForm.reset();
  });
}
