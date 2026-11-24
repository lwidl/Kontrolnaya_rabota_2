// Учебный интерфейс без серверной отправки и хранения персональных данных.
'use strict';
document.documentElement.classList.add('js');
const modelData = {"iphone": {"name": "iPhone 17 Pro", "price": 119990}, "iphone13pro": {"name": "iPhone 13 Pro", "price": 69990}, "iphonex": {"name": "iPhone X", "price": 24990}, "samsung": {"name": "Samsung Galaxy A54", "price": 42990}, "galaxys10": {"name": "Samsung Galaxy S10", "price": 29990}, "galaxys8": {"name": "Samsung Galaxy S8", "price": 17990}, "redmi": {"name": "Redmi Note 11 Pro", "price": 27990}, "redminote13": {"name": "Redmi Note 13", "price": 22990}, "redmi13c": {"name": "Redmi 13C", "price": 12990}};
const formatPrice = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const menuButton = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
function closeMenu() {
  if (!menuButton) return;
  nav.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('is-open', !expanded);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (menuButton && !event.target.closest('.site-header')) closeMenu();
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
const desktopQuery = window.matchMedia('(min-width: 1024px)');
desktopQuery.addEventListener('change', closeMenu);
// Native dialog provides focus trapping, Escape and focus restoration.
const dialog = document.querySelector('dialog#order-dialog');
document.querySelectorAll('[data-open-dialog]').forEach(button => {
  button.addEventListener('click', () => {
    const select = dialog.querySelector('[name="model"]');
    select.value = button.dataset.model;
    dialog.querySelector('[data-form-message]').hidden = true;
    dialog.showModal();
  });
});
document.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
// Bootstrap's own focus management and dismissal handle the KR2 modal.
document.querySelector('.modal#order-dialog')?.addEventListener('show.bs.modal', event => {
  const select = event.target.querySelector('[name="model"]');
  select.value = event.relatedTarget?.dataset.model || '';
  event.target.querySelector('[data-form-message]').hidden = true;
});
document.querySelector('.modal#order-dialog')?.addEventListener('shown.bs.modal', event => {
  event.target.querySelector('[name="name"]').focus();
});
document.querySelectorAll('[data-demo-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const message = form.querySelector('[data-form-message]');
    message.textContent = form.dataset.formKind === 'contact'
      ? 'Сообщение заполнено корректно. Это демонстрация: отправка на сервер не выполняется.'
      : 'Заявка заполнена корректно. Это демонстрация: данные не отправлены на сервер.';
    message.hidden = false;
  });
  form.addEventListener('input', () => { form.querySelector('[data-form-message]').hidden = true; });
});
const orderSelect = document.getElementById('order-model');
function updateSummary() {
  if (!orderSelect) return;
  const model = modelData[orderSelect.value];
  document.querySelector('[data-selected-name]').textContent = model?.name || 'Выберите смартфон в форме';
  document.querySelector('[data-selected-price]').textContent = model ? formatPrice(model.price) : '—';
}
if (orderSelect) {
  const model = new URLSearchParams(location.search).get('model');
  if (Object.hasOwn(modelData, model)) orderSelect.value = model;
  orderSelect.addEventListener('change', updateSummary);
  updateSummary();
}
const filter = document.getElementById('catalog-filter');
if (filter) {
  const container = document.querySelector('[data-products]');
  const items = [...container.querySelectorAll('[data-product]')];
  const sort = document.getElementById('sort');
  const update = () => {
    const brand = filter.elements.brand.value;
    const memory = filter.elements.memory.value;
    const maxPrice = filter.elements['max-price'].value;
    let count = 0;
    items.forEach(item => {
      const matches = (brand === 'all' || item.dataset.brand === brand)
        && (memory === 'all' || item.dataset.memory === memory)
        && (maxPrice === '' || Number(item.dataset.price) <= Number(maxPrice));
      item.hidden = !matches;
      if (matches) count++;
    });
    const sorted = [...items];
    if (sort.value !== 'default') sorted.sort((a,b) => (Number(a.dataset.price)-Number(b.dataset.price))*(sort.value === 'price-up' ? 1 : -1));
    sorted.forEach(item => container.append(item));
    document.querySelector('[data-result-count]').textContent = 'Найдено моделей: ' + count;
    document.querySelector('[data-empty]').hidden = count > 0;
  };
  filter.addEventListener('submit', event => { event.preventDefault(); update(); });
  filter.addEventListener('change', update);
  filter.addEventListener('reset', () => { sort.value = 'default'; setTimeout(update, 0); });
  sort.addEventListener('change', update);
}
