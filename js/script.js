/* Aora Cucina · Demonstração conceitual
   JavaScript puro, sem dependências. */
(function () {
  'use strict';

  /* ============================================================
     CONFIGURAÇÃO
     ============================================================ */
  var CONFIG = {
    // WhatsApp para reservas (formato internacional, só dígitos).
    // Fonte: descrição da página do restaurante no Facebook; também citado por QuintoAndar e BenditoGuia.
    // CONFIRME COM O RESTAURANTE ANTES DE PUBLICAR. Para desativar o WhatsApp, deixe ''.
    whatsappNumber: '5551991199387',
    whatsappMessage: 'Olá! Gostaria de fazer uma reserva no Aora Cucina.',

    // Mude para true depois de colocar fotos reais em assets/images/photos/ (veja o README da pasta).
    usePhotos: false
  };

  /* ============================================================
     CARDÁPIO
     Itens citados em fontes públicas (Wanderlog, QuintoAndar), NÃO é o cardápio oficial.
     Substituir pelo cardápio oficial, quando o restaurante fornecer.
     ============================================================ */
  var MENU_CATEGORIES = [
    { id: 'entradas',   label: 'Entradas' },
    { id: 'massas',     label: 'Massas frescas' },
    { id: 'principais', label: 'Pratos principais' },
    { id: 'sobremesas', label: 'Sobremesas' },
    { id: 'bebidas',    label: 'Bebidas' }
  ];

  var MENU_ITEMS = [
    { cat: 'entradas',   name: '[ENTRADAS A CONFIRMAR]',     desc: 'Nenhum item verificado em fontes públicas. Preencher com o cardápio oficial.', todo: true },
    { cat: 'massas',     name: 'Lasagna al bolognese',        desc: 'Clássico da cozinha italiana citado em guia público sobre o restaurante.' },
    { cat: 'massas',     name: 'Massa com almôndegas ao molho de tomate', desc: 'Prato citado em guia público sobre o restaurante.' },
    { cat: 'principais', name: 'Paleta de cordeiro assada, com massa longa na manteiga e sálvia', desc: 'Sugestão citada em matéria do QuintoAndar. Confirmar disponibilidade.' },
    { cat: 'sobremesas', name: '[SOBREMESAS A CONFIRMAR]',   desc: 'Nenhum item verificado em fontes públicas. Preencher com o cardápio oficial.', todo: true },
    { cat: 'bebidas',    name: 'Drinks clássicos',           desc: 'Citados em guia público sobre o restaurante.' },
    { cat: 'bebidas',    name: 'Carta de vinhos selecionada', desc: 'Citada em guia público sobre o restaurante.' }
  ];

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- Imagens ---------- */
  function initPhotos() {
    qsa('.photo img').forEach(function (img) {
      var wrap = img.closest('.photo');
      // Se uma imagem falhar, esconde o ícone quebrado e mantém o fundo de reserva.
      img.addEventListener('error', function () { if (wrap) wrap.classList.add('is-missing'); });
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) wrap.classList.add('is-missing');
    });

    if (!CONFIG.usePhotos) return;

    // Troca a ilustração pela foto real, se o arquivo existir.
    qsa('img[data-photo]').forEach(function (img) {
      var probe = new Image();
      probe.onload = function () {
        img.src = probe.src;
        if (img.dataset.photoAlt) img.alt = img.dataset.photoAlt;
        var wrap = img.closest('.photo');
        if (wrap) {
          wrap.classList.remove('is-missing');
          var badge = qs('.photo__badge', wrap);
          if (badge) badge.textContent = 'Foto ilustrativa';
        }
      };
      probe.src = img.dataset.photo;
    });
  }

  /* ---------- Menu mobile ---------- */
  function initNav() {
    var toggle = qs('.nav-toggle');
    var nav = qs('#menu-principal');
    if (!toggle || !nav) return;
    var label = qs('.visually-hidden', toggle);

    function setOpen(open, returnFocus) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Fechar menu' : 'Abrir menu';
      if (!open && returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    window.matchMedia('(min-width: 860px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ---------- Rolagem suave (só para âncoras internas) ---------- */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = qs(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      if (history.pushState) history.pushState(null, '', id);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ---------- Animações de entrada ---------- */
  function initReveal() {
    var items = qsa('.reveal');
    if (!items.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Cardápio com filtros ---------- */
  function initMenu() {
    var filters = qs('#menu-filters');
    var list = qs('#menu-list');
    var status = qs('#menu-status');
    if (!filters || !list) return;

    var current = 'todos';
    var catLabel = {};
    MENU_CATEGORIES.forEach(function (c) { catLabel[c.id] = c.label; });

    function el(tag, cls, text) {
      var node = document.createElement(tag);
      if (cls) node.className = cls;
      if (text) node.textContent = text;
      return node;
    }

    function render() {
      list.innerHTML = '';
      var shown = MENU_ITEMS.filter(function (it) { return current === 'todos' || it.cat === current; });
      shown.forEach(function (it) {
        var li = el('li', 'menu-card');
        li.appendChild(el('span', 'menu-card__cat', catLabel[it.cat]));
        var name = el('h3', 'menu-card__name');
        if (it.todo) name.appendChild(el('span', 'todo', it.name));
        else name.textContent = it.name;
        li.appendChild(name);
        li.appendChild(el('p', 'menu-card__desc', it.desc));
        list.appendChild(li);
      });
      if (status) {
        var label = current === 'todos' ? 'todas as categorias' : catLabel[current];
        status.textContent = shown.length + ' itens exibidos em ' + label + '.';
      }
    }

    function setFilter(id) {
      current = id;
      qsa('.chip', filters).forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.filter === id));
      });
      render();
    }

    [{ id: 'todos', label: 'Todos' }].concat(MENU_CATEGORIES).forEach(function (c) {
      var b = el('button', 'chip', c.label);
      b.type = 'button';
      b.dataset.filter = c.id;
      b.setAttribute('aria-pressed', String(c.id === 'todos'));
      b.addEventListener('click', function () { setFilter(c.id); });
      filters.appendChild(b);
    });
    render();
  }

  /* ---------- Galeria com visualização ampliada ---------- */
  function initGallery() {
    var buttons = qsa('.gallery__item');
    var box = qs('#lightbox');
    if (!buttons.length || !box || typeof box.showModal !== 'function') return;

    var media = qs('#lightbox-media');
    var caption = qs('#lightbox-caption');
    var index = 0;

    function show(i) {
      index = (i + buttons.length) % buttons.length;
      var btn = buttons[index];
      var img = qs('img', btn);
      var badge = qs('.photo__badge', btn);
      media.innerHTML = '';
      var big = document.createElement('img');
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      media.appendChild(big);
      caption.textContent = (btn.dataset.caption || '') + (badge ? ' · ' + badge.textContent : '');
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { show(i); box.showModal(); });
    });
    qs('.lightbox__close', box).addEventListener('click', function () { box.close(); });
    qs('.lightbox__prev', box).addEventListener('click', function () { show(index - 1); });
    qs('.lightbox__next', box).addEventListener('click', function () { show(index + 1); });

    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      // Esc fecha nativamente via <dialog>.
    });
    // Clique no fundo escuro fecha
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target === qs('.lightbox__figure', box)) box.close();
    });
  }

  /* ---------- WhatsApp ---------- */
  function initWhatsApp() {
    var number = CONFIG.whatsappNumber.replace(/\D/g, '');
    var ready = number.length >= 12 && number.length <= 13;

    function waLink(text) { return 'https://wa.me/' + number + '?text=' + encodeURIComponent(text); }

    var note = qs('#wa-config-note');
    var floatBtn = qs('#wa-float');
    var form = qs('#reserve-form');
    var msg = qs('#form-msg');

    if (ready) {
      qsa('[data-wa]').forEach(function (a) {
        a.href = waLink(CONFIG.whatsappMessage);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('aria-label', a.textContent.trim() + ' (abre o WhatsApp em nova aba)');
      });
      if (floatBtn) {
        floatBtn.href = waLink(CONFIG.whatsappMessage);
        floatBtn.hidden = false;
      }
    } else if (note) {
      var span = document.createElement('span');
      span.className = 'todo';
      span.textContent = '[NÚMERO OFICIAL DE WHATSAPP A CONFIRMAR]';
      note.appendChild(span);
    }

    if (!form) return;
    var dateInput = qs('#f-data');
    if (dateInput) {
      var t = new Date();
      dateInput.min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    }

    function setMsg(text, isError) {
      msg.textContent = text;
      msg.classList.toggle('is-error', !!isError);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      qsa('input[required]', form).forEach(function (f) {
        var ok = f.value.trim() !== '' && f.checkValidity();
        f.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid) {
        setMsg('Revise os campos destacados.', true);
        firstInvalid.focus();
        return;
      }
      if (!ready) {
        setMsg('O número de WhatsApp ainda não está configurado, então nada foi enviado.', true);
        return;
      }
      var d = new FormData(form);
      var parts = String(d.get('data')).split('-');
      var dataBr = parts[2] + '/' + parts[1] + '/' + parts[0];
      var obs = String(d.get('obs') || '').trim();
      var text = 'Olá! Gostaria de solicitar uma reserva no Aora Cucina.\n' +
        'Nome: ' + String(d.get('nome')).trim() + '\n' +
        'Data: ' + dataBr + '\n' +
        'Horário: ' + d.get('hora') + '\n' +
        'Pessoas: ' + d.get('pessoas') +
        (obs ? '\nObservações: ' + obs : '');
      setMsg('Abrindo o WhatsApp. A reserva só é válida após a confirmação do restaurante.', false);
      window.open(waLink(text), '_blank', 'noopener,noreferrer');
    });
  }

  /* ---------- Início ---------- */
  initPhotos();
  initNav();
  initSmoothScroll();
  initReveal();
  initMenu();
  initGallery();
  initWhatsApp();
})();