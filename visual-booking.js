(() => {
  const packageInput = document.getElementById('packageSelect');
  const selector = document.getElementById('bookingPackageSelector');
  const options = Array.from(document.querySelectorAll('.booking-package-option'));
  const preview = document.getElementById('bookingPackagePreview');
  const previewPhoto = document.getElementById('bookingPreviewPhoto');
  const previewName = document.getElementById('bookingPreviewName');
  const previewPrice = document.getElementById('bookingPreviewPrice');
  const previewSummary = document.getElementById('bookingPreviewSummary');
  const previewTags = document.getElementById('bookingPreviewTags');
  const choiceError = document.getElementById('packageChoiceError');
  const form = document.getElementById('bookingForm');

  const PACKAGE_VISUALS = {
    'Basic Craze — RM80': {
      key: 'basic', name: 'Basic Craze', price: 'RM80',
      summary: 'A clean candy wall setup with 9 boxes. Candies and snacks are not included.',
      tags: ['Candy wall + 9 boxes', 'Setup only', '50 paper cups', 'Free installation']
    },
    'Standard Craze — RM110': {
      key: 'standard', name: 'Standard Craze', price: 'RM110',
      summary: 'The setup-only option with an added 3-tier rack for extra display space.',
      tags: ['Candy wall + 9 boxes', '3-tier rack', 'Setup only', 'Free installation']
    },
    'Popular Craze — RM260': {
      key: 'popular', name: 'Popular Craze', price: 'RM260',
      summary: 'A ready-filled candy wall with 6 random candies and 3 random snacks.',
      tags: ['6 random candies', '3 random snacks', '50 paper cups', 'Add-ons available']
    },
    'Premium Craze — RM360': {
      key: 'premium', name: 'Premium Craze', price: 'RM360',
      summary: 'The fullest setup with a 3-tier rack, 9 random candies and 3 random snacks.',
      tags: ['9 random candies', '3 random snacks', '3-tier rack', 'Add-ons available']
    }
  };

  function renderSelection(value, emitChange = true) {
    const info = PACKAGE_VISUALS[value];
    if (!info || !packageInput) return;

    packageInput.value = value;
    options.forEach((button) => {
      const selected = button.dataset.package === value;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    if (preview && previewPhoto && previewName && previewPrice && previewSummary && previewTags) {
      preview.hidden = false;
      previewPhoto.className = `package-photo booking-preview-photo ${info.key}-photo`;
      previewPhoto.setAttribute('aria-label', `${info.name} package preview`);
      previewName.textContent = info.name;
      previewPrice.textContent = info.price;
      previewSummary.textContent = info.summary;
      previewTags.replaceChildren(...info.tags.map((tag) => {
        const el = document.createElement('span');
        el.textContent = tag;
        return el;
      }));
    }

    if (choiceError) choiceError.textContent = '';
    if (emitChange) packageInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  options.forEach((button) => {
    button.addEventListener('click', () => renderSelection(button.dataset.package || ''));
  });

  // Keep the visual selector in sync when a package is chosen from the package cards above.
  document.querySelectorAll('.select-package').forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.package || '';
      if (PACKAGE_VISUALS[value]) renderSelection(value);
    });
  });

  // Guard the legacy WhatsApp submit handler: a visual package selection is mandatory.
  form?.addEventListener('submit', (event) => {
    if (!packageInput?.value || !PACKAGE_VISUALS[packageInput.value]) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (choiceError) choiceError.textContent = 'Please choose a package first.';
      selector?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      options[0]?.focus({ preventScroll: true });
    }
  });

  if (packageInput?.value && PACKAGE_VISUALS[packageInput.value]) {
    renderSelection(packageInput.value, false);
  }
})();
