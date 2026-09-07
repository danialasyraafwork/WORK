// Candy Craze main interactions
(() => {
  if (!document.querySelector('link[href*="visual-booking.css"]')) {
    const visualCss = document.createElement('link');
    visualCss.rel = 'stylesheet';
    visualCss.href = 'visual-booking.css?v=4';
    document.head.appendChild(visualCss);
  }

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
  const packageChoiceError = document.getElementById('packageChoiceError');
  const packageOptions = Array.from(document.querySelectorAll('.booking-package-option'));
  const bookingPackagePreview = document.getElementById('bookingPackagePreview');
  const bookingPreviewPhoto = document.getElementById('bookingPreviewPhoto');
  const bookingPreviewName = document.getElementById('bookingPreviewName');
  const bookingPreviewPrice = document.getElementById('bookingPreviewPrice');
  const bookingPreviewSummary = document.getElementById('bookingPreviewSummary');
  const bookingPreviewTags = document.getElementById('bookingPreviewTags');
  const WHATSAPP_NUMBER = '601139376728';

  const BASIC_PROMO_PRICE = 80;
  const BASIC_REGULAR_PRICE = 95;
  const BASIC_PROMO_START = 20260901;
  const BASIC_PROMO_END = 20261031;

  function malaysiaDateNumber() {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).formatToParts(new Date());
      const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      return Number(`${values.year}${values.month}${values.day}`);
    } catch {
      const now = new Date();
      return Number(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`);
    }
  }

  function basicPromoActive() {
    const today = malaysiaDateNumber();
    return today >= BASIC_PROMO_START && today <= BASIC_PROMO_END;
  }

  function currentBasicPrice() {
    return basicPromoActive() ? BASIC_PROMO_PRICE : BASIC_REGULAR_PRICE;
  }

  function currentBasicPackageValue() {
    return `Basic Craze — RM${currentBasicPrice()}`;
  }

  const PACKAGE_INFO = {
    'Basic Craze — RM80': {
      key: 'basic', price: 80, candies: 0, snacks: 0, addons: false,
      name: 'Basic Craze',
      summary: 'A clean candy wall setup with 9 boxes. Candies and snacks are not included.',
      tags: ['Candy wall + 9 boxes', 'Setup only', '50 paper cups', 'Free installation']
    },
    'Basic Craze — RM95': {
      key: 'basic', price: 95, candies: 0, snacks: 0, addons: false,
      name: 'Basic Craze',
      summary: 'A clean candy wall setup with 9 boxes. Candies and snacks are not included.',
      tags: ['Candy wall + 9 boxes', 'Setup only', '50 paper cups', 'Free installation']
    },
    'Standard Craze — RM110': {
      key: 'standard', price: 110, candies: 0, snacks: 0, addons: false,
      name: 'Standard Craze',
      summary: 'A setup-only package with an added 3-tier rack for extra display space.',
      tags: ['Candy wall + 9 boxes', '3-tier rack', 'Setup only', 'Free installation']
    },
    'Popular Craze — RM260': {
      key: 'popular', price: 260, candies: 6, snacks: 3, addons: true,
      name: 'Popular Craze',
      summary: 'A ready-filled candy wall with 6 random candies and 3 random snacks.',
      tags: ['6 random candies', '3 random snacks', '50 paper cups', 'Add-ons available']
    },
    'Premium Craze — RM360': {
      key: 'premium', price: 360, candies: 9, snacks: 3, addons: true,
      name: 'Premium Craze',
      summary: 'The fullest setup with a 3-tier rack, 9 random candies and 3 random snacks.',
      tags: ['9 random candies', '3 random snacks', '3-tier rack', 'Add-ons available']
    }
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

  function ensurePromoStyles() {
    if (document.getElementById('basicPromoStyles')) return;
    const style = document.createElement('style');
    style.id = 'basicPromoStyles';
    style.textContent = `
      .basic-promo-badge{display:inline-flex;align-items:center;margin:0 0 14px;padding:7px 11px;border-radius:999px;background:#8c5a3e;color:#fff;font-size:10px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}
      .basic-promo-note{margin:10px 0 0;color:#8c5a3e;font-size:12px;font-weight:700}
      .basic-promo-note s{opacity:.7;margin-right:5px}
      .promo-announcement{background:#8c5a3e;color:#fffaf6}
      .booking-promo-note{display:block;color:#f0cdbb!important;font-weight:700}
    `;
    document.head.appendChild(style);
  }

  function updateBasicStructuredData(active, price) {
    const schema = document.querySelector('script[type="application/ld+json"]');
    if (!schema) return;
    try {
      const data = JSON.parse(schema.textContent);
      const service = data?.['@graph']?.find((item) => item['@type'] === 'Service');
      const offer = service?.offers?.find((item) => String(item.name || '').startsWith('Basic Craze'));
      if (offer) {
        offer.name = active ? 'Basic Craze — Sep–Oct 2026 Promo' : 'Basic Craze';
        offer.price = String(price);
        offer.priceCurrency = 'MYR';
        offer.description = active
          ? 'Promotional price RM80 for bookings confirmed by 31 October 2026. Regular price RM95.'
          : 'Regular price RM95.';
        if (active) offer.priceValidUntil = '2026-10-31';
        else delete offer.priceValidUntil;
      }
      schema.textContent = JSON.stringify(data);
    } catch {}
  }

  function updateBasicMeta(active) {
    const description = active
      ? 'Candy Craze candy wall packages for events. Basic Craze promo RM80 for bookings confirmed by 31 October 2026 (regular RM95), with free installation and free delivery within 10km.'
      : 'Candy Craze candy wall packages for birthdays, weddings and celebrations, with free installation and free delivery within 10km.';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
  }

  function applyBasicPricingUI() {
    ensurePromoStyles();
    const active = basicPromoActive();
    const price = currentBasicPrice();
    const value = currentBasicPackageValue();

    const announcement = document.querySelector('.announcement');
    const announcementPrice = announcement?.querySelector('strong');
    if (announcementPrice) announcementPrice.textContent = active ? 'RM80 promo' : 'RM95';
    announcement?.classList.toggle('promo-announcement', active);

    const trustItems = document.querySelectorAll('.trust-row > div');
    const trustPrice = trustItems[1]?.querySelector('strong');
    const trustLabel = trustItems[1]?.querySelector('span');
    if (trustPrice) trustPrice.textContent = money(price);
    if (trustLabel) trustLabel.textContent = active ? 'Sep–Oct promo' : 'starting price';

    const basicCard = document.querySelector('.basic-photo.package-card-photo')?.closest('.package-card');
    if (basicCard) {
      const priceEl = basicCard.querySelector('.price');
      if (priceEl) priceEl.innerHTML = `<small>RM</small>${price}`;
      const selectButton = basicCard.querySelector('.select-package');
      if (selectButton) selectButton.dataset.package = value;

      let badge = basicCard.querySelector('.basic-promo-badge');
      let note = basicCard.querySelector('.basic-promo-note');
      if (active) {
        if (!badge) {
          badge = document.createElement('div');
          badge.className = 'basic-promo-badge';
          badge.textContent = 'Sep–Oct 2026 Promo';
          basicCard.querySelector('.package-body')?.prepend(badge);
        }
        if (!note) {
          note = document.createElement('p');
          note.className = 'basic-promo-note';
          note.innerHTML = '<s>Normal RM95</s> RM80 for bookings confirmed by 31 October 2026.';
          basicCard.querySelector('.feature-list')?.insertAdjacentElement('afterend', note);
        }
      } else {
        badge?.remove();
        note?.remove();
      }
    }

    const basicOption = packageOptions.find((button) => button.querySelector('.basic-photo'));
    if (basicOption) {
      basicOption.dataset.package = value;
      const priceText = basicOption.querySelector('b');
      const smallText = basicOption.querySelector('small');
      if (priceText) priceText.textContent = money(price);
      if (smallText) {
        smallText.textContent = active ? 'Promo · normal RM95' : 'Setup only';
        smallText.classList.toggle('booking-promo-note', active);
      }
    }

    if (packageSelect?.value?.startsWith('Basic Craze')) {
      packageSelect.value = value;
      renderPackagePreview(value);
    }

    updateBasicStructuredData(active, price);
    updateBasicMeta(active);
  }

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

  function renderPackagePreview(value) {
    const info = PACKAGE_INFO[value];
    if (!info) return;

    packageOptions.forEach((button) => {
      const selected = button.dataset.package === value;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    if (bookingPackagePreview && bookingPreviewPhoto && bookingPreviewName && bookingPreviewPrice && bookingPreviewSummary && bookingPreviewTags) {
      bookingPackagePreview.hidden = false;
      bookingPreviewPhoto.className = `package-photo booking-preview-photo ${info.key}-photo`;
      bookingPreviewPhoto.setAttribute('aria-label', `${info.name} package preview`);
      bookingPreviewName.textContent = info.name;
      bookingPreviewPrice.textContent = money(info.price);
      bookingPreviewSummary.textContent = info.summary;
      bookingPreviewTags.replaceChildren(...info.tags.map((tag) => {
        const span = document.createElement('span');
        span.textContent = tag;
        return span;
      }));

      if (info.key === 'basic' && basicPromoActive()) {
        const promoTag = document.createElement('span');
        promoTag.textContent = 'Sep–Oct promo · normal RM95';
        bookingPreviewTags.prepend(promoTag);
      }
    }

    if (packageChoiceError) packageChoiceError.textContent = '';
  }

  function selectPackage(value, scrollToBooking = false) {
    const normalizedValue = value?.startsWith('Basic Craze') ? currentBasicPackageValue() : value;
    if (!packageSelect || !PACKAGE_INFO[normalizedValue]) return;
    packageSelect.value = normalizedValue;
    renderPackagePreview(normalizedValue);
    updateAddonSummary();
    if (scrollToBooking) {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => customerName?.focus(), 450);
    }
  }

  applyBasicPricingUI();

  packageOptions.forEach((button) => {
    button.addEventListener('click', () => selectPackage(button.dataset.package || ''));
  });

  document.querySelectorAll('.select-package').forEach((button) => {
    button.addEventListener('click', () => selectPackage(button.dataset.package || '', true));
  });

  candyAddon?.addEventListener('change', updateAddonSummary);
  snackAddon?.addEventListener('change', updateAddonSummary);
  updateAddonSummary();

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

    if (packageSelect?.value?.startsWith('Basic Craze')) {
      const latestBasicValue = currentBasicPackageValue();
      if (packageSelect.value !== latestBasicValue) {
        packageSelect.value = latestBasicValue;
        applyBasicPricingUI();
        renderPackagePreview(latestBasicValue);
      }
    }

    const pkg = packageSelect?.value || '';
    if (!PACKAGE_INFO[pkg]) {
      if (packageChoiceError) packageChoiceError.textContent = 'Please choose a package first.';
      document.getElementById('bookingPackageSelector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      packageOptions[0]?.focus({ preventScroll: true });
      return;
    }

    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      return;
    }

    const name = customerName.value.trim();
    const rawDate = eventDate.value;
    const location = selectedAddress || eventLocation.value.trim();
    const [year, month, day] = rawDate.split('-');
    const dateText = `${day}/${month}/${year}`;
    const packageInfo = PACKAGE_INFO[pkg];
    const selected = packageInfo.addons ? getAddonSelection() : [];
    const extraCandies = selected.reduce((sum, item) => sum + item.candies, 0);
    const extraSnacks = selected.reduce((sum, item) => sum + item.snacks, 0);
    const addonTotal = selected.reduce((sum, item) => sum + item.price, 0);
    const totalPrice = packageInfo.price + addonTotal;
    const isBasicPromo = packageInfo.key === 'basic' && basicPromoActive();

    const message = [
      'Hi Candy Craze! I would like to enquire about an event booking.',
      '',
      `Name: ${name}`,
      `Package: ${pkg}`,
      ...(isBasicPromo ? ['Promo: Sep–Oct 2026 Basic Craze promo · normal RM95 · subject to booking confirmation by 31/10/2026'] : []),
      ...(packageInfo.addons ? [
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
})();
