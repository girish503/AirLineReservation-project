(function () {
  const STORAGE_KEYS = {
    flights: 'ars_flights',
    reservations: 'ars_reservations',
  };

  const defaultFlights = [
    { id: 'FL-1001', from: 'NYC', to: 'LAX', depart: '08:30', arrive: '11:45', capacity: 120, price: 299 },
    { id: 'FL-1002', from: 'SFO', to: 'SEA', depart: '10:15', arrive: '12:00', capacity: 90, price: 159 },
    { id: 'FL-1003', from: 'DAL', to: 'MIA', depart: '14:00', arrive: '17:25', capacity: 110, price: 249 },
    { id: 'FL-1004', from: 'ORD', to: 'DEN', depart: '16:45', arrive: '18:30', capacity: 100, price: 199 },
  ];

  function loadFlights() {
    const raw = localStorage.getItem(STORAGE_KEYS.flights);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.flights, JSON.stringify(defaultFlights));
      return [...defaultFlights];
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Resetting corrupted flights storage');
      localStorage.setItem(STORAGE_KEYS.flights, JSON.stringify(defaultFlights));
      return [...defaultFlights];
    }
  }

  function saveFlights(flights) {
    localStorage.setItem(STORAGE_KEYS.flights, JSON.stringify(flights));
  }

  function loadReservations() {
    const raw = localStorage.getItem(STORAGE_KEYS.reservations);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Resetting corrupted reservations storage');
      localStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify([]));
      return [];
    }
  }

  function saveReservations(reservations) {
    localStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify(reservations));
  }

  function generateReservationCode() {
    const segment = () => Math.random().toString(36).substring(2, 5).toUpperCase();
    return `RSV-${segment()}${segment()}`;
  }

  // UI helpers
  function switchTab(name) {
    document.querySelectorAll('.tab').forEach((el) => el.classList.add('hidden'));
    document.getElementById(`tab-${name}`).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      if (btn.dataset.tab === name) {
        btn.classList.add('bg-slate-900', 'text-white');
      } else {
        btn.classList.remove('bg-slate-900', 'text-white');
      }
    });
  }

  function renderFlights() {
    const flights = loadFlights();
    const reservations = loadReservations();
    const reservedByFlight = reservations.reduce((acc, r) => {
      acc[r.flightId] = (acc[r.flightId] || 0) + r.seats;
      return acc;
    }, {});

    const list = document.getElementById('flights-list');
    list.innerHTML = '';

    flights.forEach((f) => {
      const remaining = Math.max(0, f.capacity - (reservedByFlight[f.id] || 0));
      const card = document.createElement('div');
      card.className = 'bg-white border rounded-lg p-4';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <div class="text-lg font-semibold">${f.id} · ${f.from} → ${f.to}</div>
            <div class="text-sm text-slate-600">Depart ${f.depart} · Arrive ${f.arrive}</div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold">$${f.price}</div>
            <div class="text-xs text-slate-500">Seats left: ${remaining}</div>
          </div>
        </div>
      `;
      list.appendChild(card);
    });

    // Also hydrate book select
    const select = document.getElementById('book-flight');
    select.innerHTML = flights
      .map((f) => `<option value="${f.id}">${f.id} · ${f.from} → ${f.to} (seats left: ${Math.max(0, f.capacity - (reservedByFlight[f.id] || 0))})</option>`) 
      .join('');
  }

  function renderReservations() {
    const reservations = loadReservations();
    const flights = loadFlights().reduce((acc, f) => {
      acc[f.id] = f;
      return acc;
    }, {});

    const container = document.getElementById('reservations-list');
    container.innerHTML = '';

    if (reservations.length === 0) {
      container.innerHTML = '<div class="text-slate-600">No reservations yet.</div>';
      return;
    }

    reservations
      .slice()
      .reverse()
      .forEach((r) => {
        const f = flights[r.flightId];
        const div = document.createElement('div');
        div.className = 'bg-white border rounded-lg p-4';
        div.innerHTML = `
          <div class="flex items-start justify-between">
            <div>
              <div class="font-semibold">${r.code}</div>
              <div class="text-sm text-slate-700">${r.firstName} ${r.lastName} · ${r.email}</div>
              <div class="text-sm text-slate-600">Flight ${r.flightId} · ${f ? `${f.from} → ${f.to}` : ''}</div>
            </div>
            <div class="text-right text-sm">
              <div>${r.seats} seat(s)</div>
              <div class="text-slate-500">Booked: ${new Date(r.createdAt).toLocaleString()}</div>
            </div>
          </div>
        `;
        container.appendChild(div);
      });
  }

  function handleBookingSubmit(event) {
    event.preventDefault();
    const flights = loadFlights();
    const reservations = loadReservations();

    const flightId = document.getElementById('book-flight').value;
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const seats = parseInt(document.getElementById('seats').value, 10) || 1;

    const flight = flights.find((f) => f.id === flightId);
    if (!flight) return alert('Flight not found');

    const reservedSeats = loadReservations()
      .filter((r) => r.flightId === flightId)
      .reduce((sum, r) => sum + r.seats, 0);
    const remaining = flight.capacity - reservedSeats;
    if (seats > remaining) {
      return alert(`Only ${remaining} seat(s) left on this flight`);
    }

    const reservation = {
      code: generateReservationCode(),
      flightId,
      firstName,
      lastName,
      email,
      phone,
      seats,
      createdAt: new Date().toISOString(),
    };

    reservations.push(reservation);
    saveReservations(reservations);
    renderFlights();
    renderReservations();

    event.target.reset();
    alert(`Booked successfully! Your code is ${reservation.code}`);
    switchTab('reservations');
  }

  function handleCancelSubmit(event) {
    event.preventDefault();
    const code = document.getElementById('cancel-code').value.trim().toUpperCase();
    if (!code) return;
    const reservations = loadReservations();
    const idx = reservations.findIndex((r) => r.code.toUpperCase() === code);
    if (idx === -1) {
      return alert('Reservation code not found');
    }
    reservations.splice(idx, 1);
    saveReservations(reservations);
    renderFlights();
    renderReservations();
    event.target.reset();
    alert('Reservation cancelled');
    switchTab('reservations');
  }

  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
  }

  function initForms() {
    const bookForm = document.getElementById('book-form');
    const cancelForm = document.getElementById('cancel-form');
    bookForm.addEventListener('submit', handleBookingSubmit);
    cancelForm.addEventListener('submit', handleCancelSubmit);
  }

  function init() {
    initTabs();
    renderFlights();
    renderReservations();
    initForms();
  }

  document.addEventListener('DOMContentLoaded', init);
})();