const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const packageSelect = document.getElementById('packageSelect');
const bookingForm = document.getElementById('bookingForm');
const formStatus = document.getElementById('formStatus');
const customerName = document.getElementById('customerName');
const eventDate = document.getElementById('eventDate');
const eventLocation = document.getElementById('eventLocation');
const bookingAddons = document.getElementById('bookingAddons');
const candyAddon = document.getElementById('candyAddon');
const snackAddon = document.getElementById('snackAddon');
const addonSummary = document.getElementById('addonSummary');
const suggestions = document.getElementById('locationSuggestions');
const locationHelper = document.getElementById('locationHelper');
const currentLocationButton = document.getElementById('currentLocationButton');
const WHATSAPP_NUMBER = '601139376728';

const PACKAGE_INFO = {
  'Basic Craze — RM80': { price: 80, candies: 0, snacks: 0, addons: false },
  'Standard Craze — RM110': { price: 110, candies: 0, snacks: 0, addons: false },
  'Popular Craze — RM260': { price: 260, candies: 6, snacks: 3, addons: true },
  'Premium Craze — RM360': { price: 360, candies: 9, snacks: 3, addons: true }
};

const ADDON_INFO = {
  candy3: { label: '+3 Random Candies', price: 67.40, candies: 3, snacks: 0 },
  candy6: { label: '+6 Random Candies', price: 134.80, candies: 6, snacks: 0 },
  snack3: { label: '+3 Random Snacks', price: 46.30, candies: 0, snacks: 3 }
};

const money = (value) => {
  const decimals = Number.isInteger(value) ? 0 : 2;
  return `RM${value.toFixed(decimals)}`;
};

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

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

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

if (eventDate) {
  const today = new Date();
  const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  eventDate.min = local;
}

function getAddonSelection() {
  const selected = [];
  if (candyAddon?.value && ADDON_INFO[candyAddon.value]) selected.push(ADDON_INFO[candyAddon.value]);
  if (snackAddon?.value && ADDON_INFO[snackAddon.value]) selected.push(ADDON_INFO[snackAddon.value]);
  return selected;
}

function updateAddonSummary() {
  const info = PACKAGE_INFO[packageSelect?.value];
  const eligible = Boolean(info?.addons);
  if (bookingAddons) bookingAddons.hidden = !eligible;

  if (!eligible) {
    if (candyAddon) candyAddon.value = '';
    if (snackAddon) snackAddon.value = '';
    if (addonSummary) addonSummary.textContent = '';
    return;
  }

  const selected = getAddonSelection();
  const extraCandies = selected.reduce((sum, item) => sum + item.candies, 0);
  const extraSnacks = selected.reduce((sum, item) => sum + item.snacks, 0);
  const addonTotal = selected.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = info.price + addonTotal;
  const addOnText = selected.length ? selected.map((item) => item.label).join(' + ') : 'No add-ons selected';

  if (addonSummary) {
    addonSummary.innerHTML = `<strong>${addOnText}</strong><br>Final treats: ${info.candies + extraCandies} candies + ${info.snacks + extraSnacks} snacks · Total: ${money(totalPrice)}`;
  }
}

packageSelect?.addEventListener('change', updateAddonSummary);
candyAddon?.addEventListener('change', updateAddonSummary);
snackAddon?.addEventListener('change', updateAddonSummary);
updateAddonSummary();

document.querySelectorAll('.select-package').forEach((button) => {
  button.addEventListener('click', () => {
    if (packageSelect) {
      packageSelect.value = button.dataset.package || '';
      updateAddonSummary();
    }
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => customerName?.focus(), 450);
  });
});

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
  return uniqueParts([p.name, streetLine, p.suburb, p.district, city, p.state, p.postcode, p.country]).join(', ');
}

function hideSuggestions() {
  if (!suggestions) return;
  suggestions.hidden = true;
  suggestions.replaceChildren();
}

function renderSuggestions(features) {
  if (!suggestions) return;
  suggestions.replaceChildren();
  const valid = features.map((feature) => formatPhotonAddress(feature)).filter(Boolean).slice(0, 5);
  if (!valid.length) {
    hideSuggestions();
    return;
  }

  valid.forEach((address) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'location-option';
    option.setAttribute('role', 'option');
    option.textContent = address;
    option.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      eventLocation.value = address;
      selectedAddress = address;
      if (locationHelper) locationHelper.textContent = 'Address selected. Please check that it is correct.';
      hideSuggestions();
    });
    suggestions.appendChild(option);
  });
  suggestions.hidden = false;
}

eventLocation?.addEventListener('input', () => {
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

eventLocation?.addEventListener('focus', () => {
  if (suggestions?.childElementCount) suggestions.hidden = false;
});

document.addEventListener('pointerdown', (event) => {
  if (eventLocation && suggestions && !eventLocation.closest('.location-field')?.contains(event.target)) hideSuggestions();
});

currentLocationButton?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    if (locationHelper) locationHelper.textContent = 'Current location is not supported on this device. Please type the address.';
    return;
  }

  const originalText = currentLocationButton.textContent;
  currentLocationButton.disabled = true;
  currentLocationButton.textContent = 'Finding your location…';
  if (locationHelper) locationHelper.textContent = 'Allow location access when your browser asks.';

  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try {
      const url = `https://photon.komoot.io/reverse?lat=${encodeURIComponent(coords.latitude)}&lon=${encodeURIComponent(coords.longitude)}&lang=en`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Reverse geocoding failed');
      const data = await response.json();
      const address = formatPhotonAddress(data.features?.[0]);
      if (!address) throw new Error('No address found');
      eventLocation.value = address;
      selectedAddress = address;
      if (locationHelper) locationHelper.textContent = 'Current location converted to an address. Please check that it is correct.';
    } catch {
      if (locationHelper) locationHelper.textContent = 'Could not find the full address. Please type it manually.';
    } finally {
      currentLocationButton.disabled = false;
      currentLocationButton.textContent = originalText;
    }
  }, () => {
    if (locationHelper) locationHelper.textContent = 'Location permission was not available. Please type the address manually.';
    currentLocationButton.disabled = false;
    currentLocationButton.textContent = originalText;
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
});

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
  const packageInfo = PACKAGE_INFO[pkg];
  const selected = packageInfo?.addons ? getAddonSelection() : [];
  const extraCandies = selected.reduce((sum, item) => sum + item.candies, 0);
  const extraSnacks = selected.reduce((sum, item) => sum + item.snacks, 0);
  const addonTotal = selected.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = (packageInfo?.price || 0) + addonTotal;

  const message = [
    'Hi Candy Craze! I would like to enquire about an event booking.',
    '',
    `Name: ${name}`,
    `Package: ${pkg}`,
    ...(packageInfo?.addons ? [
      `Add-ons: ${selected.length ? selected.map((item) => `${item.label} — ${money(item.price)}`).join(', ') : 'None'}`,
      `Final treats: ${packageInfo.candies + extraCandies} candies + ${packageInfo.snacks + extraSnacks} snacks`
    ] : []),
    `Total: ${money(totalPrice)}`,
    `Event date: ${dateText}`,
    `Event location: ${location}`,
    '',
    'I understand that candy/snack selections are random and subject to availability.',
    'I understand that free delivery is available within 10km.',
    '',
    'Can you please help me check the availability? Thank you!'
  ].join('\n');

  if (formStatus) formStatus.textContent = 'Opening WhatsApp…';
  window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
});

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
