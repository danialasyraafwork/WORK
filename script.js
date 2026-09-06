const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const packageSelect = document.getElementById('packageSelect');
const bookingForm = document.getElementById('bookingForm');
const formStatus = document.getElementById('formStatus');
const customerName = document.getElementById('customerName');
const eventDate = document.getElementById('eventDate');
const eventLocation = document.getElementById('eventLocation');
const WHATSAPP_NUMBER = '601139376728';

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 10);
});

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks?.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks?.classList.remove('open');
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

// Booking form: every field is required.
[customerName, packageSelect, eventDate, eventLocation].forEach((field) => {
  if (field) field.required = true;
});

// Update visible booking wording without changing the existing layout.
const submitButton = bookingForm?.querySelector('button[type="submit"]');
if (submitButton) submitButton.textContent = 'Send via WhatsApp';

const bookingIntro = document.querySelector('.booking-copy > p');
if (bookingIntro) {
  bookingIntro.textContent = 'Fill in all the event details below and we’ll open WhatsApp with your enquiry message ready to send.';
}

const packageNote = document.querySelector('.package-note');
if (packageNote) {
  packageNote.textContent = '* Candies and snacks for Popular Craze and Premium Craze are provided as random selections. Free delivery within 10km.';
}

const bookingCopy = document.querySelector('.booking-copy');
if (bookingCopy && !document.querySelector('.delivery-note')) {
  const deliveryNote = document.createElement('p');
  deliveryNote.className = 'delivery-note';
  deliveryNote.innerHTML = '<strong>Free delivery within 10km.</strong>';
  deliveryNote.style.marginTop = '16px';
  deliveryNote.style.color = '#f3ddd4';
  bookingCopy.appendChild(deliveryNote);
}

const faqItems = document.querySelectorAll('.accordion details');
faqItems.forEach((item) => {
  const summary = item.querySelector('summary');
  const answer = item.querySelector('p');
  if (summary?.textContent.trim() === 'How do I book?' && answer) {
    answer.textContent = 'Choose your package, fill in all required event details, then tap “Send via WhatsApp”. Your enquiry will open in WhatsApp ready to send.';
  }
});

document.querySelectorAll('.select-package').forEach((button) => {
  button.addEventListener('click', () => {
    if (packageSelect) packageSelect.value = button.dataset.package || '';
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => customerName?.focus(), 500);
  });
});

bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  // Extra guard in addition to native HTML required validation.
  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const name = customerName.value.trim();
  const pkg = packageSelect.value;
  const rawDate = eventDate.value;
  const location = eventLocation.value.trim();
  const [year, month, day] = rawDate.split('-');
  const dateText = `${day}/${month}/${year}`;

  const message = [
    'Hi Candy Craze! I would like to enquire about an event booking.',
    '',
    `Name: ${name}`,
    `Package: ${pkg}`,
    `Event date: ${dateText}`,
    `Event location: ${location}`,
    '',
    'I understand that free delivery is available within 10km.',
    '',
    'Can you please help me check the availability? Thank you!'
  ].join('\n');

  if (formStatus) formStatus.textContent = 'Opening WhatsApp…';

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.location.href = whatsappUrl;
});

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
