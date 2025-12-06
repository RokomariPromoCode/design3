(function () {
  const rawDataEl = document.getElementById('affiliate-data');
  let DATA_MAP = {};
  let DATA_LIST = [];

  if (rawDataEl) {
    try {
      DATA_MAP = JSON.parse(rawDataEl.textContent.trim() || '{}') || {};
    } catch (e) {
      console.error('Failed to parse affiliate-data JSON', e);
      DATA_MAP = {};
    }
  }

  // Flatten data to a list & dedupe by title+link
  const dedupeSet = new Set();
  Object.keys(DATA_MAP).forEach(cat => {
    const arr = DATA_MAP[cat] || [];
    arr.forEach(item => {
      if (!item || !item.title) return;
      const key = (item.title + '|' + (item.link || '')).toLowerCase();
      if (dedupeSet.has(key)) return;
      dedupeSet.add(key);
      DATA_LIST.push({
        category: cat,
        title: item.title,
        author: item.author || '',
        seller: item.seller || '',
        img: item.img || '',
        desc: item.desc || '',
        link: item.link || '#'
      });
    });
  });

  /* ========= UTIL: create card elements ========= */

  function createGridCard(item) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = item.img || 'https://via.placeholder.com/300x300?text=Product';
    img.alt = item.title || '';
    card.appendChild(img);

    const body = document.createElement('div');
    body.className = 'product-card-body';

    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = item.title || '';
    body.appendChild(title);

    if (item.desc) {
      const p = document.createElement('p');
      p.className = 'product-desc';
      p.textContent = item.desc;
      body.appendChild(p);
    }

    const meta = document.createElement('div');
    meta.className = 'product-meta';
    const metaBits = [];
    if (item.author) metaBits.push(item.author);
    if (item.seller) metaBits.push(item.seller);
    if (item.category) metaBits.push('#' + item.category);
    meta.textContent = metaBits.join(' · ');
    body.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'product-actions';
    const buy = document.createElement('a');
    buy.href = item.link || '#';
    buy.target = '_blank';
    buy.rel = 'nofollow noopener';
    buy.innerHTML = 'ডিসকাউন্ট পেতে ক্লিক করুন <span>[Buy Now]</span> <i class="fas fa-arrow-right"></i>';
    actions.appendChild(buy);
    body.appendChild(actions);

    card.appendChild(body);
    return card;
  }

  function createCategoryCard(item) {
    const card = document.createElement('article');
    card.className = 'category-card';

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = item.img || 'https://via.placeholder.com/300x300?text=Product';
    img.alt = item.title || '';
    card.appendChild(img);

    const body = document.createElement('div');
    body.className = 'category-card-body';

    const h2 = document.createElement('h2');
    h2.textContent = item.title || '';
    body.appendChild(h2);

    if (item.desc) {
      const p = document.createElement('p');
      p.textContent = item.desc;
      body.appendChild(p);
    }

    const meta = document.createElement('div');
    meta.className = 'product-meta';
    const bits = [];
    if (item.author) bits.push(item.author);
    if (item.seller) bits.push(item.seller);
    if (item.category) bits.push('#' + item.category);
    meta.textContent = bits.join(' · ');
    body.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'product-actions';
    const a = document.createElement('a');
    a.href = item.link || '#';
    a.target = '_blank';
    a.rel = 'nofollow noopener';
    a.innerHTML = 'ডিসকাউন্ট পেতে ক্লিক করুন <span>[Buy Now]</span> <i class="fas fa-arrow-right"></i>';
    actions.appendChild(a);
    body.appendChild(actions);

    card.appendChild(body);
    return card;
  }

  function createMoreCard(cat, label) {
    const card = document.createElement('article');
    card.className = 'more-card';
    const link = document.createElement('a');
    link.href = '/' + cat.replace(/_/g, '-').replace(/ /g, '-').toLowerCase() + '/';
    link.textContent = label || 'আরও দেখুন';
    card.appendChild(link);
    return card;
  }

  /* ========= NAV TOGGLE ========= */

  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      navList.classList.toggle('open');
    });
  }

  /* ========= HOME SECTIONS (horizontal) =========
     - Each section has data-section-cat
     - Show first 4 cards initially
     - Up to 4 more on navigation (max 8)
     - 9th card is “আরও দেখুন”
  */

  const homeSections = document.querySelectorAll('.home-section[data-section-cat]');
  homeSections.forEach(section => {
    const cat = section.getAttribute('data-section-cat');
    const track = section.querySelector('.card-track');
    const btnPrev = section.querySelector('.slider-nav.prev');
    const btnNext = section.querySelector('.slider-nav.next');

    if (!cat || !track) return;

    const allItems = (DATA_MAP[cat] || []).slice(0, 8).map(item => ({
      category: cat,
      ...item
    }));

    let loaded = 0; // how many cards already created (without more-card)

    function spawnCards(count) {
      const toLoad = allItems.slice(loaded, loaded + count);
      toLoad.forEach(it => {
        const card = createGridCard({
          category: cat,
          title: it.title,
          author: it.author,
          seller: it.seller,
          img: it.img,
          desc: it.desc,
          link: it.link
        });
        track.appendChild(card);
        loaded++;
      });
      updateMoreCard();
      updateNavState();
    }

    let moreCardEl = null;
    function updateMoreCard() {
      if (moreCardEl) {
        moreCardEl.remove();
        moreCardEl = null;
      }
      // Only if we have at least one item
      if (allItems.length > 0) {
        moreCardEl = createMoreCard(cat, 'আরও দেখুন');
        track.appendChild(moreCardEl);
      }
    }

    function updateNavState() {
      if (btnPrev) {
        btnPrev.classList.toggle('disabled', loaded <= 4);
      }
      if (btnNext) {
        btnNext.classList.toggle('disabled', loaded >= allItems.length);
      }
    }

    // Initial 4
    spawnCards(4);

    // Scroll by dragging
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    track.addEventListener('mousedown', e => {
      isDown = true;
      track.classList.add('dragging');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    window.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.remove('dragging');
    });
    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.3;
      track.scrollLeft = scrollLeft - walk;
    });

    // Buttons load more + scroll
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (loaded < allItems.length) {
          spawnCards(4);
        }
        track.scrollBy({ left: 260, behavior: 'smooth' });
      });
    }
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        track.scrollBy({ left: -260, behavior: 'smooth' });
      });
    }
  });

  /* ========= GENERIC CARD GENERATOR (requirement #4)
     Usage:
     <div class="card-ancor" src_data="books.json"></div>
     or
     <div class="card-ancor" data-src="books"></div>
  */

  const cardAnchors = document.querySelectorAll('.card-ancor');
  cardAnchors.forEach(anchor => {
    let src = anchor.getAttribute('src_data') || anchor.dataset.src || '';
    if (!src) return;
    src = src.replace(/^_?data\//, '').replace(/\.json$/i, '');
    const items = (DATA_MAP[src] || []).map(i => ({ category: src, ...i }));

    if (!items.length) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'card-ancor-grid';
    items.forEach(item => {
      const card = createGridCard(item);
      wrapper.appendChild(card);
    });
    anchor.appendChild(wrapper);
  });

  /* ========= CATEGORY PAGE (vertical + load 10 at a time) ========= */

  const catListEl = document.getElementById('category-list');
  if (catListEl) {
    const cat = catListEl.getAttribute('data-category');
    const all = DATA_LIST.filter(i => i.category === cat);
    let index = 0;
    const loadMoreBtn = document.getElementById('category-load-more');

    function loadNextTen() {
      const slice = all.slice(index, index + 10);
      slice.forEach(item => {
        const card = createCategoryCard(item);
        catListEl.appendChild(card);
      });
      index += slice.length;
      if (!slice.length && loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
      }
      if (index >= all.length && loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
      }
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', loadNextTen);
    }

    // initial
    loadNextTen();
  }

  /* ========= SEARCH (suggestions + page results) ========= */

  function normalize(str) {
    return (str || '').toString().toLowerCase();
  }

  // Live suggestions in header
  const searchInput = document.getElementById('global-search-input');
  const suggBox = document.getElementById('search-suggestions');

  function buildSuggestions(query) {
    if (!suggBox) return;
    const q = normalize(query);
    if (!q) {
      suggBox.classList.remove('visible');
      suggBox.innerHTML = '';
      return;
    }

    const matches = [];

    // Category matches
    Object.keys(DATA_MAP).forEach(cat => {
      if (cat.toLowerCase().includes(q)) {
        matches.push({
          type: 'category',
          label: cat.replace(/_/g, ' '),
          url: '/' + cat.replace(/_/g, '-').toLowerCase() + '/'
        });
      }
    });

    // Product/title matches
    DATA_LIST.forEach(item => {
      if (matches.length > 8) return; // limit
      const t = normalize(item.title);
      const d = normalize(item.desc);
      if (t.includes(q) || d.includes(q)) {
        matches.push({
          type: 'item',
          label: item.title,
          cat: item.category,
          url: '/' + item.category.replace(/_/g, '-').toLowerCase() + '/'
        });
      }
    });

    if (!matches.length) {
      suggBox.classList.remove('visible');
      suggBox.innerHTML = '';
      return;
    }

    const ul = document.createElement('ul');
    matches.forEach(m => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = m.url;
      a.textContent = m.label;
      if (m.cat) {
        const span = document.createElement('span');
        span.className = 'cat';
        span.textContent = '#' + m.cat;
        a.appendChild(span);
      }
      li.appendChild(a);
      ul.appendChild(li);
    });

    suggBox.innerHTML = '';
    suggBox.appendChild(ul);
    suggBox.classList.add('visible');
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      buildSuggestions(e.target.value);
    });

    document.addEventListener('click', e => {
      if (!suggBox) return;
      if (!suggBox.contains(e.target) && e.target !== searchInput) {
        suggBox.classList.remove('visible');
      }
    });
  }

  // Search results page
  const resultsContainer = document.getElementById('search-results');
  if (resultsContainer) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const label = document.getElementById('search-query-label');
    const countEl = document.getElementById('search-result-count');
    if (label) label.textContent = q;

    const nq = normalize(q);
    let results = [];

    if (nq) {
      // Category pages
      Object.keys(DATA_MAP).forEach(cat => {
        if (cat.toLowerCase().includes(nq)) {
          results.push({
            type: 'category',
            _isCategory: true,
            title: 'Rokomari Promo Code For ' + cat.replace(/_/g, ' '),
            desc: 'এই ক্যাটাগরির সব প্রোমো কোড ও ডিসকাউন্ট দেখতে ক্লিক করুন।',
            category: cat,
            img: '',
            link: '/' + cat.replace(/_/g, '-').toLowerCase() + '/'
          });
        }
      });

      // Items
      DATA_LIST.forEach(item => {
        const t = normalize(item.title);
        const d = normalize(item.desc);
        if (t.includes(nq) || d.includes(nq)) {
          results.push(item);
        }
      });
    }

    if (countEl) {
      countEl.textContent = results.length
        ? results.length + 'টি ফলাফল পাওয়া গেছে।'
        : 'কোনো মিল পাওয়া যায়নি।';
    }

    results.forEach(item => {
      if (item._isCategory) {
        // render as category-style card but link to category page
        const c = {
          category: item.category,
          title: item.title,
          desc: item.desc,
          img: item.img,
          link: item.link
        };
        const card = createCategoryCard(c);
        resultsContainer.appendChild(card);
      } else {
        const card = createCategoryCard(item);
        resultsContainer.appendChild(card);
      }
    });
  }
})();
