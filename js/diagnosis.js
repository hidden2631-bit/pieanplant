/**
 * โมดูลค้นหาและวินิจฉัยโรคพืชและศัตรูพืช (Diagnosis Module)
 * รองรับการกรองตามพืชเศรษฐกิจ, คำค้นหา, การอัปโหลด/ถ่ายรูปภาพ และเชื่อมต่อภาพจาก Wikimedia Commons
 */

const DiagnosisModule = (function () {
  let activeCropFilter = 'ทั้งหมด';
  let activeTypeFilter = 'ทั้งหมด';
  let searchQuery = '';

  function init() {
    renderGrid();
    setupListeners();
  }

  function setupListeners() {
    // Crop filter tags
    document.querySelectorAll('[data-crop-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-crop-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCropFilter = btn.dataset.cropFilter;
        renderGrid();
      });
    });

    // Type filter tags
    document.querySelectorAll('[data-type-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-type-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTypeFilter = btn.dataset.typeFilter;
        renderGrid();
      });
    });

    // Inline search input
    const searchInput = document.getElementById('pest-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderGrid();
      });
    }

    // Photo input change
    const photoInput = document.getElementById('camera-file-input');
    if (photoInput) {
      photoInput.addEventListener('change', handlePhotoUpload);
    }
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    const previewContainer = document.getElementById('photo-preview-container');
    if (!file || !previewContainer) return;

    const imgUrl = URL.createObjectURL(file);
    previewContainer.innerHTML = `
      <div style="display:flex; align-items:center; gap:14px; margin-top:14px; padding:12px; background:var(--bg-card); border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <img src="${imgUrl}" class="photo-preview-item" alt="ภาพถ่ายพืช">
        <div style="text-align:left;">
          <p style="font-weight:700; color:var(--text-main);">📷 บันทึกภาพพืชสำเร็จ (${file.name})</p>
          <p style="font-size:0.84rem; color:var(--text-muted); margin:4px 0;">เปรียบเทียบลักษณะอาการกับรายการโรคพืชด้านล่าง หรือพิมพ์คำค้นหาเพื่อตรวจดูแนวทางจัดการ</p>
          <button type="button" class="tool-btn" onclick="document.getElementById('photo-preview-container').innerHTML=''" style="color:var(--danger);">✕ นำภาพออก</button>
        </div>
      </div>
    `;
  }

  function getFilteredData() {
    return PESTS_DATA.filter(item => {
      const matchCrop = (activeCropFilter === 'ทั้งหมด') || item.c.includes(activeCropFilter);
      const matchType = (activeTypeFilter === 'ทั้งหมด') || item.t === activeTypeFilter;
      const matchQuery = !searchQuery || 
        (item.n + ' ' + item.t + ' ' + item.c + ' ' + item.s + ' ' + (item.cause || '')).toLowerCase().includes(searchQuery);
      return matchCrop && matchType && matchQuery;
    });
  }

  function renderGrid() {
    const container = document.getElementById('pest-grid-container');
    const countDisplay = document.getElementById('pest-count-display');
    if (!container) return;

    const items = getFilteredData();
    if (countDisplay) {
      countDisplay.textContent = `พบ ${items.length} รายการ`;
    }

    if (!items.length) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; padding:36px; text-align:center; background:var(--bg-card); border-radius:var(--radius-md); border:1px dashed var(--border-color);">
          <div style="font-size:2.5rem; margin-bottom:8px;">🔍</div>
          <h4 style="font-weight:700; color:var(--text-main);">ไม่พบข้อมูลศัตรูพืชที่ตรงกับเงื่อนไข</h4>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-top:4px;">ลองเปลี่ยนตัวกรองพืช หรือค้นหาด้วยชื่ออาการ เช่น "ใบจุด", "เพลี้ย", "รากเน่า"</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => `
      <article class="pest-card" onclick="DiagnosisModule.openDetail('${item.id}')">
        <div class="pest-icon-wrap">${item.e}</div>
        <div class="pest-info">
          <span class="pest-badge">${item.t} · ${item.c}</span>
          <h4 class="pest-name">${item.n}</h4>
          <p class="pest-desc-snippet">${item.s}</p>
        </div>
      </article>
    `).join('');
  }

  function openDetail(id) {
    const item = PESTS_DATA.find(x => x.id === id);
    if (!item) return;

    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-modal-content');
    if (!modal || !content) return;

    let chemHtml = '';
    if (item.chem) {
      const fracBadges = (item.chem.fracCodes || []).map(code => 
        `<button class="pill-tag" onclick="App.navigateToView('moa-view'); MoaModule.filterMoa('FRAC', '${code}'); DiagnosisModule.closeDetail();" style="border-color:#8e44ad; color:#8e44ad; font-weight:700;">FRAC กลุ่ม ${code}</button>`
      ).join(' ');

      const iracBadges = (item.chem.iracCodes || []).map(code => 
        `<button class="pill-tag" onclick="App.navigateToView('moa-view'); MoaModule.filterMoa('IRAC', '${code}'); DiagnosisModule.closeDetail();" style="border-color:#d35400; color:#d35400; font-weight:700;">IRAC กลุ่ม ${code}</button>`
      ).join(' ');

      chemHtml = `
        <div class="chem-alert-box">
          <div style="font-weight:700; color:#854d0e; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
            <span>🧪</span> คำแนะนำการใช้สารเคมีและการจัดการการดื้อยา
          </div>
          <p style="margin-bottom:8px;">${item.chem.desc}</p>
          <p><b>สารตัวอย่าง:</b> ${item.chem.sampleActives}</p>
          ${fracBadges || iracBadges ? `
            <div style="margin:8px 0; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <b>กลุ่มกลไก (คลิกเพื่อดูฐานข้อมูล):</b> ${fracBadges} ${iracBadges}
            </div>
          ` : ''}
          <p style="font-size:0.82rem; color:#854d0e; margin-top:8px;">⚠️ <b>ข้อควรระวัง:</b> ${item.chem.caution}</p>
        </div>
      `;
    }

    content.innerHTML = `
      <div class="detail-header">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:2.2rem;">${item.e}</span>
          <div>
            <span class="pest-badge">${item.t} · ${item.c}</span>
            <h3 style="font-size:1.35rem; font-weight:800; color:var(--text-main); line-height:1.2;">${item.n}</h3>
            ${item.cause ? `<small style="color:var(--text-muted); display:block;">สาเหตุ: ${item.cause}</small>` : ''}
          </div>
        </div>
        <button type="button" class="detail-close" onclick="DiagnosisModule.closeDetail()">✕ ปิด</button>
      </div>

      <div class="detail-content">
        <div class="detail-section-title"><span>🔍</span> ลักษณะอาการ</div>
        <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">${item.s}</p>

        <div class="detail-section-title"><span>🛡️</span> แนวทางป้องกันและกำจัด (IPM)</div>
        <ul>
          ${item.m.map(step => `<li style="font-size:0.9rem; color:var(--text-main);">${step}</li>`).join('')}
        </ul>

        ${chemHtml}

        <div class="detail-section-title"><span>🖼️</span> ภาพประกอบตัวอย่างจากฐานข้อมูลสากล (Wikimedia Commons)</div>
        <div id="wiki-image-box" class="wiki-gallery">
          <p style="font-size:0.85rem; color:var(--text-muted); grid-column:1/-1;">กำลังโหลดภาพประกอบ...</p>
        </div>

        <div style="margin-top:18px; padding-top:14px; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <a href="https://www.doa.go.th/plprotect/?s=${encodeURIComponent(item.n)}" target="_blank" rel="noopener noreferrer" style="font-size:0.86rem; font-weight:600;">
            🔗 ค้นหาข้อมูลเพิ่มเติมในเว็บไซต์กรมวิชาการเกษตร
          </a>
          <button type="button" class="tool-btn" onclick="CalculatorModule.setTargetPreset('${item.n}', '${item.c}')">
            🧮 คำนวณอัตราผสมสารสำหรับโรคนี้
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
    loadWikimediaImages(item.wikiQuery || item.n);
  }

  function closeDetail() {
    const modal = document.getElementById('detail-modal');
    if (modal) modal.classList.remove('active');
  }

  function loadWikimediaImages(query) {
    const box = document.getElementById('wiki-image-box');
    if (!box) return;

    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=400&format=json&origin=*`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data.query || !data.query.pages) {
          box.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); grid-column:1/-1;">ไม่พบภาพตัวอย่างอัตโนมัติ</p>`;
          return;
        }

        const pages = Object.values(data.query.pages);
        box.innerHTML = pages.map(page => {
          const info = page.imageinfo && page.imageinfo[0];
          if (!info || !info.thumburl) return '';
          const artist = (info.extmetadata && info.extmetadata.Artist && info.extmetadata.Artist.value) || 'Wikimedia';
          const cleanArtist = artist.replace(/<[^>]*>/g, '');
          return `
            <div class="wiki-image-card">
              <a href="${info.descriptionurl}" target="_blank" rel="noopener noreferrer">
                <img src="${info.thumburl}" alt="${page.title}" loading="lazy">
              </a>
              <div class="wiki-caption">${cleanArtist.substring(0, 30)}</div>
            </div>
          `;
        }).join('');
      })
      .catch(() => {
        box.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); grid-column:1/-1;">ไม่สามารถเชื่อมต่อคลังภาพภายนอกได้</p>`;
      });
  }

  return {
    init,
    openDetail,
    closeDetail,
    filterByCrop: function(crop) {
      activeCropFilter = crop;
      renderGrid();
    }
  };
})();
