/* ahojira.cz - выбор языка (Миша 04.11.26): при первом заходе экран с тремя кнопками - чешский, украинский, русский (порядок - Миша 04.11.26).
   Выбор помнится в браузере, все страницы дальше на этом языке; над шапкой три кнопки с флажками - сменить язык в один тап.
   Ссылка с ?lang=uk / ?lang=ru / ?lang=cs открывает сразу нужный язык (например, стикер в сторис чешского аккаунта).
   Страница вызывает ahojLang(T, render): T = { uk: {...}, ru: {...}, cs: {...} } - тексты для [data-t="ключ"] и title,
   render(L) - перерисовать списки на языке L. */
(() => {
  const NAMES = { cs: 'Čeština', uk: 'Українська', ru: 'Русский' };   // в этом порядке кнопки на экране выбора
  const SHORT = { cs: 'CZ', uk: 'UA', ru: 'RU' };
  // флажки картинкой, а не эмодзи: на Windows эмодзи-флаги показываются буквами
  const FLAG = {
    cs: '<svg viewBox="0 0 6 4"><rect width="6" height="4" fill="#D7141A"/><rect width="6" height="2" fill="#fff"/><path d="M0 0L3 2 0 4z" fill="#11457E"/></svg>',
    uk: '<svg viewBox="0 0 6 4"><rect width="6" height="4" fill="#FFD500"/><rect width="6" height="2" fill="#005BBB"/></svg>',
    ru: '<svg viewBox="0 0 6 4"><rect width="6" height="4" fill="#D52B1E"/><rect width="6" height="2.67" fill="#0039A6"/><rect width="6" height="1.33" fill="#fff"/></svg>',
  };

  document.head.insertAdjacentHTML('beforeend', `<style>
  .langs { display: flex; justify-content: flex-end; gap: 6px; padding-top: 14px; }
  .langs + header { padding-top: 12px; }
  .langs button { display: flex; align-items: center; gap: 7px; height: 36px; padding: 0 12px; border: 0; border-radius: 999px; background: none;
    box-shadow: inset 0 0 0 1.5px var(--line); color: var(--dim); font: 600 14px Onest, system-ui, sans-serif; letter-spacing: .5px; cursor: pointer; }
  .langs button.on { background: var(--peach); box-shadow: none; color: var(--choc); }
  .langs svg, #pick svg { flex: 0 0 auto; width: 21px; height: 14px; border-radius: 3px; box-shadow: 0 0 0 1px rgba(0,0,0,.25); }
  #pick { position: fixed; inset: 0; z-index: 40; display: grid; place-items: center; padding: 24px 16px; overflow-y: auto;
    background: radial-gradient(120% 60% at 50% 0%, rgba(176,106,72,.55), rgba(43,26,18,0) 70%), var(--choc); }
  #pick[hidden] { display: none; }
  #pick .pk { width: 100%; max-width: 420px; text-align: center; }
  #pick .ava { width: 112px; height: 112px; margin: 0 auto; }
  #pick h2 { margin-top: 18px; font-family: Corm; font-style: italic; font-weight: 600; font-size: 56px; line-height: 1; color: var(--peach); }
  #pick p { margin: 12px 0 30px; font-size: 16px; line-height: 1.6; color: var(--dim); }
  #pick button { display: flex; align-items: center; gap: 16px; width: 100%; height: 68px; margin-top: 12px; padding: 0 26px;
    border: 0; border-radius: 999px; background: var(--card); box-shadow: inset 0 0 0 1.5px var(--line); color: var(--cream);
    font: 600 21px Onest, system-ui, sans-serif; cursor: pointer; transition: transform .15s ease-out, background .15s; }
  #pick button:active { transform: scale(.98); }
  #pick button.on { background: var(--peach); color: var(--choc); }
  #pick svg { width: 33px; height: 22px; border-radius: 4px; }
  body.picking { overflow: hidden; }
  </style>`);

  window.ahojLang = (T, render) => {
    let saved = null;
    try { saved = localStorage.getItem('lang'); } catch (e) {}
    const q = new URLSearchParams(location.search).get('lang');
    let cur = NAMES[q] ? q : NAMES[saved] ? saved : null;

    const header = document.querySelector('header');
    const bar = document.createElement('div');
    bar.className = 'langs';
    bar.innerHTML = Object.keys(NAMES).map(L => `<button data-l="${L}" aria-label="${NAMES[L]}">${FLAG[L]}${SHORT[L]}</button>`).join('');
    header.before(bar);

    const pick = document.createElement('div');
    pick.id = 'pick';
    pick.hidden = true;
    pick.innerHTML = `<div class="pk">
      <div class="ava"><img src="${header.querySelector('.ava img').getAttribute('src')}" alt=""></div>
      <h2>Ahoj, Ira</h2>
      <p>Vyberte jazyk<br>Оберіть мову<br>Выберите язык</p>
      ${Object.keys(NAMES).map(L => `<button data-l="${L}">${FLAG[L]}${NAMES[L]}</button>`).join('')}
    </div>`;
    document.body.appendChild(pick);

    const apply = L => {
      cur = L;
      document.documentElement.lang = L;
      document.title = T[L].title;
      document.querySelectorAll('[data-t]').forEach(el => el.textContent = T[L][el.dataset.t]);
      bar.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.l === L));
      // два аккаунта Иры: чешская версия ведёт в @ahoj_ira_cz, укр и рус - в @ahoj_ira
      const IG = L === 'cs' ? 'ahoj_ira_cz' : 'ahoj_ira';
      document.querySelectorAll('a.ig, a.ig2').forEach(a => a.href = `https://www.instagram.com/${IG}/`);
      const ig2 = document.querySelector('.ig2');
      if (ig2) ig2.lastChild.textContent = ` @${IG} `;
      render(L);
    };
    const show = on => {
      pick.hidden = !on;
      document.body.classList.toggle('picking', on);
      pick.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.l === cur));
    };
    const save = L => { try { localStorage.setItem('lang', L); } catch (e) {} };

    pick.querySelectorAll('button').forEach(b => b.onclick = () => {
      const L = b.dataset.l;
      save(L);
      if (window.umami) umami.track('язык: ' + NAMES[L]);
      apply(L);
      show(false);
      scrollTo(0, 0);
    });
    bar.querySelectorAll('button').forEach(b => b.onclick = () => {
      const L = b.dataset.l;
      if (L === cur) return;
      save(L);
      if (window.umami) umami.track('язык (шапка): ' + NAMES[L]);
      apply(L);
    });

    if (cur) { save(cur); apply(cur); }
    else { apply('ru'); cur = null; show(true); }   // под экраном выбора страница по-русски, но кнопка не подсвечена
  };
})();
