/* ============================================
   CARTOON LK - ADMIN PANEL
   ============================================ */

/* ====== AUTH ====== */
const ADMIN_KEY = 'clk_admin';
function getAdmin() {
  const d = localStorage.getItem(ADMIN_KEY);
  return d ? JSON.parse(d) : { user: 'admin', pass: 'admin123' };
}
function saveAdmin(a) { localStorage.setItem(ADMIN_KEY, JSON.stringify(a)); }
function isLoggedIn() { return sessionStorage.getItem('clk_admin_in') === '1'; }

/* ====== LOGIN ====== */
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');

if (isLoggedIn()) {
  loginScreen.style.display = 'none';
  dashboard.style.display = 'flex';
  initAdmin();
}

document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const admin = getAdmin();
  if (u === admin.user && p === admin.pass) {
    sessionStorage.setItem('clk_admin_in', '1');
    loginScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    initAdmin();
  } else {
    showToast('Invalid credentials', 'error');
  }
});

document.getElementById('logoutBtn').addEventListener('click', e => {
  e.preventDefault();
  sessionStorage.removeItem('clk_admin_in');
  location.reload();
});

/* ====== TABS ====== */
function switchTab(name) {
  document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.sidebar-nav a[data-tab]').forEach(a => a.classList.remove('active'));
  document.getElementById('tab-' + name).style.display = 'block';
  const activeLink = document.querySelector(`.sidebar-nav a[data-tab="${name}"]`);
  if (activeLink) activeLink.classList.add('active');
  document.getElementById('adminTitle').textContent = activeLink ? activeLink.querySelector('span').textContent : '';
}

document.querySelectorAll('.sidebar-nav a[data-tab]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    switchTab(a.dataset.tab);
  });
});

document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('adminSidebar').classList.toggle('open');
});

/* ====== INIT ====== */
async function initAdmin() {
  loadVideosTable();
  loadCategoriesTable();
  loadCategorySelect();
  loadIntroVideo();
  
  const admin = getAdmin();
  document.getElementById('setUser').value = admin.user;
  document.getElementById('setPass').value = admin.pass;
}

/* ====== VIDEOS TABLE ====== */
async function loadVideosTable() {
  const tbody = document.getElementById('videosTableBody');
  tbody.innerHTML = '<tr><td colspan="8" class="center"><div class="loader"></div></td></tr>';
  try {
    const snap = await db.collection('videos').orderBy('createdAt', 'desc').get();
    if (snap.empty) {
      tbody.innerHTML = '<tr><td colspan="8" class="center">No videos yet</td></tr>';
      return;
    }
    let i = 1;
    tbody.innerHTML = snap.docs.map(d => {
      const v = { id: d.id, ...d.data() };
      return `<tr>
        <td>${i++}</td>
        <td><span style="background:linear-gradient(135deg,#ff4757,#ff6b9d);color:#fff;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">${v.videoNumber || '-'}</span></td>
        <td><img src="${v.thumbnail || 'https://via.placeholder.com/80x45'}" alt=""></td>
        <td>${v.title || '-'}</td>
        <td>${v.titleSi || '-'}</td>
        <td>${v.categoryName || '-'}</td>
        <td>${v.createdAt ? new Date(v.createdAt.toMillis()).toLocaleDateString() : '-'}</td>
        <td>
          <div class="action-btns">
            <a href="watch.html?id=${v.id}" target="_blank" class="action-btn view" title="View"><i class="fa-solid fa-eye"></i></a>
            <button class="action-btn edit" onclick="editVideo('${v.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn del" onclick="deleteVideo('${v.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  } catch (e) {
    console.error(e);
    tbody.innerHTML = '<tr><td colspan="8" class="center">Error loading</td></tr>';
  }
}

/* ====== CATEGORIES TABLE ====== */
async function loadCategoriesTable() {
  const tbody = document.getElementById('catsTableBody');
  try {
    const snap = await db.collection('categories').orderBy('name').get();
    if (snap.empty) {
      tbody.innerHTML = '<tr><td colspan="5" class="center">No categories</td></tr>';
      return;
    }
    let i = 1;
    tbody.innerHTML = snap.docs.map(d => {
      const c = { id: d.id, ...d.data() };
      return `<tr>
        <td>${i++}</td>
        <td>${c.name}</td>
        <td>${c.nameSi}</td>
        <td><code>${c.slug}</code></td>
        <td>
          <div class="action-btns">
            <button class="action-btn del" onclick="deleteCategory('${c.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  } catch (e) {
    console.error(e);
  }
}

/* ====== CATEGORY SELECT ====== */
async function loadCategorySelect() {
  const sel = document.getElementById('vCategory');
  try {
    const snap = await db.collection('categories').orderBy('name').get();
    sel.innerHTML = '<option value="">-- Select Category --</option>';
    snap.forEach(d => {
      const c = d.data();
      sel.innerHTML += `<option value="${d.id}" data-slug="${c.slug}" data-name="${c.name}">${c.name} / ${c.nameSi}</option>`;
    });
  } catch (e) { console.error(e); }
}

/* ====== ADD CATEGORY ====== */
document.getElementById('catForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('catName').value.trim();
  const nameSi = document.getElementById('catNameSi').value.trim();
  if (!name || !nameSi) return;
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  try {
    await db.collection('categories').add({
      name, nameSi, slug,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('Category added!', 'success');
    document.getElementById('catForm').reset();
    loadCategoriesTable();
    loadCategorySelect();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
});

/* ====== DELETE CATEGORY ====== */
async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  try {
    await db.collection('categories').doc(id).delete();
    showToast('Category deleted', 'success');
    loadCategoriesTable();
    loadCategorySelect();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

/* ====== AUTO TRANSLATE ====== */
document.getElementById('autoTransBtn').addEventListener('click', async () => {
  const siText = document.getElementById('vDescSi').value.trim();
  if (!siText) {
    showToast('Enter Sinhala description first', 'error');
    return;
  }
  const status = document.getElementById('transStatus');
  status.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Translating...';
  const enText = await translateSiToEn(siText);
  if (enText) {
    document.getElementById('vDescEn').value = enText;
    status.innerHTML = '<i class="fa-solid fa-check"></i> Translated!';
    setTimeout(() => status.textContent = '', 3000);
  } else {
    status.innerHTML = '<i class="fa-solid fa-xmark"></i> Translation failed';
  }
});

/* ====== THUMBNAIL PREVIEW ====== */
document.getElementById('vThumb').addEventListener('input', e => {
  const url = e.target.value.trim();
  const preview = document.getElementById('thumbPreview');
  const img = document.getElementById('thumbImg');
  if (url) {
    img.src = url;
    preview.classList.add('show');
  } else {
    preview.classList.remove('show');
  }
});

/* ====== VIDEO FORM ====== */
document.getElementById('videoForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('editVideoId').value;
  const catSel = document.getElementById('vCategory');
  const catOption = catSel.options[catSel.selectedIndex];
  
  const data = {
    title: document.getElementById('vTitle').value.trim(),
    titleSi: document.getElementById('vTitleSi').value.trim(),
    descriptionSi: document.getElementById('vDescSi').value.trim(),
    descriptionEn: document.getElementById('vDescEn').value.trim(),
    videoLink: document.getElementById('vLink').value.trim(),
    thumbnail: document.getElementById('vThumb').value.trim(),
    adLink1: document.getElementById('vAd1').value.trim(),
    adLink2: document.getElementById('vAd2').value.trim(),
    categoryId: catSel.value,
    categorySlug: catOption.dataset.slug || '',
    categoryName: catOption.dataset.name || '',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    if (id) {
      await db.collection('videos').doc(id).update(data);
      showToast('Video updated!', 'success');
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      
      // Use counter document for numbering
      const counterRef = db.collection('config').doc('counters');
      const counterDoc = await counterRef.get();
      let nextNum = 1;
      if (counterDoc.exists) {
        nextNum = (counterDoc.data().videoCount || 0) + 1;
      }
      data.videoNumber = `Video ${String(nextNum).padStart(2, '0')}`;
      
      await db.collection('videos').add(data);
      
      await counterRef.set({ 
        videoCount: nextNum, 
        updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
      }, { merge: true });
      
      showToast(`Video added! (${data.videoNumber})`, 'success');
    }
    resetForm();
    loadVideosTable();
    switchTab('videos');
  } catch (e) {
    console.error(e);
    showToast('Error: ' + e.message, 'error');
  }
});

/* ====== EDIT VIDEO ====== */
async function editVideo(id) {
  try {
    const doc = await db.collection('videos').doc(id).get();
    if (!doc.exists) return;
    const v = doc.data();
    
    document.getElementById('editVideoId').value = id;
    document.getElementById('vTitle').value = v.title || '';
    document.getElementById('vTitleSi').value = v.titleSi || '';
    document.getElementById('vDescSi').value = v.descriptionSi || '';
    document.getElementById('vDescEn').value = v.descriptionEn || '';
    document.getElementById('vLink').value = v.videoLink || '';
    document.getElementById('vThumb').value = v.thumbnail || '';
    document.getElementById('vAd1').value = v.adLink1 || '';
    document.getElementById('vAd2').value = v.adLink2 || '';
    
    document.getElementById('vThumb').dispatchEvent(new Event('input'));
    
    const sel = document.getElementById('vCategory');
    for (let opt of sel.options) {
      if (opt.value === v.categoryId) { sel.value = v.categoryId; break; }
    }
    
    document.getElementById('addTitle').textContent = 'Edit Video';
    switchTab('add');
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

/* ====== DELETE VIDEO ====== */
async function deleteVideo(id) {
  if (!confirm('Delete this video?')) return;
  try {
    await db.collection('videos').doc(id).delete();
    showToast('Video deleted', 'success');
    loadVideosTable();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

/* ====== RESET FORM ====== */
function resetForm() {
  document.getElementById('videoForm').reset();
  document.getElementById('editVideoId').value = '';
  document.getElementById('addTitle').textContent = 'Add New Video';
  document.getElementById('thumbPreview').classList.remove('show');
}
document.getElementById('resetFormBtn').addEventListener('click', resetForm);

/* ====== SETTINGS ====== */
document.getElementById('settingsForm').addEventListener('submit', e => {
  e.preventDefault();
  const admin = {
    user: document.getElementById('setUser').value.trim(),
    pass: document.getElementById('setPass').value
  };
  saveAdmin(admin);
  showToast('Settings saved!', 'success');
});

/* ============================================
   INTRO VIDEO - NEW FEATURE
   ============================================ */

/* Load existing intro config */
async function loadIntroVideo() {
  try {
    const doc = await db.collection('config').doc('intro').get();
    if (doc.exists) {
      const data = doc.data();
      document.getElementById('introLink').value = data.videoLink || '';
      document.getElementById('introDuration').value = data.duration || 15;
      document.getElementById('introEnabled').checked = data.enabled !== false;
      
      // Show preview if link exists
      if (data.videoLink) {
        updateIntroPreview(data.videoLink);
      }
    }
  } catch (e) {
    console.log('No intro config yet');
  }
}

/* Update intro preview iframe */
function updateIntroPreview(url) {
  const preview = document.getElementById('introPreview');
  const frame = document.getElementById('introPreviewFrame');
  if (url && url.trim()) {
    frame.src = url;
    preview.classList.add('show');
  } else {
    frame.src = '';
    preview.classList.remove('show');
  }
}

/* Live preview on input */
document.getElementById('introLink').addEventListener('input', function() {
  updateIntroPreview(this.value.trim());
});

/* Save intro video */
document.getElementById('introForm').addEventListener('submit', async e => {
  e.preventDefault();
  
  const videoLink = document.getElementById('introLink').value.trim();
  const duration = parseInt(document.getElementById('introDuration').value) || 15;
  const enabled = document.getElementById('introEnabled').checked;
  
  if (enabled && !videoLink) {
    showToast('Please enter intro video link or disable intro', 'error');
    return;
  }
  
  if (duration < 3 || duration > 120) {
    showToast('Duration must be between 3 and 120 seconds', 'error');
    return;
  }
  
  try {
    await db.collection('config').doc('intro').set({
      videoLink: enabled ? videoLink : '',
      duration: duration,
      enabled: enabled,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    showToast('Intro video saved!', 'success');
  } catch (e) {
    console.error(e);
    showToast('Error: ' + e.message, 'error');
  }
});

/* Clear intro video */
document.getElementById('clearIntroBtn').addEventListener('click', async () => {
  if (!confirm('Clear intro video? It will no longer play before videos.')) return;
  try {
    await db.collection('config').doc('intro').set({
      videoLink: '',
      duration: 15,
      enabled: false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    document.getElementById('introLink').value = '';
    document.getElementById('introEnabled').checked = false;
    document.getElementById('introPreview').classList.remove('show');
    document.getElementById('introPreviewFrame').src = '';
    
    showToast('Intro video cleared', 'success');
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
});

/* ====== TOAST ====== */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* Make functions global */
window.editVideo = editVideo;
window.deleteVideo = deleteVideo;
window.deleteCategory = deleteCategory;
window.switchTab = switchTab;