/**
 * โมดูลวงล้อเกษตรอินเตอร์แอคทีฟ (Interactive Agro-Wheels Module)
 * 1. วงล้อลำดับและตรวจสอบความเข้ากันได้ของการผสมสารเคมี (Chemical Mix Wheel)
 * 2. วงล้อตรวจสอบความเข้มสีใบข้าวเพื่อประเมินปุ๋ยไนโตรเจน (Rice Leaf Color Chart - LCC Wheel)
 */

const WheelsModule = (function () {
  // --- 1. ข้อมูลลำดับการผสมสารเคมี (Mixing Sequence WALES Rule) ---
  const MIX_STEPS = [
    {
      step: 1,
      title: '1. เติมน้ำสะอาดลงถังพ่น (50-60%)',
      code: 'WATER (H2O)',
      icon: '💧',
      desc: 'เติมน้ำสะอาดลงในถังพ่นให้ได้ประมาณครึ่งถังก่อนเสมอ และเปิดระบบกวนน้ำ (ห้ามเทสารเคมีลงในถังเปล่าที่ไม่มีน้ำเด็ดขาด เพราะสารจะเกาะก้นถังและเข้มข้นจนทำปฏิกิริยากันเอง)',
      tip: 'ใช้น้ำสะอาด pH เป็นกลาง (6.0 - 7.0) หลีกเลี่ยงน้ำบาดาลกระด้างหรือน้ำขุ่นโคลน'
    },
    {
      step: 2,
      title: '2. กลุ่มผงและเม็ดกระจายตัวในน้ำ (WP / WG / WDG)',
      code: 'WP, WG, WDG, DF',
      icon: '🧂',
      desc: 'ใส่สารกลุ่มผงละลายน้ำหรือเม็ดละลายน้ำ เช่น แมนโคเซบ WP, คอปเปอร์ออกซีคลอไรด์ WP, ไดฟีโนโคนาโซล WDG โดยให้ละลายในถังผสมเล็กภายนอกก่อนเทลงถังใหญ่ แล้วกวนน้ำให้ละลายหมดจด',
      tip: 'ต้องละลายให้หมดก่อนใส่สารกลุ่มถัดไป เพื่อป้องกันอนุภาคผงจับตัวเป็นก้อนแป้ง'
    },
    {
      step: 3,
      title: '3. กลุ่มสารแขวนลอยเข้มข้น (SC / FL)',
      code: 'SC, FL, F (Flowable)',
      icon: '🥛',
      desc: 'ใส่สารสูตรน้ำสีขาวขุ่นคล้ายน้ำนม เช่น อะซอกซีสโตรบิน SC, คลอแรนทรานิลิโพรล SC เขย่าขวดก่อนริน ค่อยๆ เทลงในน้ำที่มีการกวนอยู่ สารกลุ่มนี้จะกระจายตัวแขวนลอยในน้ำได้ดี',
      tip: 'สาร SC ผสมน้ำได้ง่าย แต่ถ้าปล่อยไว้นานอาจตกตะกอน ต้องกวนน้ำสม่ำเสมอ'
    },
    {
      step: 4,
      title: '4. กลุ่มสารละลายแท้และผงละลายน้ำสมบูรณ์ (SL / SP / WSC)',
      code: 'SL, SP, WSC (Soluble Liquid)',
      icon: '🧪',
      desc: 'ใส่สารกลุ่มของเหลวใสที่ละลายน้ำได้แท้จริง เช่น ฟอสฟอนิกแอซิด SL, อะบาเมกตินบางสูตร หรือปุ๋ยเกล็ดทางใบ/ฮอร์โมนที่ละลายน้ำหมดไม่ตกตะกอน',
      tip: 'สารละลายแท้จะผสมกลมกลืนกับน้ำทันทีโดยไม่ต้องใช้แรงกวนมาก'
    },
    {
      step: 5,
      title: '5. กลุ่มสารสูตรน้ำมันและอิมัลชัน (EC / EW / ME / OD)',
      code: 'EC, EW, ME, OD (Emulsifiable)',
      icon: '🛢️',
      desc: 'ใส่สารเคมีสูตรน้ำมัน เช่น ไซเพอร์เมทริน EC, โพรฟีโนฟอส EC เมื่อโดนน้ำจะแตกตัวเป็นสีขาวขุ่นคล้ายน้ำนม ต้องใส่ทีหลังสารกลุ่มน้ำเสมอ เพื่อป้องกันน้ำมันไปเคลือบอนุภาคผงจนไม่ละลาย',
      tip: 'ไม่ควรผสมสารสูตร EC หลายชนิดพร้อมกันในถังเดียว เพราะตัวทำละลายน้ำมันอาจทำปฏิกิริยากัดใบพืช (Phytotoxicity)'
    },
    {
      step: 6,
      title: '6. สารจับใบ สารเสริมประสิทธิภาพ & เติมน้ำเต็มถัง',
      code: 'Adjuvants / Surfactants',
      icon: '✨',
      desc: 'ใส่สารจับใบ สารลดแรงตึงผิว หรือซิลิโคนเสริมประสิทธิภาพเป็น "ลำดับสุดท้าย" เสมอ จากนั้นเติมน้ำสะอาดจนครบปริมาตรถังที่ต้องการ แล้วกวนน้ำเบาๆ ให้เข้ากัน',
      tip: 'หากใส่สารจับใบเป็นลำดับแรกๆ จะทำให้เกิดฟองฟูฟ่องล้นปากถังจนตวงสารอื่นไม่สะดวก'
    }
  ];

  // ตารางความเข้ากันได้ของสาร 2 ชนิด (Compatibility Matrix)
  const COMPATIBILITY_RULES = {
    copper: {
      name: 'สารกลุ่มคอปเปอร์ (ทองแดง)',
      incompatible: ['sulfur', 'calcium', 'organophosphate'],
      warning: 'ห้ามผสมกับกำมะถัน (Sulfur), ปุ๋ยแคลเซียม, หรือสารออร์กาโนฟอสเฟต เพราะจะเกิดสารประกอบไม่ละลายน้ำและเป็นพิษต่อใบพืชอย่างรุนแรง'
    },
    sulfur: {
      name: 'สารกลุ่มกำมะถัน (Sulfur)',
      incompatible: ['copper', 'oil'],
      warning: 'ห้ามผสมกับคอปเปอร์ และห้ามผสมหรือพ่นร่วมกับปิโตรเลียมออยล์/ไวท์ออยล์ (ต้องเว้นระยะห่างอย่างน้อย 14-21 วัน) มิฉะนั้นใบจะไหม้เกรียม'
    },
    calcium: {
      name: 'ปุ๋ยแคลเซียม-โบรอน (ทางใบ)',
      incompatible: ['copper', 'phosphate', 'sulfate'],
      warning: 'ห้ามผสมกับปุ๋ยที่มีฟอสเฟตสูง หรือซัลเฟตเข้มข้น เพราะแคลเซียมจะจับตัวตกตะกอนเป็นยิปซัม/แคลเซียมฟอสเฟตขาวขุ่น อุดตันหัวฉีดและพืชดูดกินไม่ได้'
    },
    phosphate: {
      name: 'ปุ๋ยฟอสเฟต / แมกนีเซียมซัลเฟต',
      incompatible: ['calcium'],
      warning: 'ห้ามผสมกับปุ๋ยแคลเซียม เพราะจะตกตะกอนทันที'
    },
    oil: {
      name: 'ปิโตรเลียมสเปรย์ออยล์ / ไวท์ออยล์',
      incompatible: ['sulfur', 'captan'],
      warning: 'ห้ามผสมกับกำมะถัน หรือสารแคปแทนเด็ดขาด เพราะจะทำให้ใบและผลไม้ไหม้ส่ารุนแรง'
    },
    general_sc: {
      name: 'สารเคมีทั่วไปสูตร SC / WP',
      incompatible: [],
      warning: 'สามารถผสมกันได้ แต่แนะนำให้ทดสอบ Jar Test ผสมในขวดเล็กดูก่อนพ่นจริง'
    }
  };

  // --- 2. ข้อมูลวงล้อเทียบสีใบข้าว (IRRI Leaf Color Chart - LCC) ---
  const LCC_LEVELS = [
    {
      level: 1,
      color: '#dbe069',
      label: 'ระดับ 1: สีเขียวซีดอมเหลืองมาก',
      status: 'ขาดไนโตรเจนรุนแรงมาก (Severe Deficiency)',
      statusColor: '#d9383a',
      action: {
        tillering: 'ข้าวระยะแตกกอ: ขาดปุ๋ยมาก ต้องรีบใส่ปุ๋ยยูเรีย (46-0-0) ทันที อัตรา 8-10 กก./ไร่ หรือปุ๋ยสูตร 16-20-0 อัตรา 20-25 กก./ไร่',
        panicle: 'ข้าวระยะตั้งท้อง/กำเนิดช่อดอก: ต้นข้าวสะสมอาหารไม่พอ รีบใส่ปุ๋ยยูเรีย 7-10 กก./ไร่ เพื่อเพิ่มจำนวนเมล็ดต่อรวง',
        heading: 'ข้าวระยะออกรวง: ใบซีดเร็วเกินไป อาจฉีดพ่นปุ๋ยทางใบยูเรีย 1% หรือใส่ปุ๋ยยูเรีย 3-5 กก./ไร่ เพื่อชะลอใบแก่'
      },
      diseaseRisk: 'ต้นข้าวอ่อนแอ แคระแกร็น กอไม่ขยาย เมล็ดลีบสูง แต่ความเสี่ยงโรคไหม้ต่ำ'
    },
    {
      level: 2,
      color: '#a9ce42',
      label: 'ระดับ 2: สีเขียวตองอ่อน (เขียวอมเหลือง)',
      status: 'เริ่มขาดไนโตรเจน (Moderate Deficiency)',
      statusColor: '#e67e22',
      action: {
        tillering: 'ข้าวระยะแตกกอ: ควรใส่ปุ๋ยยูเรีย (46-0-0) เพิ่มเติม อัตรา 5-7 กก./ไร่ เพื่อเร่งการแตกกอให้สม่ำเสมอ',
        panicle: 'ข้าวระยะตั้งท้อง: ใส่ปุ๋ยยูเรีย อัตรา 5-7 กก./ไร่ เพื่อบำรุงรวงข้าวให้เมล็ดเต็ม',
        heading: 'ข้าวระยะออกรวง: ใบยังเขียวไม่พอสำหรับการสร้างแป้ง พิจารณาเสริมปุ๋ยโพแทสเซียมร่วมกับยูเรียเล็กน้อย'
      },
      diseaseRisk: 'ความเสี่ยงโรคไหม้ต่ำ แต่ผลผลิตจะลดลงหากไม่เติมปุ๋ยไนโตรเจน'
    },
    {
      level: 3,
      color: '#6aa836',
      label: 'ระดับ 3: สีเขียวมาตรฐานพอดี (Optimal Green)',
      status: 'ระดับไนโตรเจนสมบูรณ์เหมาะสมที่สุด (Optimal Status)',
      statusColor: '#27ae60',
      action: {
        tillering: 'ข้าวระยะแตกกอ: ไนโตรเจนพอดีแล้ว ให้รักษาระดับการใส่ปุ๋ยตามอัตราแนะนำปกติ ไม่ต้องเร่งปุ๋ยยูเรียเพิ่ม',
        panicle: 'ข้าวระยะตั้งท้อง: ต้นข้าวสมบูรณ์ดีมาก ใส่ปุ๋ยบำรุงรวงตามเกณฑ์มาตรฐาน (ยูเรีย 3-5 กก./ไร่ ร่วมกับ 0-0-60)',
        heading: 'ข้าวระยะออกรวง: ใบธงเขียวสมบูรณ์ ไม่ต้องเติมปุ๋ยไนโตรเจน ปล่อยให้สร้างน้ำนมตามธรรมชาติ'
      },
      diseaseRisk: 'ต้นข้าวแข็งแรง ก้านชูรวงตั้ง ทนทานต่อโรคและแมลงได้ดีที่สุด'
    },
    {
      level: 4,
      color: '#3b802a',
      label: 'ระดับ 4: สีเขียวเข้ม (Dark Green)',
      status: 'ไนโตรเจนเพียงพอสูงแล้ว (Sufficient / High)',
      statusColor: '#2980b9',
      action: {
        tillering: 'ข้าวระยะแตกกอ: <b>งดใส่ปุ๋ยยูเรียหรือปุ๋ยไนโตรเจนในรอบนี้</b> ต้นข้าวมีไนโตรเจนสะสมเพียงพอแล้ว',
        panicle: 'ข้าวระยะตั้งท้อง: <b>ไม่ต้องใส่ปุ๋ยยูเรียเพิ่ม</b> ให้เน้นเฉพาะปุ๋ยโพแทสเซียม (0-0-60) เพื่อช่วยสร้างแป้งและเมล็ดเต่ง',
        heading: 'ข้าวระยะออกรวง: <b>ห้ามใส่ไนโตรเจนเด็ดขาด</b> ใบธงจะเขียวจนเก็บเกี่ยว'
      },
      diseaseRisk: 'เริ่มมีความเสี่ยงต่อโรคกาบใบแห้ง และเพลี้ยกระโดดสีน้ำตาล ให้หมั่นสำรวจโคนกอข้าว'
    },
    {
      level: 5,
      color: '#1a5417',
      label: 'ระดับ 5: สีเขียวเข้มจัดอมดำ (Excessive Nitrogen)',
      status: 'ไนโตรเจนเกินขนาด เฝือใบ (Excessive Nitrogen / Toxic)',
      statusColor: '#8e44ad',
      action: {
        tillering: 'ข้าวระยะแตกกอ: ⛔ <b>งดใส่ปุ๋ยไนโตรเจนทุกชนิดเด็ดขาด!</b> ระบายน้ำออกจากแปลงชั่วคราวเพื่อชะลอการดูดกิน N',
        panicle: 'ข้าวระยะตั้งท้อง: ⛔ <b>ห้ามใส่ปุ๋ยยูเรียเด็ดขาด!</b> ใส่เฉพาะปุ๋ยโพแทสเซียม (0-0-60) และซิลิคอนเพื่อเสริมผนังเซลล์ให้แข็งแรง',
        heading: 'ข้าวระยะออกรวง: ใบข้าวจะยาว ล้มง่าย และเมล็ดอาจเป็นโรคเมล็ดด่าง'
      },
      diseaseRisk: '⚠️ <b>เสี่ยงสูงมากต่อการระบาดของโรคไหม้ข้าว (Rice Blast)</b>, โรคกาบใบแห้ง และหนอนกอ/เพลี้ยกระโดด ต้นข้าวอวบน้ำล้มง่าย'
    }
  ];

  let currentMixStep = 1;
  let currentLccLevel = 3;
  let currentRiceStage = 'tillering';

  function init() {
    renderMixStep(1);
    setupMixWheelControls();
    setupCompatibilityChecker();
    renderLccWheel();
    updateLccResult();
    setupLccControls();
  }

  // --- ฟังก์ชันวงล้อผสมสารเคมี ---
  function setupMixWheelControls() {
    document.querySelectorAll('[data-mix-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.dataset.mixStep, 10);
        selectMixStep(step);
      });
    });

    const prevBtn = document.getElementById('mix-prev-btn');
    const nextBtn = document.getElementById('mix-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const next = currentMixStep > 1 ? currentMixStep - 1 : MIX_STEPS.length;
        selectMixStep(next);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const next = currentMixStep < MIX_STEPS.length ? currentMixStep + 1 : 1;
        selectMixStep(next);
      });
    }
  }

  function selectMixStep(step) {
    currentMixStep = step;
    document.querySelectorAll('[data-mix-step]').forEach(b => {
      if (parseInt(b.dataset.mixStep, 10) === step) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Rotate SVG wheel dial
    const dial = document.getElementById('mix-wheel-dial');
    if (dial) {
      const angle = (step - 1) * (360 / MIX_STEPS.length);
      dial.style.transform = `rotate(-${angle}deg)`;
    }

    renderMixStep(step);
  }

  function renderMixStep(step) {
    const item = MIX_STEPS.find(x => x.step === step);
    const container = document.getElementById('mix-step-display');
    if (!item || !container) return;

    container.innerHTML = `
      <div style="background:var(--bg-card); border:2px solid var(--primary-border); border-radius:var(--radius-lg); padding:22px; box-shadow:var(--shadow-sm); animation:fadeIn 0.2s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px; border-bottom:1px solid var(--border-color); padding-bottom:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:48px; height:48px; border-radius:var(--radius-full); background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.6rem;">
              ${item.icon}
            </div>
            <div>
              <span class="pest-badge" style="background:var(--primary-light); color:var(--primary);">สูตร: ${item.code}</span>
              <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-main); margin-top:2px;">${item.title}</h3>
            </div>
          </div>
          <span style="font-size:0.85rem; font-weight:700; color:var(--text-muted);">ขั้นตอนที่ ${item.step} จาก 6</span>
        </div>

        <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main); margin-bottom:12px;">
          ${item.desc}
        </p>

        <div style="background:#f4fbf6; border:1px solid #c8e8cf; padding:14px; border-radius:var(--radius-sm); font-size:0.86rem; color:#184a29;">
          💡 <b>ข้อแนะนำสำคัญ:</b> ${item.tip}
        </div>
      </div>
    `;
  }

  // --- ฟังก์ชันตรวจความเข้ากันได้ของการผสม 2 สาร ---
  function setupCompatibilityChecker() {
    const chemA = document.getElementById('compat-chem-a');
    const chemB = document.getElementById('compat-chem-b');
    const checkBtn = document.getElementById('compat-check-btn');

    if (chemA && chemB && checkBtn) {
      checkBtn.addEventListener('click', checkCompatibility);
      chemA.addEventListener('change', checkCompatibility);
      chemB.addEventListener('change', checkCompatibility);
      checkCompatibility();
    }
  }

  function checkCompatibility() {
    const chemA = document.getElementById('compat-chem-a')?.value;
    const chemB = document.getElementById('compat-chem-b')?.value;
    const resultBox = document.getElementById('compat-result-box');
    if (!chemA || !chemB || !resultBox) return;

    if (chemA === chemB) {
      resultBox.innerHTML = `
        <div style="background:var(--bg-card-subtle); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-color); text-align:center;">
          <span style="font-size:1.4rem;">ℹ️</span>
          <p style="font-weight:700; color:var(--text-main); margin-top:4px;">เป็นสารในกลุ่มเดียวกัน</p>
          <small style="color:var(--text-muted);">สามารถผสมกันได้ แต่ระวังอย่าใช้สารที่มีกลไกออกฤทธิ์ซ้ำซ้อนกัน</small>
        </div>
      `;
      return;
    }

    const ruleA = COMPATIBILITY_RULES[chemA];
    const ruleB = COMPATIBILITY_RULES[chemB];

    const isIncompatible = (ruleA && ruleA.incompatible.includes(chemB)) ||
                           (ruleB && ruleB.incompatible.includes(chemA));

    if (isIncompatible) {
      const warningText = (ruleA && ruleA.incompatible.includes(chemB)) ? ruleA.warning : ruleB.warning;
      resultBox.innerHTML = `
        <div style="background:#fde8e8; border:2px solid #d9383a; border-radius:var(--radius-md); padding:16px; color:#9b1c1c;">
          <div style="font-size:1.1rem; font-weight:800; display:flex; align-items:center; gap:8px;">
            <span>⛔</span> ห้ามผสม 2 สารนี้ในถังเดียวกันเด็ดขาด!
          </div>
          <p style="font-size:0.9rem; margin-top:8px; line-height:1.5;">${warningText}</p>
          <small style="display:block; margin-top:6px; font-weight:700;">ผลกระทบ: สารจะตกตะกอนเป็นก้อน, เกิดความร้อน, ประสิทธิภาพสารเคมีลดลง หรือเกิดพิษใบไหม้ต่อพืช</small>
        </div>
      `;
    } else {
      resultBox.innerHTML = `
        <div style="background:#eaf4ed; border:2px solid var(--primary-border); border-radius:var(--radius-md); padding:16px; color:#0c4d2e;">
          <div style="font-size:1.1rem; font-weight:800; display:flex; align-items:center; gap:8px;">
            <span>✅</span> สามารถผสมกันได้ตามปกติ
          </div>
          <p style="font-size:0.88rem; margin-top:6px;">
            สาร 2 ชนิดนี้ไม่มีข้อห้ามผสมทางเคมี ให้ปฏิบัติตาม <b>ลำดับการใส่สาร (WALES Rule)</b> และควรทำ Jar Test (ตวงผสมในขวดแก้ว 1 ลิตรดูก่อน) เพื่อความมั่นใจ
          </p>
        </div>
      `;
    }
  }

  // --- 2. ฟังก์ชันวงล้อเทียบสีใบข้าว (Leaf Color Chart - LCC) ---
  function renderLccWheel() {
    const container = document.getElementById('lcc-swatches-container');
    if (!container) return;

    container.innerHTML = LCC_LEVELS.map(item => `
      <button type="button" class="lcc-swatch-btn ${item.level === currentLccLevel ? 'active' : ''}" 
              data-lcc-level="${item.level}"
              style="--swatch-color:${item.color};">
        <span class="lcc-color-bar" style="background-color:${item.color};"></span>
        <span class="lcc-num">แผ่นที่ ${item.level}</span>
      </button>
    `).join('');

    document.querySelectorAll('[data-lcc-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentLccLevel = parseInt(btn.dataset.lccLevel, 10);
        document.querySelectorAll('[data-lcc-level]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateLccResult();
      });
    });
  }

  function setupLccControls() {
    document.querySelectorAll('[data-rice-stage]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-rice-stage]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRiceStage = btn.dataset.riceStage;
        updateLccResult();
      });
    });

    // Slider range control for smooth interactive drag
    const slider = document.getElementById('lcc-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        currentLccLevel = parseInt(e.target.value, 10);
        document.querySelectorAll('[data-lcc-level]').forEach(b => {
          if (parseInt(b.dataset.lccLevel, 10) === currentLccLevel) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });
        updateLccResult();
      });
    }
  }

  function updateLccResult() {
    const item = LCC_LEVELS.find(x => x.level === currentLccLevel);
    const resultContainer = document.getElementById('lcc-result-display');
    const colorCircle = document.getElementById('lcc-preview-circle');
    const slider = document.getElementById('lcc-slider');

    if (slider) slider.value = currentLccLevel;
    if (colorCircle && item) {
      colorCircle.style.backgroundColor = item.color;
      colorCircle.textContent = item.level;
    }

    if (!item || !resultContainer) return;

    const actionText = item.action[currentRiceStage] || item.action.tillering;

    resultContainer.innerHTML = `
      <div style="background:var(--bg-card); border:2px solid ${item.statusColor}; border-radius:var(--radius-lg); padding:22px; box-shadow:var(--shadow-sm); animation:fadeIn 0.2s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:12px;">
          <div>
            <span class="pest-badge" style="background:${item.statusColor}; color:#ffffff; font-size:0.82rem;">
              ${item.label}
            </span>
            <h4 style="font-size:1.25rem; font-weight:800; color:var(--text-main); margin-top:4px;">
              ${item.status}
            </h4>
          </div>
          <div style="width:48px; height:48px; border-radius:var(--radius-full); background:${item.color}; border:3px solid #ffffff; box-shadow:0 0 0 2px ${item.statusColor}; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.3rem; color:#222;">
            ${item.level}
          </div>
        </div>

        <div style="background:#f4fbf6; border:1px solid #c8e8cf; padding:16px; border-radius:var(--radius-md); margin-bottom:12px;">
          <h5 style="font-size:0.95rem; font-weight:800; color:#184a29; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
            <span>🌾</span> คำแนะนำการใส่ปุ๋ยไนโตรเจน (ยูเรีย 46-0-0)
          </h5>
          <p style="font-size:0.9rem; line-height:1.6; color:#184a29;">${actionText}</p>
        </div>

        <div style="background:#fffcf5; border:1px solid #fae29f; padding:14px; border-radius:var(--radius-md); font-size:0.86rem;">
          <b style="color:#854d0e;">⚠️ ความเสี่ยงต่อโรคและแมลงศัตรูข้าว:</b>
          <p style="color:#713f12; margin-top:2px;">${item.diseaseRisk}</p>
        </div>

        <div style="margin-top:14px; font-size:0.8rem; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <span>มาตรฐาน: แผ่นเทียบสีใบข้าว IRRI & กรมการข้าว</span>
          <span>เวลาที่ควรวัด: 09:00 - 11:00 น. หรือ 14:00 - 16:00 น. (หันหลังให้ดวงอาทิตย์)</span>
        </div>
      </div>
    `;
  }

  return {
    init,
    selectMixStep
  };
})();
