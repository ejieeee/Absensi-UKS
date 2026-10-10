/**
 * Attendance History Logic (history.js)
 * PMR Wira SMKN 7 Samarinda
 */

let historyRecords = [];

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PMR_DATA === 'undefined') return;

  generateMockHistory();
  renderHistoryTable();
  initHistoryFilters();
});

// Generate realistic multi-day records
function generateMockHistory() {
  const dates = ['2026-10-09', '2026-10-08', '2026-10-07', '2026-10-06', '2026-10-05'];
  const sessions = ['Piket UKS Siang', 'Piket UKS Pagi', 'Latihan Rutin PP', 'Apel Kesiapsiagaan'];
  const methods = ['QR Code Scan', 'NFC / Kartu Anggota', 'Manual Petugas'];

  historyRecords = [];

  // Seed with recent attendance logs
  PMR_DATA.recentAttendanceLogs.forEach((log, idx) => {
    historyRecords.push({
      id: `HIST-${1000 + idx}`,
      date: '2026-10-09',
      time: log.time,
      memberId: log.memberId,
      name: log.name,
      class: log.class,
      session: log.session,
      status: log.status,
      method: log.method,
      note: log.note
    });
  });

  // Add more historical items across previous days
  PMR_DATA.members.forEach((m, idx) => {
    if (idx % 2 === 0) {
      historyRecords.push({
        id: `HIST-${2000 + idx}`,
        date: dates[(idx % 4) + 1],
        time: `${String(7 + (idx % 8)).padStart(2, '0')}.${String(10 + (idx * 3) % 45).padStart(2, '0')} WITA`,
        memberId: m.id,
        name: m.name,
        class: m.class,
        session: sessions[idx % sessions.length],
        status: (idx % 7 === 0) ? 'Izin' : (idx % 9 === 0) ? 'Sakit' : 'Hadir',
        method: methods[idx % methods.length],
        note: (idx % 7 === 0) ? 'Izin dispensasi' : (idx % 9 === 0) ? 'Surat istirahat' : 'Tepat waktu'
      });
    }
  });
}

function renderHistoryTable(data = null) {
  const tbody = document.getElementById('historyTbody');
  const countEl = document.getElementById('historyResultCount');
  if (!tbody) return;

  const dataset = data || historyRecords;

  if (countEl) countEl.textContent = dataset.length;

  if (dataset.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-calendar-x"></i></div>
            <div class="empty-state-title">Tidak ada riwayat presensi yang cocok</div>
            <div class="empty-state-desc">Sesuaikan rentang tanggal atau bersihkan kata kunci pencarian.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  dataset.forEach(item => {
    const initials = item.name.split(' ').map(n => n[0]).slice(0, 2).join('');
    let badgeClass = 'badge-hadir';
    if (item.status === 'Izin') badgeClass = 'badge-izin';
    if (item.status === 'Sakit') badgeClass = 'badge-sakit';
    if (item.status === 'Alpa') badgeClass = 'badge-alpa';

    html += `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 0.82rem;">${item.date}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${item.time}</div>
        </td>
        <td>
          <div class="recent-table-meta-user">
            <div class="user-mini-avatar">${initials}</div>
            <div class="user-text-wrap">
              <span class="user-name-cell">${item.name}</span>
              <span class="user-sub-cell">${item.class} &bull; ${item.memberId}</span>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight: 600; color: var(--text-secondary); font-size: 0.82rem;">${item.session}</span>
        </td>
        <td>
          <span class="badge ${badgeClass}">${item.status}</span>
        </td>
        <td>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${item.method}</span>
        </td>
        <td>
          <span style="font-size: 0.78rem; color: var(--text-secondary);">${item.note}</span>
        </td>
        <td>
          <button type="button" class="btn btn-outline btn-sm" onclick="showHistoryDetail('${item.id}')" title="Lihat Detail Log">
            <i class="bi bi-eye"></i> Detail
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function initHistoryFilters() {
  const searchInput = document.getElementById('historySearchInput');
  const statusSelect = document.getElementById('historyStatusFilter');
  const sessionSelect = document.getElementById('historySessionFilter');
  const btnReset = document.getElementById('btnResetFilter');

  function applyFilter() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const statusVal = statusSelect ? statusSelect.value : 'all';
    const sessionVal = sessionSelect ? sessionSelect.value : 'all';

    const filtered = historyRecords.filter(item => {
      const matchSearch = !query ||
        item.name.toLowerCase().includes(query) ||
        item.class.toLowerCase().includes(query) ||
        item.memberId.toLowerCase().includes(query);

      const matchStatus = statusVal === 'all' || item.status.toLowerCase() === statusVal.toLowerCase();
      const matchSession = sessionVal === 'all' || item.session.toLowerCase().includes(sessionVal.toLowerCase());

      return matchSearch && matchStatus && matchSession;
    });

    renderHistoryTable(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilter);
  if (statusSelect) statusSelect.addEventListener('change', applyFilter);
  if (sessionSelect) sessionSelect.addEventListener('change', applyFilter);

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (statusSelect) statusSelect.value = 'all';
      if (sessionSelect) sessionSelect.value = 'all';
      renderHistoryTable();
    });
  }
}

function showHistoryDetail(histId) {
  const item = historyRecords.find(h => h.id === histId);
  if (!item) return;

  const bodyEl = document.getElementById('historyDetailModalBody');
  if (!bodyEl) return;

  bodyEl.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1rem; font-size: 0.85rem;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background-color: var(--bg-surface-subtle); padding: 1rem; border-radius: var(--radius-md);">
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">ID Catatan</span>
          <div style="font-weight: 700; color: var(--text-main); font-family: monospace;">${item.id}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Status Verifikasi</span>
          <div style="font-weight: 700; color: #16a34a;"><i class="bi bi-patch-check-fill"></i> Terverifikasi Sah</div>
        </div>
      </div>

      <div>
        <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Nama Lengkap Siswa</span>
        <div style="font-weight: 700; font-size: 1rem; color: var(--text-main);">${item.name}</div>
        <div style="font-size: 0.78rem; color: var(--text-secondary);">${item.class} &bull; ${item.memberId}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Sesi Kegiatan</span>
          <div style="font-weight: 600; color: var(--text-main);">${item.session}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Waktu Presensi</span>
          <div style="font-weight: 600; color: var(--text-main);">${item.date} (${item.time})</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Metode Presensi</span>
          <div style="font-weight: 600; color: var(--text-main);">${item.method}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Status Kehadiran</span>
          <div><span class="badge ${item.status === 'Hadir' ? 'badge-hadir' : item.status === 'Izin' ? 'badge-izin' : 'badge-sakit'}">${item.status}</span></div>
        </div>
      </div>

      <div>
        <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Keterangan & Catatan</span>
        <div style="background-color: var(--bg-surface-subtle); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); color: var(--text-secondary);">
          ${item.note || 'Tidak ada catatan tambahan.'}
        </div>
      </div>
    </div>
  `;

  openModal('historyDetailModal');
}

window.showHistoryDetail = showHistoryDetail;
