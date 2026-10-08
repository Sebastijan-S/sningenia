// Paste your GA4 Measurement ID (G-XXXXXXXXXX) and Clarity Project ID here.
const GA4_ID = '';
const CLARITY_ID = '';

const analyticsAllowed = navigator.doNotTrack !== '1'
  && navigator.globalPrivacyControl !== true;

window.snTrack = (name, params = {}) => {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
    if (typeof window.clarity === 'function') {
      window.clarity('event', name);
    }
  } catch (error) {
    console.error('Analytics tracking failed.', error);
  }
};

if (analyticsAllowed && GA4_ID) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID);

  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
  document.head.appendChild(gaScript);
}

if (analyticsAllowed && CLARITY_ID) {
  (function loadClarity(windowObject, documentObject, clarityId) {
    windowObject.clarity = windowObject.clarity || function clarity() {
      (windowObject.clarity.q = windowObject.clarity.q || []).push(arguments);
    };
    const clarityScript = documentObject.createElement('script');
    const firstScript = documentObject.getElementsByTagName('script')[0];
    clarityScript.async = true;
    clarityScript.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityId)}`;
    firstScript.parentNode.insertBefore(clarityScript, firstScript);
  })(window, document, CLARITY_ID);
}

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const cta = target.closest('[data-cta]');
  if (cta) {
    window.snTrack('cta_click', {
      cta_name: cta.dataset.cta,
      link_text: cta.textContent.trim().replace(/\s+/g, ' '),
      page_path: window.location.pathname
    });
  }

  const caseStudyButton = target.closest('.card-open');
  if (caseStudyButton) {
    const projectName = caseStudyButton.closest('.project-card')
      ?.querySelector('.card-title')?.textContent?.trim();
    if (projectName) {
      window.snTrack('case_study_open', { project_name: projectName });
    }
  }

  const link = target.closest('a[href]');
  if (!link) return;

  if (link.href.startsWith('mailto:')) {
    window.snTrack('email_click');
  } else if (link.classList.contains('language-switcher-link')
    || link.closest('.language-switcher')) {
    window.snTrack('language_switch', {
      target_language: link.lang || new URL(link.href).pathname
    });
  } else {
    const url = new URL(link.href, window.location.href);
    if ((url.protocol === 'http:' || url.protocol === 'https:')
      && url.origin !== window.location.origin) {
      window.snTrack('outbound_click', { link_domain: url.hostname });
    }
  }
});

document.addEventListener('toggle', (event) => {
  const details = event.target;
  if (!(details instanceof HTMLDetailsElement) || !details.open) return;
  window.snTrack('faq_open', {
    question: details.querySelector('summary')?.textContent?.trim() || ''
  });
}, true);

let formStarted = false;
document.addEventListener('focusin', (event) => {
  if (formStarted || !(event.target instanceof Element)) return;
  const formField = event.target.closest('#contactForm input, #contactForm textarea, #contactForm select');
  if (!formField || formField.name === 'website') return;
  formStarted = true;
  window.snTrack('form_start');
});

document.addEventListener('sn:form-success', () => window.snTrack('form_submit_success'));
document.addEventListener('sn:form-error', () => window.snTrack('form_submit_error'));
