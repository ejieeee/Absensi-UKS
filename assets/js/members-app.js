/**
 * Members Application Logic (members-app.js)
 * Master Data Anggota PMR SMKN 7 Samarinda (Kelas 10 & 11)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PMR_DB === 'undefined') return;
  loadMembersTable();
  initAddMemberModal();
});

let currentMembersFilter = 'all';

function loadMembersTable() {
  const members = PMR_DB.getMembers(currentMembersFilter);
  renderMembersList(members);
  updateMemberCounters();
}

function renderMembersList(list) {
  const tbody = document.getElementById('membersTableBody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Tidak ada data anggota ditemukan.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  list.forEach((m, idx) => {
    html += `
      <tr>
        <td style="font-weight: 700; color: var(--text-muted); text-align: center;">${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 0.92rem;">${m.name}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted); font-family: monospace;">NISN: ${m.nisn}</div>
        </td>
        <td>
          <span style="font-weight: 700; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
            ${m.class}
          </span>
        </td>
        <td>
          <span style="font-weight: 700; font-size: 0.78rem; padding: 0.2rem 0.5rem; border-radius: 4px; ${m.level === '10' ? 'background: #eff6ff; color: #1d4ed8;' : 'background: #f5f3ff; color: #7c3aed;'}">
            ${m.level === '10' ? 'Kelas 10 (Wira Mula)' : 'Kelas 11 (Wira Madya)'}
          </span>
        </td>
        <td style="font-size: 0.82rem; color: var(--text-main);">${m.phone}</td>
        <td>
          <span style="font-weight: 700; color: var(--col-hadir); font-size: 0.8rem;">
            <i class="bi bi-circle-fill" style="font-size: 0.5rem;"></i> ${m.status}
          </span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function updateMemberCounters() {
  const total = PMR_DB.getMembers('all').length;
  const k10 = PMR_DB.getMembers('10').length;
  const k11 = PMR_DB.getMembers('11').length;

  const countTotal = document.getElementById('countTotalMembers');
  const count10 = document.getElementById('countK10Members');
  const count11 = document.getElementById('countK11Members');

  if (countTotal) countTotal.textContent = `${total} Total`;
  if (count10) count10.textContent = `${k10} Siswa`;
  if (count11) count11.textContent = `${k11} Siswa`;
}

function filterMembers(level) {
  currentMembersFilter = level;
  const btnAll = document.getElementById('btnFilterAll');
  const btnK10 = document.getElementById('btnFilter10');
  const btnK11 = document.getElementById('btnFilter11');

  [btnAll, btnK10, btnK11].forEach(b => { if (b) b.classList.remove('active'); });

  if (level === 'all' && btnAll) btnAll.classList.add('active');
  if (level === '10' && btnK10) btnK10.classList.add('active');
  if (level === '11' && btnK11) btnK11.classList.add('active');

  loadMembersTable();
}

function initAddMemberModal() {
  const form = document.getElementById('addMemberForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('addMemberName').value.trim();
    const nisn = document.getElementById('addMemberNisn').value.trim();
    const memberClass = document.getElementById('addMemberClass').value.trim();
    const level = document.getElementById('addMemberLevel').value;
    const phone = document.getElementById('addMemberPhone').value.trim();

    if (!name || !memberClass) {
      alert('Nama dan Kelas wajib diisi!');
      return;
    }

    const newMember = PMR_DB.addMember({
      name,
      nisn,
      class: memberClass,
      level,
      phone
    });

    form.reset();
    closeAddModal();
    loadMembersTable();

    let toast = document.getElementById('appToastMsg');
    if (toast) {
      toast.innerHTML = `<i class="bi bi-check-circle-fill" style="color: #4ade80;"></i> <span>✓ ${newMember.name} (${newMember.class}) berhasil ditambahkan ke database!</span>`;
      toast.style.display = 'flex';
      setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
  });
}

function openAddModal() {
  const modal = document.getElementById('addMemberModal');
  if (modal) modal.style.display = 'flex';
}

function closeAddModal() {
  const modal = document.getElementById('addMemberModal');
  if (modal) modal.style.display = 'none';
}

window.filterMembers = filterMembers;
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
