/**
 * โมดูลวิเคราะห์อาการขาดธาตุอาหารพืช (Plant Nutrients Module)
 * มีระบบคัดกรองตามตำแหน่งใบ (ใบล่าง/ใบบน/ยอด) และแบบสอบถามวินิจฉัยทีละขั้น
 */

const NutrientsModule = (function () {
  let activePosition = 'all';
  let selectedNutrient = 'N';

  function init() {
    renderNutrientButtons();
    renderDetail(selectedNutrient);
    setupListeners();
  }

  function setupListeners() {
    // Position filter tags
    document.querySelectorAll('[data-nutrient-pos]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-nutrient-pos]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activePosition = btn.dataset.nutrientPos;
        renderNutrientButtons();
      });
    });

    // Diagnostic Wizard Trigger
    const wizardBtn = document.getElementById('nutrient-wizard-btn');
    if (wizardBtn) {
      wizardBtn.addEventListener('click', openWizard);
    }
  }

  function renderNutrientButtons() {
    const container = document.getElementById('nutrient-buttons-container');
    if (!container) return;

    const keys = Object.keys(NUTRIENTS_DATA).filter(k => {
      if (activePosition === 'all') return true;
      return NUTRIENTS_DATA[k].position === activePosition;
    });

    container.innerHTML = keys.map(k => {
      const item = NUTRIENTS_DATA[k];
      const isActive = k === selectedNutrient;
      return `
        <button type="button" class="nutrient-btn ${isActive ? 'active' : ''}" onclick="NutrientsModule.selectNutrient('${k}')">
          <span class="nutrient-symbol">${item.symbol}</span>
          <span class="nutrient-label">${item.name.split(' ')[0]}</span>
        </button>
      `;
    }).join('');
  }

  function selectNutrient(key) {
    selectedNutrient = key;
    renderNutrientButtons();
    renderDetail(key);
  }

  function renderDetail(key) {
    const item = NUTRIENTS_DATA[key];
    const container = document.getElementById('nutrient-detail-container');
    if (!item || !container) return;

    container.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:24px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; border-bottom:1px solid var(--border-color); padding-bottom:14px; margin-bottom:16px;">
          <div>
            <span class="pest-badge" style="background:var(--primary-light); color:var(--primary);">
              ตำแหน่งอาการ: ${item.positionLabel}
            </span>
            <h3 style="font-size:1.45rem; font-weight:800; color:var(--text-main); margin-top:4px;">
              ${item.name}
            </h3>
          </div>
          <div style="width:52px; height:52px; border-radius:var(--radius-full); background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.6rem; font-weight:800;">
            ${item.symbol}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:18px;">
          <div style="background:var(--bg-card-subtle); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--primary); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
              <span>🍂</span> อาการขาดธาตุที่สังเกตได้
            </h4>
            <p style="font-size:0.9rem; line-height:1.6; color:var(--text-main);">${item.symptom}</p>
          </div>

          <div style="background:var(--bg-card-subtle); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--info); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
              <span>⚙️</span> บทบาทหน้าที่ในพืช
            </h4>
            <p style="font-size:0.9rem; line-height:1.6; color:var(--text-main);">${item.role}</p>
          </div>
        </div>

        <div style="margin-top:16px; background:#f4fbf6; border:1px solid #c7e8cf; padding:16px; border-radius:var(--radius-md);">
          <h4 style="font-size:0.95rem; font-weight:700; color:var(--primary-hover); margin-bottom:6px; display:flex; align-items:center; gap:6px;">
            <span>🌱</span> แหล่งปุ๋ยและแนวทางแก้ไข
          </h4>
          <p style="font-size:0.9rem; line-height:1.6; color:#184a29;">${item.source}</p>
        </div>

        <div style="margin-top:14px; background:#fffcf2; border:1px solid #f9e2a7; padding:16px; border-radius:var(--radius-md);">
          <h4 style="font-size:0.95rem; font-weight:700; color:#854d0e; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
            <span>⚠️</span> ข้อควรระวังและปัจจัยดิน (Soil & Management)
          </h4>
          <p style="font-size:0.88rem; line-height:1.6; color:#713f12;">${item.caution}</p>
        </div>

        <div style="margin-top:18px; padding-top:12px; border-top:1px solid var(--border-color); display:flex; gap:16px; flex-wrap:wrap; font-size:0.84rem;">
          <a href="https://ppsf.doae.go.th/อาการขาดธาตุอาหารของพืช-2/" target="_blank" rel="noopener noreferrer">
            📄 กองส่งเสริมการอารักขาพืชและจัดการดินปุ๋ย กรมส่งเสริมการเกษตร
          </a>
          <a href="https://esc.doae.go.th/17-ธาตุอาหารพืช/" target="_blank" rel="noopener noreferrer">
            📄 17 ธาตุอาหารพืชและหน้าที่
          </a>
        </div>
      </div>
    `;
  }

  function openWizard() {
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="detail-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:2rem;">🧙‍♂️</span>
          <h3 style="font-size:1.3rem; font-weight:800; color:var(--text-main);">เครื่องมือช่วยวินิจฉัยอาการขาดธาตุอาหารทีละขั้น</h3>
        </div>
        <button type="button" class="detail-close" onclick="DiagnosisModule.closeDetail()">✕ ปิด</button>
      </div>

      <div style="padding:10px 0;">
        <p style="font-size:0.95rem; font-weight:600; margin-bottom:12px; color:var(--text-main);">
          ขั้นตอนที่ 1: สังเกตเห็นอาการผิดปกติเริ่มแสดงที่ "ตำแหน่งใดของพืช" ชัดเจนที่สุด?
        </p>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <button type="button" class="btn-primary" style="justify-content:flex-start; padding:14px;" onclick="NutrientsModule.wizardStep2('lower')">
            🍃 1. ใบแก่ด้านล่าง (Lower Leaves) — เหลืองซีด, ขอบใบไหม้ หรือใบคล้ำ
          </button>
          <button type="button" class="btn-primary" style="justify-content:flex-start; padding:14px; background:#2980b9;" onclick="NutrientsModule.wizardStep2('upper')">
            🌱 2. ใบอ่อนด้านบน (Upper Leaves) — ยอดซีดเหลือง หรือเหลืองระหว่างเส้นใบ
          </button>
          <button type="button" class="btn-primary" style="justify-content:flex-start; padding:14px; background:#8e44ad;" onclick="NutrientsModule.wizardStep2('bud')">
            🌸 3. จุดเจริญปลายยอด ตา หรือดอกและผล — ยอดหงิก ปลายผลเน่า ดอกร่วง
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  function wizardStep2(pos) {
    const content = document.getElementById('detail-modal-content');
    if (!content) return;

    let options = '';
    if (pos === 'lower') {
      options = `
        <button type="button" class="tool-btn" style="padding:12px; text-align:left; display:block; width:100%; margin-bottom:8px;" onclick="NutrientsModule.finishWizard('N')">
          👉 <b>ใบแก่เหลืองสม่ำเสมอทั่วทั้งใบ</b> ต้นโตช้า กิ่งสั้น ➔ <b>น่าจะขาด ไนโตรเจน (N)</b>
        </button>
        <button type="button" class="tool-btn" style="padding:12px; text-align:left; display:block; width:100%; margin-bottom:8px;" onclick="NutrientsModule.finishWizard('P')">
          👉 <b>ใบแก่เขียวคล้ำ อมม่วงแดง</b> ต้นแคระ รากไม่เดิน ➔ <b>น่าจะขาด ฟอสฟอรัส (P)</b>
        </button>
        <button type="button" class="tool-btn" style="padding:12px; text-align:left; display:block; width:100%; margin-bottom:8px;" onclick="NutrientsModule.finishWizard('K')">
          👉 <b>ขอบใบแก่และปลายใบไหม้เกรียม</b> กลางใบยังเขียว ➔ <b>น่าจะขาด โพแทสเซียม (K)</b>
        </button>
        <button type="button" class="tool-btn" style="padding:12px; text-align:left; display:block; width:100%; margin-bottom:8px;" onclick="NutrientsModule.finishWizard('Mg')">
          👉 <b>ใบแก่เหลืองระหว่างเส้นใบ</b> เส้นใบยังเขียวโครงก้างปลา ➔ <b>น่าจะขาด แมกนีเซียม (Mg)</b>
        </button>
      `;
    } else if (pos === 'upper') {
      options = `
        <button type="button" class="tool-btn" style="padding:12px; text-align:left; display:block; width:100%; margin-bottom:8px;" onclick="NutrientsModule.finishWizard('Fe')">
          👉 <b>ใบอ่อนยอดเหลืองซีดระหว่างเส้นใบ</b> ชัดเจน ยอดขาว ➔ <b>น่าจะขาด เหล็ก (Fe)</b>
        </button>
        <button type="button" class="tool-btn" style="padding:12px; text-align:left; display:block; width:100%; margin-bottom:8px;" onclick="NutrientsModule.finishWizard('S')">
          👉 <b>ใบอ่อนซีดเหลืองสม่ำเสมอทั้งใบ</b> คล้ายขาด N แต่เริ่มที่ยอด ➔ <b>น่าจะขาด กำมะถัน (S)</b>
        </button>
        <button type="button" class="tool-btn" style="padding:12px; text-align:left; display:block; width:100%; margin-bottom:8px;" onclick="NutrientsModule.finishWizard('Zn')">
          👉 <b>ใบอ่อนเล็กแคบ ข้อปล้องสั้นกุด</b> ใบเป็นกระจุก ➔ <b>น่าจะขาด สังกะสี (Zn)</b>
        </button>
      `;
    } else {
      options = `
        <button type="button" class="tool-btn" style="padding:12px; text-align:left; display:block; width:100%; margin-bottom:8px;" onclick="NutrientsModule.finishWizard('Ca')">
          👉 <b>ยอดอ่อนหงิกงอ ปลายยอดแห้งตาย ก้นผลเน่าดำ</b> ➔ <b>น่าจะขาด แคลเซียม (Ca)</b>
        </button>
        <button type="button" class="tool-btn" style="padding:12px; text-align:left; display:block; width:100%; margin-bottom:8px;" onclick="NutrientsModule.finishWizard('B')">
          👉 <b>ยอดเปราะหักง่าย ดอกร่วง ผลบิดเบี้ยว ไส้ผลดำ</b> ➔ <b>น่าจะขาด โบรอน (B)</b>
        </button>
      `;
    }

    content.innerHTML = `
      <div class="detail-header">
        <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-main);">ขั้นตอนที่ 2: เลือกลักษณะอาการย่อยที่พบ</h3>
        <button type="button" class="detail-close" onclick="DiagnosisModule.closeDetail()">✕ ปิด</button>
      </div>
      <div style="padding:10px 0;">
        ${options}
        <button type="button" class="tool-btn" style="margin-top:14px;" onclick="NutrientsModule.openWizard()">⬅ ย้อนกลับขั้นตอนที่ 1</button>
      </div>
    `;
  }

  function finishWizard(key) {
    DiagnosisModule.closeDetail();
    selectNutrient(key);
  }

  return {
    init,
    selectNutrient,
    openWizard,
    wizardStep2,
    finishWizard
  };
})();
