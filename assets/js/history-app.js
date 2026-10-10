/**
 * History Application Logic (history-app.js)
 * Khusus Riwayat Presensi Latihan PMR SMKN 7 Samarinda (Kelas 10 & 11)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PMR_DB === 'undefined') return;
  loadHistoryTable();
  initHistoryFilters();
});

let allHistoryList = [];

function loadHistoryTable() {
  allHistoryList = PMR_DB.getAllHistoryDates();
  renderHistoryTable(allHistoryList);
}

function renderHistoryTable(data) {
  const tbody = document.getElementById('historyTableBody');
  const countEl = document.getElementById('historyCountBadge');
  if (!tbody) return;

  if (countEl) countEl.textContent = `${data.length} Sesi Latihan Tercatat`;

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Belum ada riwayat presensi latihan yang tersimpan. Lakukan presensi di halaman utama.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  data.forEach((item, index) => {
    html += `
      <tr>
        <td style="font-weight: 700; color: var(--text-muted); text-align: center;">${index + 1}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${formatIndoDate(item.date)}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted); font-family: monospace;">${item.date}</div>
        </td>
        <td>
          <span style="font-weight: 700; background: ${item.level === '10' ? '#eff6ff' : '#f5f3ff'}; color: ${item.level === '10' ? '#1d4ed8' : '#7c3aed'}; padding: 0.25rem 0.65rem; border-radius: 6px; font-size: 0.82rem;">
            ${item.level === '10' ? 'Sesi Kelas 10 (Wira Mula)' : 'Sesi Kelas 11 (Wira Madya)'}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem; font-size: 0.8rem; font-weight: 700;">
            <span style="color: var(--col-hadir);">H: ${item.hadir}</span> &bull;
            <span style="color: var(--col-izin);">I: ${item.izin}</span> &bull;
            <span style="color: var(--col-sakit);">S: ${item.sakit}</span> &bull;
            <span style="color: var(--col-alpa);">A: ${item.alpa}</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Total: ${item.total} Siswa</div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; min-width: 60px;">
              <div style="width: ${item.persentase}%; height: 100%; background: ${item.persentase >= 85 ? 'var(--col-hadir)' : 'var(--col-sakit)'};"></div>
            </div>
            <strong style="font-size: 0.85rem; color: var(--text-main);">${item.persentase}%</strong>
          </div>
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn-app btn-app-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="viewHistoryDetail('${item.date}', '${item.level}')">
            <i class="bi bi-eye-fill"></i> Detail Sesi
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function initHistoryFilters() {
  const sessionFilter = document.getElementById('historySessionFilter');
  const dateFilter = document.getElementById('historyDateFilter');

  function apply() {
    const sVal = sessionFilter ? sessionFilter.value : 'all';
    const dVal = dateFilter ? dateFilter.value : '';

    const filtered = allHistoryList.filter(item => {
      const matchSession = sVal === 'all' || item.level === sVal;
      const matchDate = !dVal || item.date === dVal;
      return matchSession && matchDate;
    });

    renderHistoryTable(filtered);
  }

  if (sessionFilter) sessionFilter.addEventListener('change', apply);
  if (dateFilter) dateFilter.addEventListener('input', apply);
}

function viewHistoryDetail(date, level) {
  const sheet = PMR_DB.getAttendanceSheet(date, level);
  const modal = document.getElementById('historyDetailModal');
  const tbody = document.getElementById('modalDetailTbody');
  const titleEl = document.getElementById('modalDetailTitle');

  if (titleEl) {
    titleEl.textContent = `Riwayat Presensi: ${level === '10' ? 'Kelas 10' : 'Kelas 11'} (${formatIndoDate(date)})`;
  }

  if (tbody) {
    let html = '';
    sheet.forEach((m, idx) => {
      let badgeStyle = 'background: #f1f5f9; color: #64748b;';
      if (m.status === 'Hadir') badgeStyle = 'background: var(--bg-hadir); color: var(--col-hadir);';
      if (m.status === 'Izin') badgeStyle = 'background: var(--bg-izin); color: var(--col-izin);';
      if (m.status === 'Sakit') badgeStyle = 'background: var(--bg-sakit); color: var(--col-sakit);';
      if (m.status === 'Alpa') badgeStyle = 'background: var(--bg-alpa); color: var(--col-alpa);';

      let sigPreview = '<span style="color: #cbd5e1;">-</span>';
      if (m.signature) {
        sigPreview = `<img src="${m.signature}" alt="TTD" style="max-height: 28px; max-width: 50px; object-fit: contain;">`;
      }

      html += `
        <tr>
          <td style="text-align: center; font-weight: 700; color: var(--text-muted);">${idx + 1}</td>
          <td><strong>${m.name}</strong><br><small style="color: var(--text-muted);">${m.nisn}</small></td>
          <td>${m.class}</td>
          <td><span style="font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.78rem; ${badgeStyle}">${m.status}</span></td>
          <td style="font-family: monospace; font-size: 0.8rem;">${m.time}</td>
          <td style="text-align: center;">${sigPreview}</td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${m.note || '-'}</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  if (modal) modal.style.display = 'flex';
}

function closeDetailModal() {
  const modal = document.getElementById('historyDetailModal');
  if (modal) modal.style.display = 'none';
}

function formatIndoDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = parseInt(parts[2], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parts[0];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${d} ${months[m]} ${y}`;
}

window.viewHistoryDetail = viewHistoryDetail;
window.closeDetailModal = closeDetailModal;
