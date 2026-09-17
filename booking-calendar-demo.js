(() => {
  const STORAGE_KEY = 'candyCrazeBookingCalendarDemoV1';
  const calendarGrid = document.getElementById('calendarGrid');
  const monthTitle = document.getElementById('monthTitle');
  const prevMonth = document.getElementById('prevMonth');
  const nextMonth = document.getElementById('nextMonth');
  const publicPanel = document.getElementById('publicPanel');
  const adminPanel = document.getElementById('adminPanel');
  const selectedPublic = document.getElementById('selectedPublic');
  const whatsappBtn = document.getElementById('whatsappBtn');
  const modeButtons = [...document.querySelectorAll('.mode-btn')];

  const bookingForm = document.getElementById('bookingForm');
  const adminDateTitle = document.getElementById('adminDateTitle');
  const statusInput = document.getElementById('bookingStatus');
  const customerName = document.getElementById('customerName');
  const customerPhone = document.getElementById('customerPhone');
  const packageInput = document.getElementById('bookingPackage');
  const startTime = document.getElementById('startTime');
  const endTime = document.getElementById('endTime');
  const locationInput = document.getElementById('bookingLocation');
  const depositStatus = document.getElementById('depositStatus');
  const remarksInput = document.getElementById('bookingRemarks');
  const clearBtn = document.getElementById('clearBtn');

  const now = new Date();
  let viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
  let mode = 'public';
  let selectedDateKey = null;

  const pad = (value) => String(value).padStart(2, '0');
  const keyFromDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const keyFromParts = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;
  const dateFromKey = (key) => {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const formatLong = (key) => dateFromKey(key).toLocaleDateString('en-MY', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
  const formatShort = (key) => dateFromKey(key).toLocaleDateString('en-MY', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  function getSeedData() {
    const y = now.getFullYear();
    const m = now.getMonth();
    return {
      [keyFromParts(y, m, Math.min(20, new Date(y, m + 1, 0).getDate()))]: {
        status: 'booked', customer: 'Aina', phone: '011-23456789', package: 'Popular Craze — RM260',
        startTime: '14:00', endTime: '18:00', location: 'Skudai, Johor', deposit: 'paid', remarks: 'Pink birthday theme'
      },
      [keyFromParts(y, m, Math.min(22, new Date(y, m + 1, 0).getDate()))]: {
        status: 'pending', customer: 'Sarah', phone: '012-34567890', package: 'Premium Craze — RM360',
        startTime: '18:00', endTime: '22:00', location: 'Johor Bahru', deposit: 'pending', remarks: 'Awaiting deposit confirmation'
      },
      [keyFromParts(y, m, Math.min(27, new Date(y, m + 1, 0).getDate()))]: {
        status: 'unavailable', customer: '', phone: '', package: '', startTime: '', endTime: '', location: '', deposit: 'not-paid', remarks: 'Owner unavailable'
      }
    };
  }

  function loadBookings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.warn('Could not read demo booking data', error);
    }
    const seeded = getSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  let bookings = loadBookings();

  function saveBookings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }

  function isPastDate(year, month, day) {
    const date = new Date(year, month, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return date < today;
  }

  function getStatusForDate(key, year, month, day) {
    if (isPastDate(year, month, day)) return 'past';
    return bookings[key]?.status || 'available';
  }

  function getStatusLabel(status) {
    if (status === 'past') return 'Past';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function renderCalendar() {
    calendarGrid.innerHTML = '';
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthTitle.textContent = viewDate.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });

    for (let i = 0; i < firstDay; i += 1) {
      const blank = document.createElement('div');
      blank.className = 'day-cell blank';
      calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = keyFromParts(year, month, day);
      const status = getStatusForDate(key, year, month, day);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = `day-cell ${status}${selectedDateKey === key ? ' selected' : ''}`;
      cell.dataset.date = key;
      cell.innerHTML = `<span class="day-number">${day}</span><span class="status-label">${getStatusLabel(status)}</span>`;
      cell.setAttribute('aria-label', `${formatLong(key)} - ${getStatusLabel(status)}`);

      if (status !== 'past') {
        cell.addEventListener('click', () => selectDate(key));
      } else {
        cell.disabled = true;
      }
      calendarGrid.appendChild(cell);
    }
  }

  function selectDate(key) {
    selectedDateKey = key;
    if (mode === 'admin') {
      populateAdminForm(key);
    } else {
      populatePublicPanel(key);
    }
    renderCalendar();
  }

  function populatePublicPanel(key) {
    const booking = bookings[key];
    const status = booking?.status || 'available';

    if (status === 'available') {
      selectedPublic.innerHTML = `<span>Selected date</span><strong>${formatLong(key)}</strong><small>This date is available for enquiry.</small>`;
      whatsappBtn.disabled = false;
      whatsappBtn.dataset.date = key;
    } else {
      selectedPublic.innerHTML = `<span>Selected date</span><strong>${formatLong(key)}</strong><small>This date is ${getStatusLabel(status).toLowerCase()}. Please choose another available date.</small>`;
      whatsappBtn.disabled = true;
      delete whatsappBtn.dataset.date;
    }
  }

  function populateAdminForm(key) {
    const booking = bookings[key] || { status: 'available', customer: '', phone: '', package: '', startTime: '', endTime: '', location: '', deposit: 'not-paid', remarks: '' };
    adminDateTitle.textContent = formatShort(key);
    statusInput.value = booking.status || 'available';
    customerName.value = booking.customer || '';
    customerPhone.value = booking.phone || '';
    packageInput.value = booking.package || '';
    startTime.value = booking.startTime || '';
    endTime.value = booking.endTime || '';
    locationInput.value = booking.location || '';
    depositStatus.value = booking.deposit || 'not-paid';
    remarksInput.value = booking.remarks || '';
  }

  function resetAdminForm() {
    adminDateTitle.textContent = 'Select a date';
    bookingForm.reset();
    statusInput.value = 'available';
    depositStatus.value = 'not-paid';
  }

  function setMode(nextMode) {
    mode = nextMode;
    modeButtons.forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
    publicPanel.classList.toggle('hidden', mode !== 'public');
    adminPanel.classList.toggle('hidden', mode !== 'admin');

    if (selectedDateKey) {
      if (mode === 'admin') populateAdminForm(selectedDateKey);
      else populatePublicPanel(selectedDateKey);
    } else if (mode === 'admin') {
      resetAdminForm();
    }
  }

  modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));

  prevMonth.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    selectedDateKey = null;
    resetAdminForm();
    selectedPublic.innerHTML = '<span>Selected date</span><strong>Choose a green date</strong><small>We will use this date in your WhatsApp enquiry.</small>';
    whatsappBtn.disabled = true;
    renderCalendar();
  });

  nextMonth.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    selectedDateKey = null;
    resetAdminForm();
    selectedPublic.innerHTML = '<span>Selected date</span><strong>Choose a green date</strong><small>We will use this date in your WhatsApp enquiry.</small>';
    whatsappBtn.disabled = true;
    renderCalendar();
  });

  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!selectedDateKey) {
      alert('Select a date first.');
      return;
    }

    if (statusInput.value === 'available') {
      delete bookings[selectedDateKey];
    } else {
      bookings[selectedDateKey] = {
        status: statusInput.value,
        customer: customerName.value.trim(),
        phone: customerPhone.value.trim(),
        package: packageInput.value,
        startTime: startTime.value,
        endTime: endTime.value,
        location: locationInput.value.trim(),
        deposit: depositStatus.value,
        remarks: remarksInput.value.trim()
      };
    }

    saveBookings();
    renderCalendar();
    adminDateTitle.textContent = `${formatShort(selectedDateKey)} · Saved`;
  });

  clearBtn.addEventListener('click', () => {
    if (!selectedDateKey) return;
    delete bookings[selectedDateKey];
    saveBookings();
    populateAdminForm(selectedDateKey);
    renderCalendar();
  });

  whatsappBtn.addEventListener('click', () => {
    const key = whatsappBtn.dataset.date;
    if (!key) return;
    const message = [
      'Hi Candy Craze! I would like to enquire about a candy wall booking.',
      '',
      `Event date: ${formatLong(key)}`,
      'Package: Not selected yet',
      'Location: ',
      '',
      'Please let me know if this date is still available. Thank you!'
    ].join('\n');
    window.open(`https://wa.me/601139376728?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });

  renderCalendar();
})();
