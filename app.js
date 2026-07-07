/* ============================================
   CARTOON LK - MAIN SITE LOGIC
   ============================================ */

/* Hamburger */
document.getElementById('hamburger').addEventListener('click', function() {
  this.classList.toggle('open');
  document.getElementById('navMenu').classList.toggle('open');
});

/* Language Toggle */
document.getElementById('langToggle').addEventListener('click', () => {
  const cur = localStorage.getItem('clk_lang') || 'en';
  const next = cur === 'en' ? 'si' : 'en';
  localStorage.setItem('clk_lang', next);
  applyLanguage(next);
  loadCategories();
  loadVideos();
});

/* Mobile dropdown toggle */
document.querySelectorAll('.has-dropdown > a').forEach(a => {
  a.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      a.parentElement.classList.toggle('open');
    }
  });
});

/* Back to top */
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('show', window.scrollY > 400);
});
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* Load Categories */
async function loadCategories() {
  const lang = localStorage.getItem('clk_lang') || 'en';
  try {
    const snap = await db.collection('categories').orderBy('name').get();
    const cats = [];
    snap.forEach(d => cats.push({ id: d.id, ...d.data() }));
    
    // Nav dropdown
    const dropdown = document.getElementById('categoryDropdown');
    if (cats.length) {
      dropdown.innerHTML = cats.map(c => `
        <li><a href="category.html?cat=${c.slug}">
          <i class="fa-solid fa-folder"></i> ${lang === 'si' ? c.nameSi : c.name}
        </a></li>`).join('');
    } else {
      dropdown.innerHTML = '<li><a href="#"><i class="fa-solid fa-circle-info"></i> No categories</a></li>';
    }
    
    // Pills
    const pills = document.getElementById('categoryPills');
    const allLabel = lang === 'si' ? 'සියල්ල' : 'All';
    pills.innerHTML = `<button class="pill active" data-cat="all"><i class="fa-solid fa-border-all"></i> ${allLabel}</button>` +
      cats.map(c => `<button class="pill" data-cat="${c.slug}"><i class="fa-solid fa-folder"></i> ${lang === 'si' ? c.nameSi : c.name}</button>`).join('');
    
    // Attach pill click
    document.querySelectorAll('.pill').forEach(p => {
      p.addEventListener('click', () => {
        document.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        loadVideos(p.dataset.cat);
      });
    });
    
    // Category grid
    const catGrid = document.getElementById('catGrid');
    if (catGrid) {
      const icons = ['fa-film','fa-gamepad','fa-wand-magic-sparkles','fa-dragon','fa-robot','fa-ghost','fa-hat-wizard','fa-car'];
      catGrid.innerHTML = cats.map((c, i) => `
        <a href="category.html?cat=${c.slug}" class="cat-card">
          <i class="fa-solid ${icons[i % icons.length]}"></i>
          <div>
            <h4>${lang === 'si' ? c.nameSi : c.name}</h4>
            <p>${lang === 'si' ? 'වීඩියෝ බලන්න' : 'Browse videos'}</p>
          </div>
        </a>`).join('');
    }
    
    // Footer cats
    const footerCats = document.getElementById('footerCats');
    if (footerCats) {
      footerCats.innerHTML = cats.slice(0, 6).map(c => `
        <li><a href="category.html?cat=${c.slug}"><i class="fa-solid fa-angle-right"></i> ${lang === 'si' ? c.nameSi : c.name}</a></li>
      `).join('');
    }
  } catch (e) {
    console.error('Error loading categories:', e);
  }
}

/* Load Videos */
async function loadVideos(categorySlug = 'all') {
  const lang = localStorage.getItem('clk_lang') || 'en';
  const grid = document.getElementById('videoGrid');
  grid.innerHTML = '<div class="loader-wrap"><div class="loader"></div></div>';
  
  try {
    let q = db.collection('videos').orderBy('createdAt', 'desc').limit(30);
    if (categorySlug !== 'all') {
      q = db.collection('videos').where('categorySlug', '==', categorySlug).orderBy('createdAt', 'desc').limit(30);
    }
    const snap = await q.get();
    
    if (snap.empty) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-film"></i>
          <h3>${lang === 'si' ? 'වීඩියෝ නැත' : 'No videos yet'}</h3>
          <p>${lang === 'si' ? 'නව වීඩියෝ ඉක්මනින් එනු ඇත' : 'New videos coming soon!'}</p>
        </div>`;
      document.getElementById('statVideos').textContent = '0';
      return;
    }
    
    const videos = [];
    snap.forEach(d => videos.push({ id: d.id, ...d.data() }));
    document.getElementById('statVideos').textContent = videos.length;
    
    grid.innerHTML = videos.map(v => {
      const title = lang === 'si' ? v.titleSi : v.title;
      return `
        <a href="watch.html?id=${v.id}" class="video-card">
          <div class="thumb">
            <img src="${v.thumbnail || 'https://via.placeholder.com/320x180/141929/ff4757?text=CartoonLK'}" alt="${title}" loading="lazy">
          </div>
          <div class="card-body">
            <h3>${title}</h3>
            <p class="card-meta">
              <i class="fa-solid fa-calendar"></i> 
              ${v.createdAt ? new Date(v.createdAt).toLocaleDateString(lang === 'si' ? 'si-LK' : 'en-US') : ''}
            </p>
          </div>
        </a>`;
    }).join('');
  } catch (e) {
    console.error('Error loading videos:', e);
    grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><h3>Error loading videos</h3></div>`;
  }
}

/* Search */
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

async function doSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { loadVideos(); return; }
  
  const lang = localStorage.getItem('clk_lang') || 'en';
  const grid = document.getElementById('videoGrid');
  grid.innerHTML = '<div class="loader-wrap"><div class="loader"></div></div>';
  
  try {
    const snap = await db.collection('videos').orderBy('createdAt', 'desc').limit(100).get();
    const results = [];
    snap.forEach(d => {
      const v = { id: d.id, ...d.data() };
      const title = (v.title || '').toLowerCase();
      const titleSi = (v.titleSi || '').toLowerCase();
      const desc = (v.descriptionEn || '').toLowerCase();
      const descSi = (v.descriptionSi || '').toLowerCase();
      if (title.includes(q) || titleSi.includes(q) || desc.includes(q) || descSi.includes(q)) {
        results.push(v);
      }
    });
    
    if (!results.length) {
      grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-magnifying-glass"></i><h3>${lang === 'si' ? 'ප්‍රතිඵල නැත' : 'No results found'}</h3></div>`;
      return;
    }
    
    grid.innerHTML = results.map(v => {
      const title = lang === 'si' ? v.titleSi : v.title;
      return `
        <a href="watch.html?id=${v.id}" class="video-card">
          <div class="thumb"><img src="${v.thumbnail || 'https://via.placeholder.com/320x180'}" alt="${title}" loading="lazy"></div>
          <div class="card-body">
            <h3>${title}</h3>
            <p class="card-meta"><i class="fa-solid fa-calendar"></i> ${v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}</p>
          </div>
        </a>`;
    }).join('');
  } catch (e) {
    console.error(e);
  }
}

searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') doSearch(); });

/* Init */
loadCategories();
loadVideos();