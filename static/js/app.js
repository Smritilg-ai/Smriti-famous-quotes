/**
 * Famous Quotes Application - Plain Vanilla JavaScript (ES6+)
 * No external libraries or build dependencies.
 */

(function () {
  'use strict';

  // --- State ---
  const state = {
    currentHeroQuote: null,
    searchQuery: '',
    selectedCategory: 'all',
    selectedAuthor: 'all',
    quotes: [],
    categories: [],
    authors: [],
    searchDebounceTimer: null
  };

  // --- DOM Elements ---
  const heroCard = document.getElementById('hero-card');
  const heroText = document.getElementById('hero-text');
  const heroAuthor = document.getElementById('hero-author');
  const heroCategory = document.getElementById('hero-category');
  const heroId = document.getElementById('hero-id');
  const btnRandom = document.getElementById('btn-random');
  const btnCopyHero = document.getElementById('btn-copy-hero');
  const btnTweet = document.getElementById('btn-tweet');

  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const categoryPillsContainer = document.getElementById('category-pills');
  const categorySelect = document.getElementById('category-select');
  const authorSelect = document.getElementById('author-select');
  const btnResetFilters = document.getElementById('btn-reset-filters');
  const resultsCount = document.getElementById('results-count');
  const quotesGrid = document.getElementById('quotes-grid');
  const emptyState = document.getElementById('empty-state');
  const btnClearEmpty = document.getElementById('btn-clear-empty');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // --- Toast Utility ---
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // --- Clipboard Copy Helper ---
  async function copyQuoteToClipboard(quoteText, author) {
    const formatted = `"${quoteText}" — ${author}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(formatted);
      } else {
        // Fallback for older browsers or insecure contexts
        const textarea = document.createElement('textarea');
        textarea.value = formatted;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('Quote copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy quote: ', err);
      showToast('Unable to copy quote.');
    }
  }

  // --- Tweet Share Helper ---
  function updateTweetLink(quote, author) {
    const tweetText = encodeURIComponent(`"${quote}" — ${author}`);
    btnTweet.href = `https://twitter.com/intent/tweet?text=${tweetText}`;
  }

  // --- Hero Quote Update ---
  function setHeroQuote(quoteObj) {
    if (!quoteObj) return;
    state.currentHeroQuote = quoteObj;

    // Smooth transition
    heroText.classList.add('fade-out');
    setTimeout(() => {
      heroText.textContent = quoteObj.quote;
      heroAuthor.textContent = `— ${quoteObj.author}`;
      heroCategory.textContent = quoteObj.category;
      heroId.textContent = `#${quoteObj.id}`;
      updateTweetLink(quoteObj.quote, quoteObj.author);
      heroText.classList.remove('fade-out');
    }, 180);
  }

  // --- Fetch Random Quote ---
  async function fetchRandomQuote() {
    try {
      btnRandom.disabled = true;
      const params = new URLSearchParams();
      if (state.selectedCategory && state.selectedCategory !== 'all') {
        params.append('category', state.selectedCategory);
      }
      if (state.selectedAuthor && state.selectedAuthor !== 'all') {
        params.append('author', state.selectedAuthor);
      }

      const queryUrl = `/api/quotes/random${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(queryUrl);

      if (res.ok) {
        const data = await res.json();
        setHeroQuote(data);
      } else {
        // If current filters yield no random quote, fall back to global random quote
        const fallbackRes = await fetch('/api/quotes/random');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setHeroQuote(fallbackData);
        }
      }
    } catch (err) {
      console.error('Error fetching random quote:', err);
    } finally {
      btnRandom.disabled = false;
    }
  }

  // --- Fetch Categories ---
  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      state.categories = data;

      // Populate Category Select
      categorySelect.innerHTML = '<option value="all">All Categories (100)</option>';
      data.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.name.toLowerCase();
        opt.textContent = `${cat.name} (${cat.count})`;
        categorySelect.appendChild(opt);
      });

      // Populate Category Pills
      categoryPillsContainer.innerHTML = '<button class="pill active" data-category="all">All</button>';
      data.forEach(cat => {
        const pill = document.createElement('button');
        pill.className = 'pill';
        pill.dataset.category = cat.name.toLowerCase();
        pill.textContent = cat.name;
        categoryPillsContainer.appendChild(pill);
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  // --- Fetch Authors ---
  async function fetchAuthors() {
    try {
      const res = await fetch('/api/authors');
      if (!res.ok) throw new Error('Failed to load authors');
      const data = await res.json();
      state.authors = data;

      authorSelect.innerHTML = '<option value="all">All Authors</option>';
      data.forEach(auth => {
        const opt = document.createElement('option');
        opt.value = auth.name.toLowerCase();
        opt.textContent = `${auth.name} (${auth.count})`;
        authorSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error fetching authors:', err);
    }
  }

  // --- Fetch & Render Quotes Grid ---
  async function fetchQuotes() {
    try {
      const params = new URLSearchParams();
      if (state.searchQuery.trim()) {
        params.append('q', state.searchQuery.trim());
      }
      if (state.selectedCategory && state.selectedCategory !== 'all') {
        params.append('category', state.selectedCategory);
      }
      if (state.selectedAuthor && state.selectedAuthor !== 'all') {
        params.append('author', state.selectedAuthor);
      }

      const url = `/api/quotes${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch quotes');

      const data = await res.json();
      state.quotes = data.quotes;
      renderQuotesGrid(data.quotes, data.total);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      quotesGrid.innerHTML = '<p class="error-msg">Failed to load quotes. Please try again.</p>';
    }
  }

  // --- Render Quotes Grid ---
  function renderQuotesGrid(quotes, total) {
    resultsCount.textContent = `Showing ${quotes.length} of 100 quotes`;

    if (quotes.length === 0) {
      quotesGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    quotesGrid.innerHTML = '';

    const fragment = document.createDocumentFragment();

    quotes.forEach(quote => {
      const card = document.createElement('article');
      card.className = 'quote-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Quote by ${quote.author}`);

      card.innerHTML = `
        <div class="card-top">
          <span class="card-category">${escapeHtml(quote.category)}</span>
          <span class="card-id">#${quote.id}</span>
        </div>
        <p class="card-text">"${escapeHtml(quote.quote)}"</p>
        <div class="card-footer">
          <span class="card-author">${escapeHtml(quote.author)}</span>
          <div class="card-actions">
            <button class="icon-btn copy-card-btn" title="Copy quote" aria-label="Copy quote">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button class="icon-btn feature-card-btn" title="Showcase in hero" aria-label="Showcase quote">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      `;

      // Click card to showcase
      card.addEventListener('click', (e) => {
        // Prevent trigger if clicking action buttons directly
        if (e.target.closest('.card-actions')) return;
        setHeroQuote(quote);
        heroCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      // Keypress enter on card to showcase
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          setHeroQuote(quote);
          heroCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      // Copy button
      const copyBtn = card.querySelector('.copy-card-btn');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyQuoteToClipboard(quote.quote, quote.author);
      });

      // Feature button
      const featureBtn = card.querySelector('.feature-card-btn');
      featureBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setHeroQuote(quote);
        heroCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Showcased in top banner!');
      });

      fragment.appendChild(card);
    });

    quotesGrid.appendChild(fragment);
  }

  // --- HTML Escaping Helper ---
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- Category Change Handler ---
  function setCategory(cat) {
    state.selectedCategory = cat;

    // Synchronize select
    categorySelect.value = cat;

    // Synchronize pills
    const pills = categoryPillsContainer.querySelectorAll('.pill');
    pills.forEach(p => {
      if (p.dataset.category === cat) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    fetchQuotes();
  }

  // --- Reset All Filters ---
  function resetFilters() {
    state.searchQuery = '';
    state.selectedCategory = 'all';
    state.selectedAuthor = 'all';

    searchInput.value = '';
    searchClearBtn.classList.remove('visible');
    categorySelect.value = 'all';
    authorSelect.value = 'all';

    const pills = categoryPillsContainer.querySelectorAll('.pill');
    pills.forEach(p => {
      p.classList.toggle('active', p.dataset.category === 'all');
    });

    fetchQuotes();
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Random quote button
    btnRandom.addEventListener('click', () => {
      fetchRandomQuote();
    });

    // Copy Hero button
    btnCopyHero.addEventListener('click', () => {
      if (state.currentHeroQuote) {
        copyQuoteToClipboard(state.currentHeroQuote.quote, state.currentHeroQuote.author);
      }
    });

    // Search input (debounced)
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      state.searchQuery = val;
      searchClearBtn.classList.toggle('visible', val.length > 0);

      clearTimeout(state.searchDebounceTimer);
      state.searchDebounceTimer = setTimeout(() => {
        fetchQuotes();
      }, 250);
    });

    // Clear search button
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      searchClearBtn.classList.remove('visible');
      fetchQuotes();
      searchInput.focus();
    });

    // Category pills click delegation
    categoryPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (pill && pill.dataset.category) {
        setCategory(pill.dataset.category);
      }
    });

    // Category select dropdown
    categorySelect.addEventListener('change', (e) => {
      setCategory(e.target.value);
    });

    // Author select dropdown
    authorSelect.addEventListener('change', (e) => {
      state.selectedAuthor = e.target.value;
      fetchQuotes();
    });

    // Reset filters button
    btnResetFilters.addEventListener('click', resetFilters);

    // Empty state clear button
    btnClearEmpty.addEventListener('click', resetFilters);
  }

  // --- Application Initialization ---
  async function init() {
    setupEventListeners();

    // Fetch initial data in parallel
    await Promise.all([
      fetchRandomQuote(),
      fetchCategories(),
      fetchAuthors(),
      fetchQuotes()
    ]);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
