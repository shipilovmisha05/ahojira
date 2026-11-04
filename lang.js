/* ahojira.cz - выбор языка (Миша 04.11.26): при первом заходе экран с тремя кнопками - украинский, русский, чешский.
   Выбор помнится в браузере, все страницы дальше на этом языке; кнопка UA/RU/CZ в шапке открывает выбор заново.
   Ссылка с ?lang=uk / ?lang=ru / ?lang=cs открывает сразу нужный язык (например, стикер в сторис чешского аккаунта).
   Страница вызывает ahojLang(T, render): T = { uk: {...}, ru: {...}, cs: {...} } - тексты для [data-t="ключ"] и title,
   render(L) - перерисовать списки на языке L. */
(() => {
  const NAMES = { uk: 'Українська', ru: 'Русский', cs: 'Čeština' };
  const SHORT = { uk: 'UA', ru: 'RU', cs: 'CZ' };

  document.head.insertAdjacentHTML('beforeend', `<style>
  .lang { flex: 0 0 auto; height: 48px; padding: 0 16px; border: 0; border-radius: 999px; background: none; box-shadow: inset 0 0 0 1.5px var(--line);
    color: var(--cream); font: 600 16px Onest, system-ui, sans-serif; letter-spacing: .5px; cursor: pointer; }
  #pick { position: fixed; inset: 0; z-index: 40; display: grid; place-items: center; padding: 24px 16px; overflow-y: auto;
    background: radial-gradient(120% 60% at 50% 0%, rgba(176,106,72,.55), rgba(43,26,18,0) 70%), var(--choc); }
  #pick[hidden] { display: none; }
  #pick .pk { width: 100%; max-width: 420px; text-align: center; }
  #pick .ava { width: 112px; height: 112px; margin: 0 auto; }
  #pick h2 { margin-top: 18px; font-family: Corm; font-style: italic; font-weight: 600; font-size: 56px; line-height: 1; color: var(--peach); }
  #pick p { margin: 12px 0 30px; font-size: 16px; line-height: 1.6; color: var(--dim); }
  #pick button { display: flex; align-items: center; justify-content: space-between; width: 100%; height: 68px; margin-top: 12px; padding: 0 26px;
    border: 0; border-radius: 999px; background: var(--card); box-shadow: inset 0 0 0 1.5px var(--line); color: var(--cream);
    font: 600 21px Onest, system-ui, sans-serif; cursor: pointer; transition: transform .15s ease-out, background .15s; }
  #pick button:active { transform: scale(.98); }
  #pick button.on { background: var(--peach); color: var(--choc); }
  #pick button i { font-style: normal; font-size: 15px; letter-spacing: .5px; opacity: .6; }
  body.picking { overflow: hidden; }
  </style>`);

  window.ahojLang = (T, render) => {
    let saved = null;
    try { saved = localStorage.getItem('lang'); } catch (e) {}
    const q = new URLSearchParams(location.search).get('lang');
    let cur = NAMES[q] ? q : NAMES[saved] ? saved : null;

    const header = document.querySelector('header');
    const sw = document.createElement('button');
    sw.className = 'lang';
    header.insertBefore(sw, header.querySelector('.ig'));

    const pick = document.createElement('div');
    pick.id = 'pick';
    pick.hidden = true;
    pick.innerHTML = `<div class="pk">
      <div class="ava"><img src="${header.querySelector('.ava img').getAttribute('src')}" alt=""></div>
      <h2>Ahoj, Ira</h2>
      <p>Оберіть мову<br>Выберите язык<br>Vyberte jazyk</p>
      ${Object.keys(NAMES).map(L => `<button data-l="${L}">${NAMES[L]}<i>${SHORT[L]}</i></button>`).join('')}
    </div>`;
    document.body.appendChild(pick);

    const apply = L => {
      cur = L;
      document.documentElement.lang = L;
      document.title = T[L].title;
      document.querySelectorAll('[data-t]').forEach(el => el.textContent = T[L][el.dataset.t]);
      sw.textContent = SHORT[L];
      sw.setAttribute('aria-label', NAMES[L]);
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
    sw.onclick = () => show(true);

    if (cur) { save(cur); apply(cur); }
    else { apply('ru'); cur = null; show(true); }   // под экраном выбора страница по-русски, но кнопка не подсвечена
  };
})();
