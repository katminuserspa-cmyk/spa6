/* =========================================================
   CALENDAR MODULE (VISUAL & PERFORMANCE ENTERPRISE EDITION)
   ========================================================= */

window.calendarBookingPayload = null;
window.calendarInstance = null;
let activePopover = null;

/* =========================================================
   RENDER
   ========================================================= */
export async function render(container) {
  try {
    auth.requireAuth();

    const currentUser = auth.getCurrentUser();
    const role = currentUser?.role;

    if (!permissions.can(role, 'manageCalendar')) {
      container.innerHTML = `
        <div class="card p-4 text-center">
          <h3 class="text-danger"><i class="fas fa-lock me-2"></i>Access Denied</h3>
          <p class="text-muted">You do not have permission to access the Calendar module.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="calendar-module-wrap">
        <!-- Top Stats Row -->
        <div class="calendar-top-stats" id="calendarStatsRow">
          <div class="cal-stat-card">
            <div class="cal-stat-icon" style="background:rgba(20,184,166,0.15); color:var(--color-primary);">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="cal-stat-info">
              <div class="stat-val" id="statTotal">0</div>
              <div class="stat-lbl">Today's Bookings</div>
            </div>
          </div>
          <div class="cal-stat-card">
            <div class="cal-stat-icon" style="background:rgba(239,68,68,0.15); color:#ef4444;">
              <i class="fas fa-clock"></i>
            </div>
            <div class="cal-stat-info">
              <div class="stat-val" id="statConfirmed">0</div>
              <div class="stat-lbl">Confirmed</div>
            </div>
          </div>
          <div class="cal-stat-card">
            <div class="cal-stat-icon" style="background:rgba(245,158,11,0.15); color:#f59e0b;">
              <i class="fas fa-hourglass-half"></i>
            </div>
            <div class="cal-stat-info">
              <div class="stat-val" id="statPending">0</div>
              <div class="stat-lbl">Pending</div>
            </div>
          </div>
          <div class="cal-stat-card">
            <div class="cal-stat-icon" style="background:rgba(16,185,129,0.15); color:#10b981;">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="cal-stat-info">
              <div class="stat-val" id="statCompleted">0</div>
              <div class="stat-lbl">Completed</div>
            </div>
          </div>
        </div>

        <!-- Filter & Action Header -->
        <div class="calendar-card-header">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div class="d-flex align-items-center gap-2">
              <h3 class="m-0" style="font-size:1.25rem; font-weight:700; color:var(--color-text-heading);">
                <i class="fas fa-calendar-alt me-2" style="color:var(--color-primary)"></i>Appointment Calendar
              </h3>
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2">
              <select id="staffFilter" class="f-select" style="min-width:140px;">
                <option value="">All Staff</option>
              </select>

              <select id="roomFilter" class="f-select" style="min-width:130px;">
                <option value="">All Rooms</option>
              </select>

              <select id="statusFilter" class="f-select" style="min-width:130px;">
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <button id="addBookingBtn" class="btn btn-primary btn-sm d-flex align-items-center gap-2">
                <i class="fas fa-plus"></i> New Booking
              </button>

              <button id="addCustomerBtn" class="btn btn-outline btn-sm d-flex align-items-center gap-2" style="border-color:var(--color-border-input); color:var(--color-text-primary);">
                <i class="fas fa-user-plus"></i> New Customer
              </button>
            </div>
          </div>
        </div>

        <!-- Visual Legend Bar -->
        <div class="calendar-legend-bar">
          <span style="font-weight:700; color:var(--color-text-heading);"><i class="fas fa-info-circle me-1"></i> Legend:</span>
          <div class="legend-item"><span class="legend-dot" style="background:#ef4444;"></span> Confirmed</div>
          <div class="legend-item"><span class="legend-dot" style="background:#f59e0b;"></span> Pending</div>
          <div class="legend-item"><span class="legend-dot" style="background:#10b981;"></span> Completed</div>
          <div class="legend-item"><span class="legend-dot" style="background:#06b6d4;"></span> Service / Other</div>
          <span class="ms-auto text-muted" style="font-size:0.8rem;"><i class="fas fa-hand-pointer me-1"></i> Click slot to book · Drag to reschedule</span>
        </div>

        <!-- Main Calendar Container -->
        <div id="calendarWrapper">
          <div id="calendar"></div>
        </div>
      </div>
    `;

    attachEventListeners(container);
    await loadCalendarFilters();
    initCalendar();

    // Listen for theme toggles to sync calendar
    window.removeEventListener('themeChanged', handleThemeChange);
    window.addEventListener('themeChanged', handleThemeChange);

  } catch (error) {
    console.error('Calendar render error:', error);
  }
}

function handleThemeChange() {
  if (window.calendarInstance) {
    window.calendarInstance.render();
  }
}

/* =========================================================
   LOAD FILTERS
   ========================================================= */
async function loadCalendarFilters() {
  try {
    const staff = await api.staff.getAll();
    const rooms = await api.services.getRooms();

    const staffSelect = document.getElementById('staffFilter');
    const roomSelect = document.getElementById('roomFilter');
    const statusSelect = document.getElementById('statusFilter');

    if (staffSelect && Array.isArray(staff)) {
      staffSelect.innerHTML =
        '<option value="">All Staff</option>' +
        staff.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

      staffSelect.addEventListener('change', () => {
        window.calendarInstance?.refetchEvents();
      });
    }

    if (roomSelect && Array.isArray(rooms)) {
      roomSelect.innerHTML =
        '<option value="">All Rooms</option>' +
        rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

      roomSelect.addEventListener('change', () => {
        window.calendarInstance?.refetchEvents();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', () => {
        window.calendarInstance?.refetchEvents();
      });
    }

  } catch (err) {
    console.error("Filter load error:", err);
  }
}

/* =========================================================
   INIT CALENDAR
   ========================================================= */
async function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  // Fetch working hours from settings
  let working_hours_start = '08:00';
  let working_hours_end = '22:00';
  try {
    const settings = await api.settings.get();
    if (settings && settings.salon) {
      if (settings.salon.working_hours_start) working_hours_start = settings.salon.working_hours_start;
      if (settings.salon.working_hours_end) working_hours_end = settings.salon.working_hours_end;
    }
  } catch (e) {
    // fallback to defaults
  }

  if (window.calendarInstance) {
    window.calendarInstance.destroy();
    window.calendarInstance = null;
  }

  window.calendarInstance = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridDay',
    selectable: true,
    editable: true,
    nowIndicator: true,
    height: 750,
    contentHeight: 720,
    expandRows: true,
    stickyHeaderDates: true,
    handleWindowResize: true,
    slotMinTime: working_hours_start,
    slotMaxTime: working_hours_end,
    slotDuration: '00:15:00',
    slotLabelInterval: '00:30:00',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day'
    },
    events: async (info, successCallback) => {
      try {
        const staffId = document.getElementById('staffFilter')?.value || '';
        const roomId = document.getElementById('roomFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        const params = new URLSearchParams({
          start: info.startStr.slice(0, 10),
          end: info.endStr.slice(0, 10)
        });
        if (staffId) params.append('staff_id', staffId);
        if (roomId) params.append('room_id', roomId);
        
        let events = await api.request(`/calendar/events?${params.toString()}`);

        if (statusFilter && Array.isArray(events)) {
          events = events.filter(e => (e.extendedProps?.status || e.status) === statusFilter);
        }

        updateTopStats(events);
        successCallback(events);
      } catch (err) {
        console.error('Calendar load error:', err);
        successCallback([]);
      }
    },
    eventClassNames: function(arg) {
      const status = (arg.event.extendedProps?.status || '').toLowerCase();
      if (status === 'confirmed') return ['event-status-confirmed'];
      if (status === 'pending') return ['event-status-pending'];
      if (status === 'completed') return ['event-status-completed'];
      return ['event-status-other'];
    },
    eventContent: function(arg) {
      const props = arg.event.extendedProps || {};
      const custName = arg.event.title || 'Client';
      const staffName = props.staff_name || props.staffName || '';
      const roomName = props.room_name || props.roomName || '';
      const serviceName = props.service_name || props.serviceName || '';
      const status = (props.status || 'confirmed').toUpperCase();

      const container = document.createElement('div');
      container.className = 'fc-custom-event';
      container.innerHTML = `
        <div class="event-cust"><i class="fas fa-user-circle me-1 opacity-75"></i>${custName}</div>
        <div class="event-meta">
          ${serviceName ? `<span class="fw-bold">${serviceName}</span>` : ''}
          ${staffName ? `<span class="event-badge"><i class="fas fa-user-tag me-1"></i>${staffName}</span>` : ''}
          ${roomName ? `<span class="event-badge"><i class="fas fa-door-open me-1"></i>${roomName}</span>` : ''}
        </div>
      `;
      return { domNodes: [container] };
    },
    eventMouseEnter: function(info) {
      showPopover(info.event, info.jsEvent);
    },
    eventMouseLeave: function() {
      removePopover();
    },
    eventDrop: async function (info) {
      removePopover();
      try {
        await api.request(`/calendar/events/${info.event.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            booking_date: info.event.startStr.slice(0, 10),
            start_time: info.event.startStr.slice(11, 16),
            end_time: info.event.endStr.slice(11, 16)
          })
        });
        if (window.utils?.showToast) utils.showToast("Booking rescheduled successfully", "success");
      } catch (err) {
        info.revert();
        if (window.utils?.showToast) utils.showToast("Failed to move booking", "error");
      }
    },
    eventResize: async function (info) {
      removePopover();
      try {
        await api.request(`/calendar/events/${info.event.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            booking_date: info.event.startStr.slice(0, 10),
            start_time: info.event.startStr.slice(11, 16),
            end_time: info.event.endStr.slice(11, 16)
          })
        });
        if (window.utils?.showToast) utils.showToast("Duration updated", "success");
      } catch (err) {
        info.revert();
        if (window.utils?.showToast) utils.showToast("Resize failed", "error");
      }
    },
    viewDidMount: function (info) {
      const wrapper = document.getElementById('calendarWrapper');
      if (wrapper) {
        wrapper.style.overflowY = info.view.type === 'dayGridMonth' ? 'hidden' : 'auto';
      }
    },
    dateClick(info) {
      openBookingFromCalendar(info.date);
    },
    select(info) {
      openBookingFromCalendar(info.start);
    },
    eventClick(info) {
      removePopover();
      openEventDetails(info.event);
    }
  });

  window.calendarInstance.render();
}

/* =========================================================
   TOP STATS UPDATE
   ========================================================= */
function updateTopStats(events) {
  if (!Array.isArray(events)) return;

  const total = events.length;
  let confirmed = 0;
  let pending = 0;
  let completed = 0;

  events.forEach(e => {
    const st = (e.extendedProps?.status || e.status || '').toLowerCase();
    if (st === 'confirmed') confirmed++;
    else if (st === 'pending') pending++;
    else if (st === 'completed') completed++;
  });

  const elTot = document.getElementById('statTotal');
  const elConf = document.getElementById('statConfirmed');
  const elPend = document.getElementById('statPending');
  const elComp = document.getElementById('statCompleted');

  if (elTot) elTot.textContent = total;
  if (elConf) elConf.textContent = confirmed;
  if (elPend) elPend.textContent = pending;
  if (elComp) elComp.textContent = completed;
}

/* =========================================================
   POPOVER HOVER CARD
   ========================================================= */
function showPopover(event, jsEvent) {
  removePopover();

  const props = event.extendedProps || {};
  const popover = document.createElement('div');
  popover.className = 'cal-popover';
  popover.id = 'calendarHoverPopover';

  const timeStr = event.start ? event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const endTimeStr = event.end ? event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const status = (props.status || 'Confirmed').toUpperCase();

  popover.innerHTML = `
    <div style="font-weight:700; font-size:0.95rem; color:var(--color-text-heading); margin-bottom:6px;">
      <i class="fas fa-user me-2" style="color:var(--color-primary)"></i>${event.title || 'Client'}
    </div>
    <div style="font-size:0.8rem; color:var(--color-text-secondary); display:flex; flex-direction:column; gap:4px;">
      <div><i class="far fa-clock me-1 text-muted"></i> ${timeStr} - ${endTimeStr}</div>
      ${props.service_name ? `<div><i class="fas fa-concierge-bell me-1 text-muted"></i> ${props.service_name}</div>` : ''}
      ${props.staff_name ? `<div><i class="fas fa-user-tag me-1 text-muted"></i> Staff: ${props.staff_name}</div>` : ''}
      ${props.room_name ? `<div><i class="fas fa-door-open me-1 text-muted"></i> Room: ${props.room_name}</div>` : ''}
      ${props.total_amount ? `<div><i class="fas fa-tag me-1 text-muted"></i> Amount: <strong>₹${props.total_amount}</strong></div>` : ''}
      <div style="margin-top:6px;"><span class="badge bg-primary">${status}</span></div>
    </div>
  `;

  document.body.appendChild(popover);

  const rect = jsEvent.target.getBoundingClientRect();
  popover.style.left = `${Math.min(rect.left, window.innerWidth - 280)}px`;
  popover.style.top = `${rect.top - popover.offsetHeight - 8 > 0 ? rect.top - popover.offsetHeight - 8 : rect.bottom + 8}px`;

  activePopover = popover;
}

function removePopover() {
  if (activePopover) {
    activePopover.remove();
    activePopover = null;
  }
}

/* =========================================================
   OPEN BOOKING
   ========================================================= */
function openBookingFromCalendar(date) {
  if (!(date instanceof Date)) return;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  window.calendarBookingPayload = {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };

  import('../bookings/bookings.js')
    .then(module => {
      window.__calendarContext = true;
      module.showBookingForm(null);
    })
    .catch(err => {
      console.error('Failed to load booking module:', err);
    });
}

/* =========================================================
   EVENT DETAILS MODAL
   ========================================================= */
function openEventDetails(event) {
  const b = event.extendedProps || {};

  const startStr = event.start ? event.start.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const endStr = event.end ? event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  const content = `
    <div style="padding:10px 0;">
      <div class="d-flex align-items-center justify-content-between pb-3 mb-3" style="border-bottom:1px solid var(--color-border-subtle);">
        <div>
          <h4 class="m-0" style="color:var(--color-text-heading); font-weight:700;">${event.title || 'Client'}</h4>
          <span class="text-muted" style="font-size:0.85rem;">Booking ID: #${event.id || 'N/A'}</span>
        </div>
        <span class="badge ${b.status === 'confirmed' ? 'bg-danger' : b.status === 'completed' ? 'bg-success' : 'bg-warning'}" style="font-size:0.85rem; padding:6px 12px;">
          ${(b.status || 'Confirmed').toUpperCase()}
        </span>
      </div>

      <div class="row g-3">
        <div class="col-6">
          <div class="p-3 rounded" style="background:var(--color-bg-card-hover); border:1px solid var(--color-border-card);">
            <div class="text-muted" style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">Time & Date</div>
            <div class="fw-bold mt-1" style="color:var(--color-text-primary);">${startStr} - ${endStr}</div>
          </div>
        </div>
        <div class="col-6">
          <div class="p-3 rounded" style="background:var(--color-bg-card-hover); border:1px solid var(--color-border-card);">
            <div class="text-muted" style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">Total Amount</div>
            <div class="fw-bold mt-1" style="color:var(--color-primary); font-size:1.1rem;">₹${b.total_amount || 0}</div>
          </div>
        </div>
        <div class="col-6">
          <div class="p-3 rounded" style="background:var(--color-bg-card-hover); border:1px solid var(--color-border-card);">
            <div class="text-muted" style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">Assigned Staff</div>
            <div class="fw-bold mt-1" style="color:var(--color-text-primary);">${b.staff_name || b.staffName || 'Unassigned'}</div>
          </div>
        </div>
        <div class="col-6">
          <div class="p-3 rounded" style="background:var(--color-bg-card-hover); border:1px solid var(--color-border-card);">
            <div class="text-muted" style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">Room / Chair</div>
            <div class="fw-bold mt-1" style="color:var(--color-text-primary);">${b.room_name || b.roomName || 'General'}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.appUtils?.showModal) {
    window.appUtils.showModal('Appointment Details', content);
  } else {
    alert(`Client: ${event.title}\nTime: ${startStr}\nStatus: ${b.status}`);
  }
}

/* =========================================================
   BUTTON EVENTS
   ========================================================= */
function attachEventListeners(container) {
  container.querySelector('#addBookingBtn')
    ?.addEventListener('click', () => {
      window.calendarBookingPayload = null;
      import('../bookings/bookings.js')
        .then(module => {
          window.__calendarContext = true;
          module.showBookingForm(null);
        });
    });

  container.querySelector('#addCustomerBtn')
    ?.addEventListener('click', () => {
      import('../customers/customers.js')
        .then(module => {
          window.__calendarContext = true;
          module.showCustomerForm(null);
        });
    });
}
