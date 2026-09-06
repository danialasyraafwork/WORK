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

[customerName, packageSelect, eventDate, eventLocation].forEach((field) => {
  if (field) field.required = true;
});

const submitButton = bookingForm?.querySelector('button[type="submit"]');
if (submitButton) submitButton.textContent = 'Send via WhatsApp';

const bookingIntro = document.querySelector('.booking-copy > p');
if (bookingIntro) {
  bookingIntro.textContent = 'Fill in all the event details below and we’ll open WhatsApp with your enquiry message ready to send.';
}

const packageNote = document.querySelector('.package-note');
if (packageNote) {
  packageNote.innerHTML = '* Candies and snacks for Popular Craze and Premium Craze are provided as random selections. <strong>Free delivery within 10km.</strong>';
}

const bookingCopy = document.querySelector('.booking-copy');
if (bookingCopy && !document.querySelector('.delivery-note')) {
  const deliveryNote = document.createElement('p');
  deliveryNote.className = 'delivery-note';
  deliveryNote.innerHTML = '<strong>Free delivery within 10km.</strong>';
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

// Event location autocomplete powered by OpenStreetMap/Photon.
let selectedAddress = '';
let searchTimer = null;
let activeSearch = null;

function uniqueParts(parts) {
  const seen = new Set();
  return parts.filter((part) => {
    const value = String(part || '').trim();
    if (!value) return false;
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatPhotonAddress(feature) {
  const p = feature?.properties || {};
  const streetLine = p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street;
  const city = p.city || p.town || p.village || p.county;
  return uniqueParts([
    p.name,
    streetLine,
    p.suburb,
    p.district,
    city,
    p.state,
    p.postcode,
    p.country
  ]).join(', ');
}

if (eventLocation) {
  eventLocation.placeholder = 'Search venue or full address';
  eventLocation.autocomplete = 'off';
  eventLocation.setAttribute('aria-autocomplete', 'list');

  const label = eventLocation.closest('label');
  if (label) {
    label.style.position = 'relative';

    const helper = document.createElement('small');
    helper.textContent = 'Start typing and choose the correct address below.';
    helper.style.display = 'block';
    helper.style.marginTop = '7px';
    helper.style.opacity = '.72';
    helper.style.fontSize = '11px';

    const currentLocationButton = document.createElement('button');
    currentLocationButton.type = 'button';
    currentLocationButton.textContent = 'Use Current Location';
    currentLocationButton.setAttribute('aria-label', 'Use current location for event address');
    Object.assign(currentLocationButton.style, {
      width: '100%',
      marginTop: '9px',
      minHeight: '42px',
      border: '1px solid rgba(255,255,255,.28)',
      borderRadius: '999px',
      background: 'rgba(255,255,255,.10)',
      color: 'inherit',
      fontWeight: '700',
      cursor: 'pointer'
    });

    const suggestions = document.createElement('div');
    suggestions.id = 'locationSuggestions';
    suggestions.setAttribute('role', 'listbox');
    Object.assign(suggestions.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      top: 'calc(100% - 58px)',
      zIndex: '100',
      display: 'none',
      maxHeight: '260px',
      overflowY: 'auto',
      borderRadius: '16px',
      border: '1px solid rgba(53,42,39,.14)',
      background: '#fffaf6',
      color: '#352a27',
      boxShadow: '0 18px 44px rgba(45,30,25,.18)'
    });

    label.appendChild(suggestions);
    label.appendChild(helper);
    label.appendChild(currentLocationButton);

    const hideSuggestions = () => {
      suggestions.style.display = 'none';
      suggestions.replaceChildren();
    };

    const renderSuggestions = (features) => {
      suggestions.replaceChildren();

      const valid = features
        .map((feature) => ({ feature, address: formatPhotonAddress(feature) }))
        .filter((item) => item.address)
        .slice(0, 5);

      if (!valid.length) {
        hideSuggestions();
        return;
      }

      valid.forEach(({ address }) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.setAttribute('role', 'option');
        option.textContent = address;
        Object.assign(option.style, {
          display: 'block',
          width: '100%',
          padding: '13px 14px',
          border: '0',
          borderBottom: '1px solid rgba(53,42,39,.09)',
          background: 'transparent',
          color: 'inherit',
          textAlign: 'left',
          lineHeight: '1.35',
          cursor: 'pointer'
        });

        option.addEventListener('pointerdown', (event) => {
          event.preventDefault();
          eventLocation.value = address;
          selectedAddress = address;
          hideSuggestions();
        });

        suggestions.appendChild(option);
      });

      suggestions.style.display = 'block';
    };

    eventLocation.addEventListener('input', () => {
      selectedAddress = '';
      clearTimeout(searchTimer);
      activeSearch?.abort();

      const query = eventLocation.value.trim();
      if (query.length < 3) {
        hideSuggestions();
        return;
      }

      searchTimer = setTimeout(async () => {
        activeSearch = new AbortController();
        try {
          const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en`;
          const response = await fetch(url, { signal: activeSearch.signal });
          if (!response.ok) throw new Error('Address search failed');
          const data = await response.json();
          renderSuggestions(data.features || []);
        } catch (error) {
          if (error.name !== 'AbortError') hideSuggestions();
        }
      }, 350);
    });

    eventLocation.addEventListener('focus', () => {
      if (suggestions.childElementCount) suggestions.style.display = 'block';
    });

    document.addEventListener('pointerdown', (event) => {
      if (!label.contains(event.target)) hideSuggestions();
    });

    currentLocationButton.addEventListener('click', () => {
      if (!navigator.geolocation) {
        helper.textContent = 'Current location is not supported on this device. Please type the address.';
        return;
      }

      const originalText = currentLocationButton.textContent;
      currentLocationButton.disabled = true;
      currentLocationButton.textContent = 'Finding your location…';
      helper.textContent = 'Allow location access when your browser asks.';

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const url = `https://photon.komoot.io/reverse?lat=${encodeURIComponent(coords.latitude)}&lon=${encodeURIComponent(coords.longitude)}&lang=en`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Reverse geocoding failed');
            const data = await response.json();
            const address = formatPhotonAddress(data.features?.[0]);

            if (!address) throw new Error('No address found');
            eventLocation.value = address;
            selectedAddress = address;
            helper.textContent = 'Current location converted to a full address. Please check it is correct.';
          } catch (error) {
            helper.textContent = 'Could not find the full address. Please type it manually.';
          } finally {
            currentLocationButton.disabled = false;
            currentLocationButton.textContent = originalText;
          }
        },
        () => {
          helper.textContent = 'Location permission was not available. Please type the address manually.';
          currentLocationButton.disabled = false;
          currentLocationButton.textContent = originalText;
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    });
  }
}

bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const name = customerName.value.trim();
  const pkg = packageSelect.value;
  const rawDate = eventDate.value;
  const location = selectedAddress || eventLocation.value.trim();
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
