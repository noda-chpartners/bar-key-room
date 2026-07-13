import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const body = document.querySelector('.site-body');
const intro = document.querySelector('[data-intro]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const finishIntro = () => {
  body?.classList.remove('is-loading');
  intro?.remove();
};

if (reduceMotion) {
  finishIntro();
} else if (intro) {
  gsap.set('[data-hero-copy]', { y: 48, opacity: 0 });
  gsap.set('[data-hero-key]', { opacity: 0, scale: 0.78, rotation: -22 });

  const introTimeline = gsap.timeline({ onComplete: finishIntro });
  introTimeline
    .to('.intro-screen__line', { scaleY: 1, duration: 1.1, ease: 'power3.inOut' })
    .fromTo('[data-intro-key]', { opacity: 0, rotation: -25, scale: 0.82 }, { opacity: 1, rotation: 0, scale: 1, duration: 1, ease: 'power3.out' }, 0.22)
    .fromTo('.intro-screen__word', { opacity: 0, letterSpacing: '0.8em' }, { opacity: 1, letterSpacing: '0.52em', duration: 0.9 }, 0.42)
    .to('[data-intro-key]', { rotation: 92, duration: 0.72, ease: 'power2.inOut' }, '+=0.15')
    .to(intro, { clipPath: 'inset(0 0 100% 0)', duration: 1.08, ease: 'power4.inOut' })
    .to('[data-hero-media]', { scale: 1, duration: 1.8, ease: 'power3.out' }, '-=0.72')
    .to('[data-hero-copy]', { y: 0, opacity: 1, duration: 1.15, stagger: 0.12, ease: 'power3.out' }, '-=1.42')
    .to('[data-hero-key]', { opacity: 1, scale: 1, rotation: 12, duration: 1.35, ease: 'elastic.out(1, 0.55)' }, '-=1.1');
} else {
  finishIntro();
}

const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-navigation]');

const closeNavigation = () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'メニューを開く');
  navigation?.classList.remove('is-open');
  body?.classList.remove('is-menu-open');
};

menuToggle?.addEventListener('click', () => {
  const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  menuToggle.setAttribute('aria-label', willOpen ? 'メニューを閉じる' : 'メニューを開く');
  navigation?.classList.toggle('is-open', willOpen);
  body?.classList.toggle('is-menu-open', willOpen);
});

navigation?.querySelectorAll('.site-header__nav-link').forEach((link) => {
  link.addEventListener('click', closeNavigation);
});

window.addEventListener('scroll', () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 80);
}, { passive: true });

if (!reduceMotion) {
  gsap.to('[data-hero-media]', {
    yPercent: 16,
    ease: 'none',
    scrollTrigger: {
      trigger: '[data-hero]',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });

  gsap.to('[data-hero-key]', {
    yPercent: 70,
    rotation: 85,
    ease: 'none',
    scrollTrigger: {
      trigger: '[data-hero]',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
    },
  });

  gsap.utils.toArray('[data-reveal]').forEach((element) => {
    gsap.from(element, {
      y: 44,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 86%',
        once: true,
      },
    });
  });

  gsap.from('[data-keyhole]', {
    scale: 0.72,
    opacity: 0,
    duration: 1.7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '[data-keyhole]',
      start: 'top 80%',
      once: true,
    },
  });

  gsap.to('.concept__image', {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: '[data-keyhole]',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.2,
    },
  });

  gsap.to('[data-floating-key]', {
    rotation: 48,
    yPercent: -90,
    ease: 'none',
    scrollTrigger: {
      trigger: '[data-keyhole]',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.4,
    },
  });

  gsap.utils.toArray('[data-parallax]').forEach((figure) => {
    const image = figure.querySelector('.space__image');
    const travel = Number(figure.dataset.parallax || 0);
    gsap.to(image, {
      yPercent: travel,
      ease: 'none',
      scrollTrigger: {
        trigger: figure,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.1,
      },
    });
  });

  gsap.fromTo('[data-movie-panel]',
    { clipPath: 'inset(0 18% 0 18%)' },
    {
      clipPath: 'inset(0 0% 0 0%)',
      ease: 'none',
      scrollTrigger: {
        trigger: '[data-movie-panel]',
        start: 'top 88%',
        end: 'top 28%',
        scrub: 1,
      },
    });

  gsap.from('[data-menu-item]', {
    x: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.menu__list',
      start: 'top 78%',
      once: true,
    },
  });

  gsap.to('[data-info-image] .information__image', {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: '[data-info-image]',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.2,
    },
  });

  gsap.from('[data-info-row]', {
    y: 28,
    opacity: 0,
    duration: 0.9,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.information__details',
      start: 'top 80%',
      once: true,
    },
  });

  document.querySelectorAll('[data-magnetic]').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const bounds = element.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      gsap.to(element, { x: x * 0.1, y: y * 0.18, duration: 0.45, ease: 'power2.out' });
    });

    element.addEventListener('pointerleave', () => {
      gsap.to(element, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    });
  });
}

window.addEventListener('load', () => ScrollTrigger.refresh());
