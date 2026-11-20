/**
 * โมดูลเครื่องมือคำนวณผสมสารเคมีเกษตรและบันทึกประวัติการพ่น (Calculator & Diary Module)
 * คำนวณปริมาณสารเคมีต่อน้ำในถังพ่น และเก็บบันทึกประวัติเพื่อติดตามการหมุนเวียนกลุ่มสาร
 */

const CalculatorModule = (function () {
  const DIARY_KEY = 'pp_farm_spray_diary';

  function init() {
    setupListeners();
    calculateDosage();
    renderDiary();
  }

  function setupListeners() {
    const tankSelect = document.getElementById('calc-tank-select');
    const customTank = document.getElementById('calc-custom-tank');
    const doseInput = document.getElementById('calc-dose-input');
    const unitSelect = document.getElementById('calc-unit-select');

    if (tankSelect) {
      tankSelect.addEventListener('change', () => {
        if (tankSelect.value === 'custom') {
          if (customTank) customTank.style.display = 'block';
        } else {
          if (customTank) customTank.style.display = 'none';
        }
        calculateDosage();
      });
    }

    if (customTank) customTank.addEventListener('input', calculateDosage);
    if (doseInput) doseInput.addEventListener('input', calculateDosage);
    if (unitSelect) unitSelect.addEventListener('change', calculateDosage);

    // Diary save button
    const saveDiaryBtn = document.getElementById('save-diary-btn');
    if (saveDiaryBtn) {
      saveDiaryBtn.addEventListener('click', saveDiaryEntry);
    }
  }

  function getTankVolume() {
    const tankSelect = document.getElementById('calc-tank-select');
    const customTank = document.getElementById('calc-custom-tank');
    if (!tankSelect) return 20;

    if (tankSelect.value === 'custom') {
      return parseFloat(customTank?.value) || 20;
    }
    return parseFloat(tankSelect.value) || 20;
  }

  function calculateDosage() {
    const doseInput = document.getElementById('calc-dose-input');
    const unitSelect = document.getElementById('calc-unit-select');
    const resultDisplay = document.getElementById('calc-result-display');
    const resultUnitDisplay = document.getElementById('calc-result-unit');
    const areaEstimateDisplay = document.getElementById('calc-area-estimate');

    if (!doseInput || !resultDisplay) return;

    const tankVolume = getTankVolume(); // in Liters
    const dosePer20L = parseFloat(doseInput.value) || 0; // per 20L
    const unit = unitSelect ? unitSelect.value : 'ซีซี (มล.)';

    // Formula: (Dose per 20L / 20) * Tank Volume
    const totalDose = (dosePer20L / 20) * tankVolume;

    resultDisplay.textContent = Number.isInteger(totalDose) ? totalDose : totalDose.toFixed(1);
    if (resultUnitDisplay) resultUnitDisplay.textContent = unit;

    // Estimate spray coverage: Standard foliar spraying uses ~60-80 Liters of water per Rai
    if (areaEstimateDisplay) {
      const estimatedRai = (tankVolume / 60).toFixed(1);
      areaEstimateDisplay.textContent = `น้ำ ${tankVolume} ลิตร ฉีดพ่นได้ประมาณ ${estimatedRai} ไร่ (คิดจากอัตราพ่นเฉลี่ย 60 ลิตร/ไร่)`;
    }
  }

  function setTargetPreset(pestName, cropName) {
    App.navigateToView('toolbox-view');
    const diaryPest = document.getElementById('diary-pest-name');
    const diaryCrop = document.getElementById('diary-crop-name');
    if (diaryPest) diaryPest.value = pestName;
    if (diaryCrop) diaryCrop.value = cropName;
  }

  // --- Farm Diary Storage ---
  function getDiaryEntries() {
    try {
      return JSON.parse(localStorage.getItem(DIARY_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveDiaryEntry() {
    const cropInput = document.getElementById('diary-crop-name');
    const pestInput = document.getElementById('diary-pest-name');
    const groupInput = document.getElementById('diary-group-code');
    const notesInput = document.getElementById('diary-notes');

    if (!cropInput || !groupInput) return;

    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }),
      crop: cropInput.value || 'พืชทั่วไป',
      pest: pestInput?.value || 'สำรวจตามรอบ',
      group: groupInput.value || 'ไม่ระบุ',
      notes: notesInput?.value || ''
    };

    const list = getDiaryEntries();
    list.unshift(entry);
    localStorage.setItem(DIARY_KEY, JSON.stringify(list));

    if (notesInput) notesInput.value = '';
    renderDiary();
    alert('บันทึกประวัติการฉีดพ่นลงในอุปกรณ์เรียบร้อยแล้ว');
  }

  function deleteDiaryEntry(id) {
    const list = getDiaryEntries().filter(item => item.id !== id);
    localStorage.setItem(DIARY_KEY, JSON.stringify(list));
    renderDiary();
  }

  function renderDiary() {
    const container = document.getElementById('diary-entries-container');
    if (!container) return;

    const list = getDiaryEntries();
    if (!list.length) {
      container.innerHTML = `
        <p style="font-size:0.86rem; color:var(--text-muted); text-align:center; padding:16px;">
          ยังไม่มีการบันทึกประวัติการฉีดพ่นในเครื่องนี้ บันทึกด้านบนเพื่อช่วยเตือนไม่ให้พ่นสารกลุ่มเดิมซ้ำ
        </p>
      `;
      return;
    }

    container.innerHTML = list.map(item => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border-color); background:var(--bg-card); border-radius:var(--radius-sm); margin-bottom:8px;">
        <div>
          <span style="font-size:0.75rem; font-weight:700; color:var(--primary); background:var(--primary-light); padding:2px 8px; border-radius:var(--radius-full);">
            📅 ${item.date}
          </span>
          <h5 style="font-size:0.95rem; font-weight:700; color:var(--text-main); margin:4px 0 2px;">
            ${item.crop} · ${item.pest}
          </h5>
          <span style="font-size:0.82rem; color:#d35400; font-weight:700;">
            กลุ่มสารที่ใช้: ${item.group}
          </span>
          ${item.notes ? `<small style="display:block; color:var(--text-muted);">${item.notes}</small>` : ''}
        </div>
        <button type="button" onclick="CalculatorModule.deleteDiaryEntry(${item.id})" class="tool-btn" style="color:var(--danger); padding:4px 8px; font-size:0.78rem;">
          ✕ ลบ
        </button>
      </div>
    `).join('');
  }

  return {
    init,
    calculateDosage,
    setTargetPreset,
    deleteDiaryEntry
  };
})();
