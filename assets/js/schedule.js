/**
 * Schedule & Duty Shifts Logic (schedule.js)
 * PMR Wira SMKN 7 Samarinda
 */

let scheduleActivities = [];
let currentScheduleView = 'calendar';
let currentCategoryFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PMR_DATA === 'undefined') return;

  scheduleActivities = [...PMR_DATA.activities];
  renderSchedule();
  initScheduleFilters();
  initNewScheduleForm();
});

function renderSchedule() {
  const calendarContainer = document.getElementById('calendarViewContainer');
  const listContainer = document.getElementById('listViewContainer');

  if (currentScheduleView === 'calendar') {
    if (calendarContainer) calendarContainer.style.display = 'grid';
    if (listContainer) listContainer.style.display = 'none';
    renderCalendarGrid();
  } else {
    if (calendarContainer) calendarContainer.style.display = 'none';
    if (listContainer) listContainer.style.display = 'flex';
    renderListView();
  }
}

// Render Calendar Grid (Senin - Jumat)
function renderCalendarGrid() {
  const container = document.getElementById('calendarViewContainer');
  if (!container) return;

  const daysData = [
    { name: 'Senin', date: '5 Okt 2026', acts: [] },
    { name: 'Selasa', date: '6 Okt 2026', acts: [] },
    { name: 'Rabu', date: '7 Okt 2026', acts: [] },
    { name: 'Kamis', date: '8 Okt 2026', acts: [] },
    { name: 'Jumat', date: '9 Okt 2026', acts: [] }
  ];

  // Distribute activities to days
  scheduleActivities.forEach(act => {
    if (currentCategoryFilter !== 'all' && act.type !== currentCategoryFilter) return;

    if (act.id === 'ACT-01' || act.id === 'ACT-02') {
      daysData[4].acts.push(act); // Friday (Today)
    } else if (act.id === 'ACT-03') {
      daysData[4].acts.push(act); // Friday afternoon
    } else if (act.id === 'ACT-04') {
      daysData[0].acts.push(act); // Next Monday
    } else {
      daysData[2].acts.push(act); // Wednesday
    }
  });

  let html = '';
  daysData.forEach((day, index) => {
    const isToday = index === 4;
    html += `
      <div class="calendar-day-col">
        <div class="calendar-day-header" style="${isToday ? 'background-color: var(--pmr-red-50); border-bottom: 2px solid var(--pmr-red-600);' : ''}">
          <div class="calendar-day-name" style="${isToday ? 'color: var(--pmr-red-700);' : ''}">
            ${day.name} ${isToday ? '<span class="badge badge-hadir" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">Hari Ini</span>' : ''}
          </div>
          <div class="calendar-day-date">${day.date}</div>
        </div>
        <div class="calendar-day-events">
    `;

    if (day.acts.length === 0) {
      html += `
        <div style="font-size: 0.72rem; color: var(--text-muted); text-align: center; padding: 1.5rem 0.5rem; font-style: italic;">
          Tidak ada jadwal khusus
        </div>
      `;
    } else {
      day.acts.forEach(act => {
        let catClass = 'category-piket';
        if (act.type === 'latihan') catClass = 'category-latihan';
        if (act.type === 'sosial') catClass = 'category-sosial';

        html += `
          <div class="calendar-event-card" onclick="viewActivityDetail('${act.id}')">
            <span class="activity-badge-category ${catClass}" style="width: fit-content;">${act.category}</span>
            <strong style="color: var(--text-main); font-size: 0.78rem;">${act.title}</strong>
            <div class="calendar-event-time">
              <i class="bi bi-clock"></i> ${act.time}
            </div>
            <div style="font-size: 0.68rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.25rem;">
              <i class="bi bi-person"></i> ${act.dutyOfficers[0]}${act.dutyOfficers.length > 1 ? ` +${act.dutyOfficers.length - 1}` : ''}
            </div>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Render List View
function renderListView() {
  const container = document.getElementById('listViewContainer');
  if (!container) return;

  const filtered = scheduleActivities.filter(act => {
    return currentCategoryFilter === 'all' || act.type === currentCategoryFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="width: 100%; background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <div class="empty-state-icon"><i class="bi bi-calendar-x"></i></div>
        <div class="empty-state-title">Tidak ada agenda pada kategori ini</div>
        <div class="empty-state-desc">Pilih filter kategori lain atau buat jadwal kegiatan baru.</div>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(act => {
    let catClass = 'category-piket';
    if (act.type === 'latihan') catClass = 'category-latihan';
    if (act.type === 'sosial') catClass = 'category-sosial';

    html += `
      <div class="card" style="margin-bottom: 1rem;">
        <div class="card-header">
          <div class="card-title-group">
            <span class="activity-badge-category ${catClass}">${act.category}</span>
            <h3 class="card-title" style="font-size: 1.05rem;">${act.title}</h3>
          </div>
          <span class="badge ${act.status === 'Berlangsung' ? 'badge-hadir' : act.status === 'Selesai' ? 'badge-neutral' : 'badge-izin'}">
            ${act.status}
          </span>
        </div>
        <div class="card-body">
          <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 1rem;">${act.description}</p>
          <div class="activity-meta-row" style="font-size: 0.8rem;">
            <div class="activity-meta-item">
              <i class="bi bi-calendar-event"></i>
              <span>${act.date}</span>
            </div>
            <div class="activity-meta-item">
              <i class="bi bi-clock"></i>
              <span>${act.time}</span>
            </div>
            <div class="activity-meta-item">
              <i class="bi bi-geo-alt"></i>
              <span>${act.location}</span>
            </div>
          </div>
          <div style="margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: gap;">
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              Petugas Jaga: <strong style="color: var(--text-main);">${act.dutyOfficers.join(', ')}</strong>
            </div>
            <button type="button" class="btn btn-outline btn-sm" onclick="viewActivityDetail('${act.id}')">
              <i class="bi bi-eye"></i> Detail Sesi
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Filter and View Mode Handlers
function initScheduleFilters() {
  const viewToggleBtns = document.querySelectorAll('[data-schedule-view]');
  const categoryFilterSelect = document.getElementById('categoryFilterSelect');

  viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewToggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentScheduleView = btn.getAttribute('data-schedule-view');
      renderSchedule();
    });
  });

  if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener('change', (e) => {
      currentCategoryFilter = e.target.value;
      renderSchedule();
    });
  }
}

// Activity Detail Modal Viewer
function viewActivityDetail(actId) {
  const act = scheduleActivities.find(a => a.id === actId);
  if (!act) return;

  const titleEl = document.getElementById('detailModalTitle');
  const categoryEl = document.getElementById('detailModalCategory');
  const timeEl = document.getElementById('detailModalTime');
  const locEl = document.getElementById('detailModalLocation');
  const officersEl = document.getElementById('detailModalOfficers');
  const descEl = document.getElementById('detailModalDesc');

  if (titleEl) titleEl.textContent = act.title;
  if (categoryEl) categoryEl.textContent = act.category;
  if (timeEl) timeEl.textContent = `${act.date} &bull; ${act.time}`;
  if (locEl) locEl.textContent = act.location;
  if (officersEl) officersEl.textContent = act.dutyOfficers.join(', ');
  if (descEl) descEl.textContent = act.description;

  openModal('activityDetailModal');
}

// New Schedule Interactive Form
function initNewScheduleForm() {
  const form = document.getElementById('newScheduleForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('newActTitle').value;
    const category = document.getElementById('newActCategory').value;
    const date = document.getElementById('newActDate').value;
    const time = document.getElementById('newActTime').value;
    const location = document.getElementById('newActLocation').value;
    const officers = document.getElementById('newActOfficers').value;
    const desc = document.getElementById('newActDesc').value;

    const newActivity = {
      id: `ACT-${Date.now().toString().slice(-3)}`,
      title: title,
      type: category.toLowerCase().includes('piket') ? 'piket' : category.toLowerCase().includes('latihan') ? 'latihan' : 'sosial',
      category: category,
      date: date,
      time: time,
      location: location,
      dutyOfficers: officers.split(',').map(s => s.trim()),
      status: 'Mendatang',
      description: desc || 'Sesi kegiatan PMR SMKN 7 Samarinda'
    };

    scheduleActivities.unshift(newActivity);
    renderSchedule();
    closeModal('newScheduleModal');
    form.reset();

    showToast('Jadwal Dibuat', `Jadwal "${title}" berhasil ditambahkan ke kalender kegiatan.`, 'success');
  });
}

window.viewActivityDetail = viewActivityDetail;
