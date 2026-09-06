const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const packageSelect = document.getElementById('packageSelect');
const bookingForm = document.getElementById('bookingForm');
const formStatus = document.getElementById('formStatus');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
});

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

document.querySelectorAll('.select-package').forEach((button) => {
  button.addEventListener('click', () => {
    if (packageSelect) packageSelect.value = button.dataset.package || '';
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('customerName')?.focus(), 500);
  });
});

bookingForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('customerName')?.value.trim() || '—';
  const pkg = packageSelect?.value || 'Not selected yet';
  const rawDate = document.getElementById('eventDate')?.value || '';
  const location = document.getElementById('eventLocation')?.value.trim() || '—';

  let dateText = '—';
  if (rawDate) {
    const [year, month, day] = rawDate.split('-');
    dateText = `${day}/${month}/${year}`;
  }

  const message = [
    'Hi Candy Craze! I would like to enquire about an event booking.',
    '',
    `Name: ${name}`,
    `Package: ${pkg}`,
    `Event date: ${dateText}`,
    `Event location: ${location}`,
    '',
    'Can you please help me check the availability? Thank you!'
  ].join('\n');

  try {
    await navigator.clipboard.writeText(message);
    formStatus.textContent = 'Enquiry copied ✓ You can now paste it into Instagram or TikTok DM.';
  } catch (error) {
    formStatus.textContent = 'Could not auto-copy. Please DM @eminents.candycraze with the details above.';
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
