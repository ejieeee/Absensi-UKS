/**
 * Members Directory Logic (members.js)
 * PMR Wira SMKN 7 Samarinda
 */

let membersList = [];

document.addEventListener('DOMContentLoaded', () => {
  if (typeof PMR_DATA === 'undefined') return;

  membersList = [...PMR_DATA.members];
  renderMembersTable();
  initMemberFilters();
  initAddMemberForm();
});

function renderMembersTable(data = null) {
  const tbody = document.getElementById('membersTbody');
  const countEl = document.getElementById('memberCountDisplay');
  if (!tbody) return;

  const dataset = data || membersList;
  if (countEl) countEl.textContent = dataset.length;

  if (dataset.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-people"></i></div>
            <div class="empty-state-title">Tidak ada data anggota yang cocok</div>
            <div class="empty-state-desc">Periksa kembali kata kunci pencarian atau filter divisi Anda.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  dataset.forEach(item => {
    const initials = item.name.split(' ').map(n => n[0]).slice(0, 2).join('');
    
    // Determine PMR level by class
    let level = 'Wira Mula';
    if (item.class.startsWith('XI ')) level = 'Wira Madya';
    if (item.class.startsWith('XII ')) level = 'Wira Utama';

    html += `
      <tr>
        <td>
          <div class="recent-table-meta-user">
            <div class="user-mini-avatar">${initials}</div>
            <div class="user-text-wrap">
              <span class="user-name-cell">${item.name}</span>
              <span class="user-sub-cell">NISN: ${item.nisn} &bull; ID: ${item.id}</span>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight: 600; color: var(--text-main);">${item.class}</span>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 0.82rem; color: var(--text-main);">${item.role}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${item.division}</div>
        </td>
        <td>
          <span class="badge badge-neutral">${level}</span>
        </td>
        <td>
          <span class="badge-blood" title="Golongan Darah ${item.bloodType}">${item.bloodType}</span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden; min-width: 50px;">
              <div style="width: ${item.attendanceRate}%; height: 100%; background: ${item.attendanceRate >= 90 ? '#16a34a' : '#d97706'};"></div>
            </div>
            <span style="font-size: 0.76rem; font-weight: 700; color: var(--text-main);">${item.attendanceRate}%</span>
          </div>
        </td>
        <td>
          <span class="badge ${item.status === 'Aktif' ? 'badge-hadir' : 'badge-neutral'}">${item.status}</span>
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn btn-outline btn-sm" onclick="showMemberDetail('${item.id}')" title="Profil Lengkap">
            <i class="bi bi-person-lines-fill"></i> Detail
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function initMemberFilters() {
  const searchInput = document.getElementById('memberSearchInput');
  const divisionSelect = document.getElementById('memberDivisionFilter');
  const classSelect = document.getElementById('memberClassFilter');

  function applyFilter() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const divVal = divisionSelect ? divisionSelect.value : 'all';
    const classVal = classSelect ? classSelect.value : 'all';

    const filtered = membersList.filter(item => {
      const matchSearch = !query ||
        item.name.toLowerCase().includes(query) ||
        item.nisn.includes(query) ||
        item.role.toLowerCase().includes(query);

      const matchDiv = divVal === 'all' || item.division.toLowerCase().includes(divVal.toLowerCase());
      const matchClass = classVal === 'all' || item.class.startsWith(classVal);

      return matchSearch && matchDiv && matchClass;
    });

    renderMembersTable(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilter);
  if (divisionSelect) divisionSelect.addEventListener('change', applyFilter);
  if (classSelect) classSelect.addEventListener('change', applyFilter);
}

function showMemberDetail(memberId) {
  const m = membersList.find(item => item.id === memberId);
  if (!m) return;

  const bodyEl = document.getElementById('memberDetailModalBody');
  if (!bodyEl) return;

  let level = 'Wira Mula';
  if (m.class.startsWith('XI ')) level = 'Wira Madya';
  if (m.class.startsWith('XII ')) level = 'Wira Utama';

  bodyEl.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      <div style="display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--pmr-red-700), var(--pmr-red-500)); color: #fff; font-size: 1.35rem; font-weight: 700; display: flex; align-items: center; justify-content: center;">
          ${m.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.15rem;">${m.name}</h4>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${m.role} &bull; ${m.class}</div>
          <div style="margin-top: 0.35rem; display: flex; gap: 0.35rem;">
            <span class="badge badge-hadir">${m.status}</span>
            <span class="badge badge-neutral">${level}</span>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.84rem;">
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">NISN</span>
          <div style="font-weight: 600; color: var(--text-main);">${m.nisn}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">ID Anggota PMR</span>
          <div style="font-weight: 600; color: var(--text-main);">${m.id}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Divisi Organisasi</span>
          <div style="font-weight: 600; color: var(--text-main);">${m.division}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Golongan Darah</span>
          <div style="font-weight: 700; color: var(--pmr-red-700);">${m.bloodType} (Tercatat di PMI)</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">No. Kontak / WhatsApp</span>
          <div style="font-weight: 600; color: var(--text-main);">${m.phone}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Tingkat Kehadiran</span>
          <div style="font-weight: 700; color: #16a34a;">${m.attendanceRate}% Presensi Posko</div>
        </div>
      </div>

      <div style="background-color: var(--bg-surface-subtle); padding: 0.85rem; border-radius: var(--radius-md); font-size: 0.8rem; color: var(--text-secondary);">
        <i class="bi bi-info-circle-fill" style="color: var(--pmr-red-600);"></i> <strong>Kualifikasi PMR:</strong> Memiliki sertifikat orientasi dasar PMR Wira PMI Kota Samarinda dan lulus uji komprehensif pertolongan pertama lapangan.
      </div>
    </div>
  `;

  openModal('memberDetailModal');
}

function initAddMemberForm() {
  const form = document.getElementById('addMemberForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('addName').value;
    const nisn = document.getElementById('addNisn').value;
    const gender = document.getElementById('addGender').value;
    const memberClass = document.getElementById('addClass').value;
    const division = document.getElementById('addDivision').value;
    const role = document.getElementById('addRole').value;
    const bloodType = document.getElementById('addBlood').value;
    const phone = document.getElementById('addPhone').value;

    const newMember = {
      id: `PMR-00${membersList.length + 1}`,
      nisn: nisn,
      name: name,
      gender: gender,
      class: memberClass,
      division: division,
      role: role || 'Anggota',
      bloodType: bloodType,
      status: 'Aktif',
      attendanceRate: 100,
      phone: phone || '0812-0000-0000'
    };

    membersList.unshift(newMember);
    renderMembersTable();
    closeModal('addMemberModal');
    form.reset();

    showToast('Anggota Ditambahkan', `${name} berhasil didaftarkan ke PMR Wira SMKN 7 Samarinda.`, 'success');
  });
}

window.showMemberDetail = showMemberDetail;
