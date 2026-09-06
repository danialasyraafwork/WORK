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

const PACKAGE_INFO = {
  'Basic Craze — RM80': { price: 80, candies: 0, snacks: 0, addons: false },
  'Standard Craze — RM110': { price: 110, candies: 0, snacks: 0, addons: false },
  'Popular Craze — RM260': { price: 260, candies: 6, snacks: 3, addons: true },
  'Premium Craze — RM360': { price: 360, candies: 9, snacks: 3, addons: true }
};

const ADDON_INFO = {
  candy3: { label: '+3 Random Candies', price: 95, candies: 3, snacks: 0 },
  candy6: { label: '+6 Random Candies', price: 180, candies: 6, snacks: 0 },
  snack3: { label: '+3 Random Snacks', price: 55, candies: 0, snacks: 3 }
};

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

// Add-on experience: only Popular Craze and Premium Craze can add extra treats.
const addonStyle = document.createElement('style');
addonStyle.textContent = `
  .addons { background: #f0e2d9; }
  .addons .section-heading { max-width: 760px; }
  .addon-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .addon-card { position: relative; min-height: 250px; padding: 28px; border: 1px solid var(--line); border-radius: 26px; background: rgba(255,250,246,.72); box-shadow: 0 12px 40px rgba(67,42,34,.05); }
  .addon-card h3 { margin: 34px 0 8px; font-family: "Playfair Display", serif; font-size: 28px; }
  .addon-card p { margin: 0; color: var(--muted); font-size: 14px; }
  .addon-price { display: inline-flex; align-items: baseline; gap: 3px; font-family: "Playfair Display", serif; font-size: 38px; font-weight: 700; line-height: 1; }
  .addon-price small { font-family: "DM Sans", sans-serif; font-size: 11px; }
  .addon-badge { display: inline-flex; margin-top: 18px; padding: 7px 11px; border-radius: 999px; background: var(--ink); color: #fff; font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
  .addon-note { margin-top: 22px; padding: 18px 20px; border: 1px solid var(--line); border-radius: 18px; background: rgba(255,250,246,.45); color: var(--muted); font-size: 13px; }
  .addon-available-note { margin: 12px 0 0; color: var(--caramel-deep); font-size: 11px; font-weight: 800; text-align: center; text-transform: uppercase; letter-spacing: .06em; }
  .package-card.premium .addon-available-note { color: #f0c9b6; }
  .booking-addons { display: grid; gap: 14px; padding: 18px; border: 1px solid rgba(255,255,255,.15); border-radius: 18px; background: rgba(255,255,255,.06); }
  .booking-addons[hidden] { display: none; }
  .booking-addons-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .booking-addons-head strong { font-family: "Playfair Display", serif; font-size: 21px; }
  .booking-addons-head span { padding: 5px 9px; border-radius: 999px; background: rgba(255,255,255,.12); color: #f2dfd7; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; }
  .booking-addons > p { margin: -5px 0 0; color: #cdbdb6; font-size: 11px; }
  .addon-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .addon-summary { padding: 12px 14px; border-radius: 14px; background: rgba(255,255,255,.09); color: #f4e8e3; font-size: 12px; line-height: 1.55; }
  .addon-summary strong { color: #fff; }
  @media (max-width: 760px) {
    .addon-grid, .addon-form-row { grid-template-columns: 1fr; }
    .addon-card { min-height: auto; }
  }
`;
document.head.appendChild(addonStyle);

const packagesSection = document.getElementById('packages');
let candyAddonSelect = null;
let snackAddonSelect = null;
let addonPanel = null;
let addonSummary = null;

if (packagesSection && !document.getElementById('addons')) {
  const addonSection = document.createElement('section');
  addonSection.className = 'addons section-pad';
  addonSection.id = 'addons';
  addonSection.innerHTML = `
    <div class="shell">
      <div class="section-heading reveal">
        <span class="eyebrow">Popular & Premium only</span>
        <h2>Need more treats?</h2>
        <p>Add extra random candies or snacks to Popular Craze or Premium Craze. Basic and Standard remain setup-only packages.</p>
      </div>
      <div class="addon-grid">
        <article class="addon-card reveal">
          <div class="addon-price"><small>RM</small>95</div>
          <h3>+3 Random Candies</h3>
          <p>A small top-up when you want a little more variety on the candy wall.</p>
          <span class="addon-badge">Popular & Premium</span>
        </article>
        <article class="addon-card reveal">
          <div class="addon-price"><small>RM</small>180</div>
          <h3>+6 Random Candies</h3>
          <p>A bigger candy top-up for larger events or guests with a serious sweet tooth.</p>
          <span class="addon-badge">Popular & Premium</span>
        </article>
        <article class="addon-card reveal">
          <div class="addon-price"><small>RM</small>55</div>
          <h3>+3 Random Snacks</h3>
          <p>Add three more snack selections while keeping the package simple and easy to prepare.</p>
          <span class="addon-badge">Popular & Premium</span>
        </article>
      </div>
      <p class="addon-note reveal"><strong>Random selection:</strong> add-on candy and snack types are selected by Candy Craze based on available stock. Customers choose the quantity bundle, not the individual brands.</p>
    </div>
  `;
  packagesSection.insertAdjacentElement('afterend', addonSection);
  addonSection.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  if (navLinks && !navLinks.querySelector('a[href="#addons"]')) {
    const addonNav = document.createElement('a');
    addonNav.href = '#addons';
    addonNav.textContent = 'Add-ons';
    const faqLink = navLinks.querySelector('a[href="#faq"]');
    navLinks.insertBefore(addonNav, faqLink || navLinks.lastElementChild);
    addonNav.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  }
}

document.querySelectorAll('.select-package').forEach((button) => {
  const pkg = button.dataset.package || '';
  if (PACKAGE_INFO[pkg]?.addons && !button.parentElement.querySelector('.addon-available-note')) {
    const note = document.createElement('p');
    note.className = 'addon-available-note';
    note.textContent = 'Add-ons available';
    button.insertAdjacentElement('afterend', note);
  }
});

if (packageSelect && bookingForm) {
  const packageLabel = packageSelect.closest('label');
  if (packageLabel && !document.getElementById('bookingAddons')) {
    addonPanel = document.createElement('div');
    addonPanel.id = 'bookingAddons';
    addonPanel.className = 'booking-addons';
    addonPanel.hidden = true;
    addonPanel.innerHTML = `
      <div class="booking-addons-head">
        <strong>Add extra treats</strong>
        <span>Popular & Premium only</span>
      </div>
      <p>Candy and snack selections remain random and are subject to availability.</p>
      <div class="addon-form-row">
        <label>
          Extra candies
          <select id="candyAddon">
            <option value="">No extra candies</option>
            <option value="candy3">+3 Random Candies — RM95</option>
            <option value="candy6">+6 Random Candies — RM180</option>
          </select>
        </label>
        <label>
          Extra snacks
          <select id="snackAddon">
            <option value="">No extra snacks</option>
            <option value="snack3">+3 Random Snacks — RM55</option>
          </select>
        </label>
      </div>
      <div class="addon-summary" id="addonSummary"></div>
    `;
    packageLabel.insertAdjacentElement('afterend', addonPanel);
    candyAddonSelect = document.getElementById('candyAddon');
    snackAddonSelect = document.getElementById('snackAddon');
    addonSummary = document.getElementById('addonSummary');
  }
}

function getAddonSelection() {
  const selections = [];
  if (candyAddonSelect?.value && ADDON_INFO[candyAddonSelect.value]) selections.push(ADDON_INFO[candyAddonSelect.value]);
  if (snackAddonSelect?.value && ADDON_INFO[snackAddonSelect.value]) selections.push(ADDON_INFO[snackAddonSelect.value]);
  return selections;
}

function updateAddonSummary() {
  if (!packageSelect || !addonPanel) return;

  const info = PACKAGE_INFO[packageSelect.value];
  const eligible = Boolean(info?.addons);
  addonPanel.hidden = !eligible;

  if (!eligible) {
    if (candyAddonSelect) candyAddonSelect.value = '';
    if (snackAddonSelect) snackAddonSelect.value = '';
    return;
  }

  const selections = getAddonSelection();
  const extraCandies = selections.reduce((sum, item) => sum + item.candies, 0);
  const extraSnacks = selections.reduce((sum, item) => sum + item.snacks, 0);
  const addonPrice = selections.reduce((sum, item) => sum + item.price, 0);
  const totalCandies = info.candies + extraCandies;
  const totalSnacks = info.snacks + extraSnacks;
  const totalPrice = info.price + addonPrice;
  const addonText = selections.length ? selections.map((item) => item.label).join(' + ') : 'No add-ons selected';

  if (addonSummary) {
    addonSummary.innerHTML = `<strong>${addonText}</strong><br>Final treats: ${totalCandies} candies + ${totalSnacks} snacks · Estimated total: RM${totalPrice}`;
  }
}

packageSelect?.addEventListener('change', updateAddonSummary);
candyAddonSelect?.addEventListener('change', updateAddonSummary);
snackAddonSelect?.addEventListener('change', updateAddonSummary);
updateAddonSummary();

const accordion = document.querySelector('.accordion');
if (accordion && !Array.from(accordion.querySelectorAll('summary')).some((summary) => summary.textContent.trim() === 'Can I choose the add-on candies or snacks?')) {
  const detail = document.createElement('details');
  detail.innerHTML = `
    <summary>Can I choose the add-on candies or snacks?</summary>
    <p>No. Add-ons are available only with Popular Craze and Premium Craze, and the candy/snack selections are random based on available stock. You choose the quantity bundle only.</p>
  `;
  accordion.appendChild(detail);
}

const faqItems = document.querySelectorAll('.accordion details');
faqItems.forEach((item) => {
  const summary = item.querySelector('summary');
  const answer = item.querySelector('p');
  if (summary?.textContent.trim() === 'How do I book?' && answer) {
    answer.textContent = 'Choose your package, add extra treats if you select Popular or Premium, fill in all required event details, then tap “Send via WhatsApp”. Your enquiry will open in WhatsApp ready to send.';
  }
});

document.querySelectorAll('.select-package').forEach((button) => {
  button.addEventListener('click', () => {
    if (packageSelect) {
      packageSelect.value = button.dataset.package || '';
      updateAddonSummary();
    }
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
  const packageInfo = PACKAGE_INFO[pkg];
  const selections = packageInfo?.addons ? getAddonSelection() : [];
  const extraCandies = selections.reduce((sum, item) => sum + item.candies, 0);
  const extraSnacks = selections.reduce((sum, item) => sum + item.snacks, 0);
  const addonPrice = selections.reduce((sum, item) => sum + item.price, 0);
  const estimatedTotal = (packageInfo?.price || 0) + addonPrice;

  const message = [
    'Hi Candy Craze! I would like to enquire about an event booking.',
    '',
    `Name: ${name}`,
    `Package: ${pkg}`,
    ...(packageInfo?.addons ? [
      `Add-ons: ${selections.length ? selections.map((item) => `${item.label} — RM${item.price}`).join(', ') : 'None'}`,
      `Treat total: ${packageInfo.candies + extraCandies} candies + ${packageInfo.snacks + extraSnacks} snacks`
    ] : []),
    `Estimated total: RM${estimatedTotal}`,
    `Event date: ${dateText}`,
    `Event location: ${location}`,
    '',
    'I understand that free delivery is available within 10km.',
    'Candy and snack selections for Popular/Premium and their add-ons are random and subject to availability.',
    '',
    'Can you please help me check the availability? Thank you!'
  ].join('\n');

  if (formStatus) formStatus.textContent = 'Opening WhatsApp…';

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.location.href = whatsappUrl;
});

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
