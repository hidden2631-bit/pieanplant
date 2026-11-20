/**
 * โมดูลฐานข้อมูลกลุ่มกลไกการออกฤทธิ์ FRAC & IRAC (MoA Module)
 * พร้อมระบบคำนวณการสลับกลุ่มสารเคมีเพื่อป้องกันการดื้อยา (Resistance Rotation Helper)
 */

const MoaModule = (function () {
  let activeKindFilter = 'ทั้งหมด';
  let searchQuery = '';

  function init() {
    renderGrid();
    setupListeners();
    initRotationHelper();
  }

  function setupListeners() {
    // Kind filter buttons
    document.querySelectorAll('[data-moa-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-moa-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeKindFilter = btn.dataset.moaFilter;
        renderGrid();
      });
    });

    // MoA Search input
    const searchInput = document.getElementById('moa-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderGrid();
      });
    }

    // Clear search
    const clearBtn = document.getElementById('moa-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        activeKindFilter = 'ทั้งหมด';
        document.querySelectorAll('[data-moa-filter]').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-moa-filter="ทั้งหมด"]')?.classList.add('active');
        renderGrid();
      });
    }
  }

  function getFilteredMoa() {
    return MOA_DATABASE.filter(row => {
      const matchKind = (activeKindFilter === 'ทั้งหมด') || row.kind === activeKindFilter;
      const matchQuery = !searchQuery || 
        (row.kind + ' ' + row.code + ' ' + row.name + ' ' + row.actives + ' ' + row.target + ' ' + row.pests + ' ' + (row.calendar || '')).toLowerCase().includes(searchQuery);
      return matchKind && matchQuery;
    });
  }

  function renderGrid() {
    const container = document.getElementById('moa-grid-container');
    const countDisplay = document.getElementById('moa-count-display');
    if (!container) return;

    const items = getFilteredMoa();
    if (countDisplay) {
      countDisplay.textContent = `พบ ${items.length} กลุ่มสาร`;
    }

    if (!items.length) {
      container.innerHTML = `
        <div style="grid-column:1/-1; padding:36px; text-align:center; background:var(--bg-card); border-radius:var(--radius-md); border:1px dashed var(--border-color);">
          <div style="font-size:2.5rem; margin-bottom:8px;">🧪</div>
          <h4 style="font-weight:700; color:var(--text-main);">ไม่พบกลุ่มสารที่ตรงกับคำค้นหา</h4>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-top:4px;">ลองค้นหาด้วยรหัสกลุ่ม เช่น "11", "28" หรือชื่อสามัญ เช่น "อะซอกซีสโตรบิน", "สไปนีโทแรม"</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(row => {
      const isFrac = row.kind === 'FRAC';
      return `
        <article class="moa-card ${isFrac ? 'frac' : 'irac'}">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="moa-badge-kind">${row.kind} • กลุ่ม ${row.code}</span>
            <span style="font-size:0.75rem; font-weight:700; color:${row.riskLevel.includes('สูง') ? '#d9383a' : '#27ae60'};">
              ระดับเสี่ยงดื้อยา: ${row.riskLevel}
            </span>
          </div>

          <h4 class="moa-code-title">${row.name}</h4>

          <div class="moa-field">
            <b>ชื่อสารสามัญตัวอย่าง:</b>
            <span style="color:var(--text-main);">${row.actives}</span>
          </div>

          <div class="moa-field">
            <b>กลไกและเป้าหมายการออกฤทธิ์ (Target Site):</b>
            <span style="color:var(--text-main); font-size:0.84rem;">${row.target}</span>
          </div>

          <div class="moa-field">
            <b>โรคพืชหรือศัตรูเป้าหมาย:</b>
            <span style="color:var(--text-main); font-size:0.84rem;">${row.pests}</span>
          </div>

          <div class="moa-field" style="background:var(--bg-card-subtle); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); margin-top:4px;">
            <b style="color:var(--primary);">ช่วงเฝ้าระวังและการสลับกลุ่มสาร:</b>
            <p style="font-size:0.82rem; line-height:1.5; color:var(--text-muted); margin-top:2px;">${row.calendar || row.rotationGuidance}</p>
          </div>
        </article>
      `;
    }).join('');
  }

  // --- Resistance Rotation Engine ---
  function initRotationHelper() {
    const kindSelect = document.getElementById('rot-kind-select');
    const codeSelect = document.getElementById('rot-code-select');
    if (!kindSelect || !codeSelect) return;

    kindSelect.addEventListener('change', () => {
      populateCodeSelect(kindSelect.value);
      calculateRotation();
    });

    codeSelect.addEventListener('change', calculateRotation);

    populateCodeSelect('FRAC');
    calculateRotation();
  }

  function populateCodeSelect(kind) {
    const codeSelect = document.getElementById('rot-code-select');
    if (!codeSelect) return;

    const availableCodes = MOA_DATABASE.filter(m => m.kind === kind).map(m => m.code);
    codeSelect.innerHTML = availableCodes.map(code => 
      `<option value="${code}">กลุ่ม ${code} (${getGroupName(kind, code)})</option>`
    ).join('');
  }

  function getGroupName(kind, code) {
    const item = MOA_DATABASE.find(m => m.kind === kind && m.code === code);
    return item ? item.name.split('•')[0].trim() : '';
  }

  function calculateRotation() {
    const kindSelect = document.getElementById('rot-kind-select');
    const codeSelect = document.getElementById('rot-code-select');
    const resultContainer = document.getElementById('rotation-result-container');
    if (!kindSelect || !codeSelect || !resultContainer) return;

    const kind = kindSelect.value;
    const code = codeSelect.value;
    const rules = ROTATION_RULES[kind] && ROTATION_RULES[kind][code];

    if (!rules) {
      resultContainer.innerHTML = `<p style="color:var(--text-muted);">ไม่มีข้อมูลกฎการหมุนเวียนสำหรับกลุ่มนี้</p>`;
      return;
    }

    const currentMoA = MOA_DATABASE.find(m => m.kind === kind && m.code === code);

    const avoidListHtml = (rules.avoid.length ? rules.avoid : [code]).map(c => `
      <div style="margin-bottom:6px; font-weight:700;">
        ⛔ ${kind} กลุ่ม ${c}
        <span style="font-weight:normal; font-size:0.8rem; display:block; color:#9b1c1c;">(กลุ่มกลไกเดียวกัน เสี่ยงดื้อยาข้ามกลุ่ม 100%)</span>
      </div>
    `).join('');

    const recommendItems = rules.recommend.map(recCode => {
      const recMoa = MOA_DATABASE.find(m => m.kind === kind && m.code === recCode);
      const actives = recMoa ? recMoa.actives.split(',').slice(0, 3).join(',') : '';
      return `
        <div style="margin-bottom:8px; padding-bottom:6px; border-bottom:1px dashed var(--primary-border);">
          <div style="font-weight:700; color:var(--primary-hover);">✅ ${kind} กลุ่ม ${recCode}</div>
          <div style="font-size:0.8rem; color:var(--text-main);">ตัวอย่างสาร: ${actives}</div>
        </div>
      `;
    }).join('');

    resultContainer.innerHTML = `
      <div class="rotation-danger-box">
        <h4 style="font-size:0.95rem; font-weight:800; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
          <span>🚫</span> ห้ามพ่นซ้ำในรอบถัดไป
        </h4>
        <p style="font-size:0.84rem; margin-bottom:8px;">เพิ่งพ่น <b>${kind} กลุ่ม ${code}</b> ไป ห้ามฉีดพ่นซ้ำกลุ่มเดิมเดี่ยวๆ เกิน 1-2 ครั้ง</p>
        ${avoidListHtml}
      </div>

      <div class="rotation-success-box">
        <h4 style="font-size:0.95rem; font-weight:800; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
          <span>🔄</span> กลุ่มสารทางเลือกที่แนะนำให้หมุนเวียนสลับ
        </h4>
        <p style="font-size:0.84rem; margin-bottom:8px;">กลุ่มสารที่มีกลไกต่างกัน ไม่เกิดการดื้อยาข้ามกลุ่ม:</p>
        ${recommendItems}
      </div>
    `;
  }

  function filterMoa(kind, code) {
    activeKindFilter = kind;
    searchQuery = code;
    document.querySelectorAll('[data-moa-filter]').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-moa-filter="${kind}"]`)?.classList.add('active');
    const searchInput = document.getElementById('moa-search-input');
    if (searchInput) searchInput.value = code;
    renderGrid();
  }

  return {
    init,
    filterMoa
  };
})();
