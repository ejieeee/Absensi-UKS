/**
 * Attendance Page Logic (attendance.js)
 * PMR Wira SMKN 7 Samarinda
 * Features: Live search, filter tabs, instant status toggles, QR scan simulator, batch actions
 */

let currentAttendanceState = [];

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PMR_DATA === 'undefined') return;

  initAttendanceData();
  renderAttendanceTable();
  updateAttendanceSummaryMetrics();
  initAttendanceFilters();
  initBatchActions();
  initQrScanner();
});

// Initialize working state from mockMembers
function initAttendanceData() {
  currentAttendanceState = PMR_DATA.members.map((member, index) => {
    // Generate realistic initial statuses for demonstration
    let initialStatus = 'Hadir';
    let note = 'Tepat waktu';
    let checkInTime = '13.45 WITA';

    if (index === 6) {
      initialStatus = 'Izin';
      note = 'Persiapan LKS DKV';
      checkInTime = '-';
    } else if (index === 10) {
      initialStatus = 'Sakit';
      note = 'Surat istirahat dokter';
      checkInTime = '-';
    } else if (index === 14) {
      initialStatus = 'Alpa';
      note = 'Tanpa konfirmasi';
      checkInTime = '-';
    } else if (index > 20) {
      initialStatus = 'Belum';
      note = '-';
      checkInTime = '-';
    }

    return {
      ...member,
      currentStatus: initialStatus,
      checkInTime: checkInTime,
      note: note
    };
  });
}

// Render Attendance Table
function renderAttendanceTable(filteredData = null) {
  const tbody = document.getElementById('attendanceTbody');
  if (!tbody) return;

  const data = filteredData || currentAttendanceState;

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-icon">
              <i class="bi bi-search"></i>
            </div>
            <div class="empty-state-title">Tidak ada data anggota ditemukan</div>
            <div class="empty-state-desc">Coba sesuaikan kata kunci pencarian atau ganti filter status di atas.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  data.forEach((item) => {
    const initials = item.name.split(' ').map(n => n[0]).slice(0, 2).join('');
    
    html += `
      <tr data-member-id="${item.id}">
        <td>
          <input type="checkbox" class="member-checkbox" value="${item.id}" aria-label="Pilih ${item.name}">
        </td>
        <td>
          <div class="recent-table-meta-user">
            <div class="user-mini-avatar">${initials}</div>
            <div class="user-text-wrap">
              <span class="user-name-cell">${item.name}</span>
              <span class="user-sub-cell">NISN: ${item.nisn} &bull; ${item.division}</span>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight: 600; color: var(--text-main);">${item.class}</span>
        </td>
        <td>
          <span class="badge-blood" title="Golongan Darah ${item.bloodType}">${item.bloodType}</span>
        </td>
        <td>
          <div class="attendance-toggle-group" data-id="${item.id}">
            <button type="button" class="att-btn ${item.currentStatus === 'Hadir' ? 'active-hadir' : ''}" onclick="setStatus('${item.id}', 'Hadir')">Hadir</button>
            <button type="button" class="att-btn ${item.currentStatus === 'Izin' ? 'active-izin' : ''}" onclick="setStatus('${item.id}', 'Izin')">Izin</button>
            <button type="button" class="att-btn ${item.currentStatus === 'Sakit' ? 'active-sakit' : ''}" onclick="setStatus('${item.id}', 'Sakit')">Sakit</button>
            <button type="button" class="att-btn ${item.currentStatus === 'Alpa' ? 'active-alpa' : ''}" onclick="setStatus('${item.id}', 'Alpa')">Alpa</button>
          </div>
        </td>
        <td>
          <span class="time-stamp-val" style="font-family: monospace; font-size: 0.8rem; color: var(--text-secondary);">${item.checkInTime}</span>
        </td>
        <td>
          <input type="text" class="form-control form-control-sm" style="font-size: 0.78rem; padding: 0.25rem 0.5rem; min-width: 140px;" value="${item.note}" onchange="updateNote('${item.id}', this.value)" placeholder="Keterangan...">
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Update status of a member
function setStatus(memberId, status) {
  const target = currentAttendanceState.find(m => m.id === memberId);
  if (!target) return;

  target.currentStatus = status;

  if (status === 'Hadir') {
    const now = new Date();
    target.checkInTime = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')} WITA`;
    if (target.note === '-' || target.note === 'Tanpa konfirmasi') target.note = 'Tepat waktu';
  } else if (status === 'Izin') {
    target.checkInTime = '-';
    if (target.note === 'Tepat waktu') target.note = 'Izin keperluan';
  } else if (status === 'Sakit') {
    target.checkInTime = '-';
    if (target.note === 'Tepat waktu') target.note = 'Surat istirahat';
  } else if (status === 'Alpa') {
    target.checkInTime = '-';
    target.note = 'Tanpa konfirmasi';
  }

  // Update DOM directly for smooth instant feel
  const row = document.querySelector(`tr[data-member-id="${memberId}"]`);
  if (row) {
    const group = row.querySelector('.attendance-toggle-group');
    if (group) {
      group.querySelectorAll('.att-btn').forEach(btn => {
        btn.classList.remove('active-hadir', 'active-izin', 'active-sakit', 'active-alpa');
      });
      if (status === 'Hadir') group.querySelector('button:nth-child(1)').classList.add('active-hadir');
      if (status === 'Izin') group.querySelector('button:nth-child(2)').classList.add('active-izin');
      if (status === 'Sakit') group.querySelector('button:nth-child(3)').classList.add('active-sakit');
      if (status === 'Alpa') group.querySelector('button:nth-child(4)').classList.add('active-alpa');
    }
    const timeEl = row.querySelector('.time-stamp-val');
    if (timeEl) timeEl.textContent = target.checkInTime;
  }

  updateAttendanceSummaryMetrics();
}

// Update note for a member
function updateNote(memberId, noteValue) {
  const target = currentAttendanceState.find(m => m.id === memberId);
  if (target) {
    target.note = noteValue;
  }
}

// Update Metric Counters in Real-Time
function updateAttendanceSummaryMetrics() {
  const total = currentAttendanceState.length;
  const hadir = currentAttendanceState.filter(m => m.currentStatus === 'Hadir').length;
  const izin = currentAttendanceState.filter(m => m.currentStatus === 'Izin').length;
  const sakit = currentAttendanceState.filter(m => m.currentStatus === 'Sakit').length;
  const alpa = currentAttendanceState.filter(m => m.currentStatus === 'Alpa').length;
  const belum = currentAttendanceState.filter(m => m.currentStatus === 'Belum').length;

  const countTotalEl = document.getElementById('countTotal');
  const countHadirEl = document.getElementById('countHadir');
  const countIzinEl = document.getElementById('countIzin');
  const countSakitEl = document.getElementById('countSakit');
  const countAlpaEl = document.getElementById('countAlpa');
  const countBelumEl = document.getElementById('countBelum');

  if (countTotalEl) countTotalEl.textContent = total;
  if (countHadirEl) countHadirEl.textContent = hadir;
  if (countIzinEl) countIzinEl.textContent = izin;
  if (countSakitEl) countSakitEl.textContent = sakit;
  if (countAlpaEl) countAlpaEl.textContent = alpa;
  if (countBelumEl) countBelumEl.textContent = belum;

  // Update tabs count badges
  const badgeAll = document.getElementById('tabCountAll');
  const badgeHadir = document.getElementById('tabCountHadir');
  const badgeIzin = document.getElementById('tabCountIzin');
  const badgeSakit = document.getElementById('tabCountSakit');
  const badgeAlpa = document.getElementById('tabCountAlpa');
  const badgeBelum = document.getElementById('tabCountBelum');

  if (badgeAll) badgeAll.textContent = total;
  if (badgeHadir) badgeHadir.textContent = hadir;
  if (badgeIzin) badgeIzin.textContent = izin;
  if (badgeSakit) badgeSakit.textContent = sakit;
  if (badgeAlpa) badgeAlpa.textContent = alpa;
  if (badgeBelum) badgeBelum.textContent = belum;
}

// Filter and Search logic
function initAttendanceFilters() {
  const searchInput = document.getElementById('attendanceSearchInput');
  const classFilter = document.getElementById('attendanceClassFilter');
  const tabBtns = document.querySelectorAll('[data-status-tab]');

  let activeTab = 'all';

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const classVal = classFilter ? classFilter.value : 'all';

    const filtered = currentAttendanceState.filter(item => {
      // Search matches name, NISN, division
      const matchesSearch = !query ||
        item.name.toLowerCase().includes(query) ||
        item.nisn.includes(query) ||
        item.division.toLowerCase().includes(query);

      // Class match
      let matchesClass = true;
      if (classVal !== 'all') {
        matchesClass = item.class.startsWith(classVal);
      }

      // Tab status match
      let matchesStatus = true;
      if (activeTab !== 'all') {
        matchesStatus = item.currentStatus.toLowerCase() === activeTab.toLowerCase();
      }

      return matchesSearch && matchesClass && matchesStatus;
    });

    renderAttendanceTable(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (classFilter) {
    classFilter.addEventListener('change', applyFilters);
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-status-tab');
      applyFilters();
    });
  });
}

// Batch Actions (Mark all present, save changes)
function initBatchActions() {
  const markAllBtn = document.getElementById('btnMarkAllPresent');
  const saveAllBtn = document.getElementById('btnSaveAttendance');
  const selectAllCheckbox = document.getElementById('selectAllMembers');

  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      currentAttendanceState.forEach(m => {
        if (m.currentStatus === 'Belum' || m.currentStatus === 'Alpa') {
          m.currentStatus = 'Hadir';
          m.checkInTime = '14.00 WITA';
          m.note = 'Presensi serentak';
        }
      });
      renderAttendanceTable();
      updateAttendanceSummaryMetrics();
      showToast('Presensi Masal', 'Seluruh anggota yang belum presensi telah ditandai Hadir.', 'success');
    });
  }

  if (saveAllBtn) {
    saveAllBtn.addEventListener('click', () => {
      showToast('Tersimpan', 'Data presensi sesi hari ini berhasil disimpan ke sistem arsip.', 'success');
    });
  }

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      document.querySelectorAll('.member-checkbox').forEach(cb => {
        cb.checked = isChecked;
      });
    });
  }
}

// QR Scanner Simulator
function initQrScanner() {
  const scanBtn = document.getElementById('btnTriggerScanSim');
  if (!scanBtn) return;

  scanBtn.addEventListener('click', () => {
    // Pick an unconfirmed member or Farhan
    const target = currentAttendanceState.find(m => m.currentStatus === 'Belum') || currentAttendanceState[0];
    setStatus(target.id, 'Hadir');
    closeModal('qrScannerModal');
    showToast('Scan Sukses!', `QR Code terdeteksi: ${target.name} (${target.class}) - Status: Hadir`, 'success');
  });
}

// Expose functions for inline HTML calls
window.setStatus = setStatus;
window.updateNote = updateNote;
