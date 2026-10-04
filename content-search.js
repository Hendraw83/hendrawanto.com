'use strict';

function normalizeSearchText(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
}

document.querySelectorAll('[data-content-search]').forEach(form => {
  const list = form.nextElementSibling;
  if (!list?.classList.contains('news-list')) return;

  const cards = [...list.querySelectorAll('.news-card')];
  const input = form.querySelector('input[type="search"]');
  const select = form.querySelector('select');
  const status = form.querySelector('[data-search-status]');
  const reset = form.querySelector('[type="reset"]');
  const empty = form.querySelector('.news-search-empty');
  const categorySelector = form.dataset.categorySelector;
  const isIndonesian = document.documentElement.lang.toLowerCase().startsWith('id');
  const itemLabel = form.dataset.itemLabel;
  if (!input || !select || !status || !reset || !categorySelector) return;

  const entries = cards.map(card => ({
    card,
    category: card.querySelector(categorySelector)?.textContent.trim() ?? '',
    searchable: normalizeSearchText(card.textContent),
  }));
  const categories = [...new Set(entries.map(entry => entry.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, document.documentElement.lang));
  categories.forEach(category => select.add(new Option(category, category)));

  const params = new URLSearchParams(location.search);
  input.value = params.get('q') ?? '';
  const requestedCategory = params.get('category') ?? '';
  if (categories.includes(requestedCategory)) select.value = requestedCategory;

  function applyFilters(updateUrl = false) {
    const query = input.value.trim();
    const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
    const category = select.value;
    let visible = 0;

    entries.forEach(entry => {
      const matchesCategory = !category || entry.category === category;
      const matchesQuery = terms.every(term => entry.searchable.includes(term));
      entry.card.hidden = !(matchesCategory && matchesQuery);
      if (!entry.card.hidden) visible++;
    });

    status.textContent = isIndonesian
      ? `${visible} dari ${cards.length} ${itemLabel} ditampilkan`
      : `Showing ${visible} of ${cards.length} ${itemLabel}`;
    if (empty) empty.hidden = visible !== 0;
    reset.hidden = !query && !category;

    if (updateUrl && (location.protocol === 'https:' || location.protocol === 'http:')) {
      const url = new URL(location.href);
      if (query) url.searchParams.set('q', query);
      else url.searchParams.delete('q');
      if (category) url.searchParams.set('category', category);
      else url.searchParams.delete('category');
      history.replaceState(null, '', url);
    }
  }

  form.hidden = false;
  applyFilters();
  form.addEventListener('submit', event => {
    event.preventDefault();
    applyFilters(true);
  });
  input.addEventListener('input', () => applyFilters(true));
  select.addEventListener('change', () => applyFilters(true));
  form.addEventListener('reset', () => queueMicrotask(() => applyFilters(true)));
});
